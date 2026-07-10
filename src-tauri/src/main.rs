mod clipboard_service;
mod commands;
mod detection;
mod media;
mod models;
mod repository;
mod tray;

use anyhow::Result;
use std::{
    str::FromStr,
    sync::atomic::{AtomicBool, Ordering},
};
use tauri::{AppHandle, Emitter, Manager, WebviewWindow};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

use clipboard_service::ClipboardService;
use repository::ClipRepository;

pub struct AppState {
    repository: ClipRepository,
    clipboard: ClipboardService,
    shortcut_capture_active: AtomicBool,
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        if app
                            .try_state::<AppState>()
                            .map(|state| state.shortcut_capture_active.load(Ordering::SeqCst))
                            .unwrap_or(false)
                        {
                            return;
                        }
                        let _ = show_window(app, "wheel");
                    }
                })
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            commands::get_items,
            commands::count_items,
            commands::get_recent_wheel_items,
            commands::copy_item,
            commands::delete_item,
            commands::toggle_pin,
            commands::toggle_favorite,
            commands::update_item_title,
            commands::set_item_flag,
            commands::save_transformed_item,
            commands::get_settings,
            commands::update_settings,
            commands::set_shortcut_capture_active,
            commands::cleanup,
            commands::get_image_data_url,
            commands::show_window,
            commands::close_wheel,
        ])
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir()?;
            let repository = ClipRepository::new(&app_data_dir)?;
            let clipboard = ClipboardService::new(
                repository.clone(),
                app.handle().clone(),
                app_data_dir.join("media"),
            );
            let state = AppState {
                repository,
                clipboard: clipboard.clone(),
                shortcut_capture_active: AtomicBool::new(false),
            };
            app.manage(state);
            clipboard.start();
            register_shortcut(app.handle());
            setup_windows(app.handle())?;
            tray::sync_tray_icon(app.handle())?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if let tauri::RunEvent::ExitRequested { .. } = event {
                if let Some(state) = app.try_state::<AppState>() {
                    state.clipboard.stop();
                }
            }
        });
}

pub fn show_window(app: &AppHandle, name: &str) -> Result<()> {
    let label = if name == "wheel" { "wheel" } else { "main" };
    let Some(window) = app.get_webview_window(label) else {
        return Ok(());
    };
    if label == "wheel" {
        let wheel_position = app
            .try_state::<AppState>()
            .and_then(|state| state.repository.get_settings().ok())
            .map(|settings| settings.wheel_position)
            .unwrap_or_else(|| "center".into());
        position_wheel_window(app, &window, &wheel_position)?;
        window.emit("wheel-opened", ())?;
    }
    window.show()?;
    window.set_focus()?;
    Ok(())
}

fn setup_windows(app: &AppHandle) -> Result<()> {
    if let Some(main) = app.get_webview_window("main") {
        fit_main_window_to_monitor(&main)?;
        main.show()?;
    }
    if let Some(wheel) = app.get_webview_window("wheel") {
        let wheel_for_blur = wheel.clone();
        wheel.on_window_event(move |event| {
            if matches!(event, tauri::WindowEvent::Focused(false)) {
                let _ = wheel_for_blur.hide();
            }
        });
    }
    Ok(())
}

fn fit_main_window_to_monitor(window: &WebviewWindow) -> Result<()> {
    let Some(monitor) = window.current_monitor()? else {
        return Ok(());
    };
    let current_size = window.outer_size()?;
    let monitor_size = monitor.size();
    let monitor_position = monitor.position();
    let (width, height) = constrain_window_size(
        current_size.width,
        current_size.height,
        monitor_size.width,
        monitor_size.height,
    );

    if width != current_size.width || height != current_size.height {
        window.set_size(tauri::Size::Physical(tauri::PhysicalSize { width, height }))?;
    }

    let x = monitor_position.x + ((monitor_size.width as i32 - width as i32) / 2).max(0);
    let y = monitor_position.y + ((monitor_size.height as i32 - height as i32) / 2).max(0);
    window.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }))?;
    Ok(())
}

fn constrain_window_size(
    requested_width: u32,
    requested_height: u32,
    monitor_width: u32,
    monitor_height: u32,
) -> (u32, u32) {
    let max_width = monitor_width.saturating_sub(48).max(820).min(monitor_width);
    let max_height = monitor_height
        .saturating_sub(72)
        .max(560)
        .min(monitor_height);
    (
        requested_width.min(max_width),
        requested_height.min(max_height),
    )
}

fn position_wheel_window(
    app: &AppHandle,
    window: &WebviewWindow,
    wheel_position: &str,
) -> Result<()> {
    let window_size = window.outer_size()?;
    let half_width = window_size.width as i32 / 2;
    let half_height = window_size.height as i32 / 2;

    let cursor = app.cursor_position()?;
    let monitor = app
        .monitor_from_point(cursor.x, cursor.y)?
        .or(window.current_monitor()?);
    let Some(monitor) = monitor else {
        return Ok(());
    };

    let monitor_size = monitor.size();
    let monitor_position = monitor.position();
    let (x, y) = if wheel_position == "cursor" {
        clamp_window_position(
            cursor.x.round() as i32 - half_width,
            cursor.y.round() as i32 - half_height,
            window_size.width as i32,
            window_size.height as i32,
            monitor_position.x,
            monitor_position.y,
            monitor_size.width as i32,
            monitor_size.height as i32,
        )
    } else {
        (
            monitor_position.x + (monitor_size.width as i32 / 2) - half_width,
            monitor_position.y + (monitor_size.height as i32 / 2) - half_height,
        )
    };

    window.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }))?;
    Ok(())
}

fn clamp_window_position(
    x: i32,
    y: i32,
    window_width: i32,
    window_height: i32,
    monitor_x: i32,
    monitor_y: i32,
    monitor_width: i32,
    monitor_height: i32,
) -> (i32, i32) {
    let max_x = monitor_x + monitor_width - window_width;
    let max_y = monitor_y + monitor_height - window_height;
    let clamped_x = if max_x < monitor_x {
        monitor_x
    } else {
        x.clamp(monitor_x, max_x)
    };
    let clamped_y = if max_y < monitor_y {
        monitor_y
    } else {
        y.clamp(monitor_y, max_y)
    };
    (clamped_x, clamped_y)
}

pub fn register_shortcut(app: &AppHandle) {
    if let Some(state) = app.try_state::<AppState>() {
        state.shortcut_capture_active.store(false, Ordering::SeqCst);
    }
    if let Err(error) = app.global_shortcut().unregister_all() {
        eprintln!("Unable to unregister ClipWheel shortcuts: {error}");
    }
    let shortcut_value = app
        .try_state::<AppState>()
        .and_then(|state| state.repository.get_settings().ok())
        .map(|settings| settings.shortcuts.open_wheel)
        .unwrap_or_else(|| "CmdOrCtrl+Shift+V".into());
    match Shortcut::from_str(shortcut_value.trim()) {
        Ok(shortcut) => {
            if let Err(error) = app.global_shortcut().register(shortcut) {
                eprintln!("Unable to register ClipWheel shortcut '{shortcut_value}': {error}");
            }
        }
        Err(error) => {
            eprintln!("Invalid ClipWheel shortcut '{shortcut_value}': {error}");
        }
    }
}

pub fn set_shortcut_capture_active(app: &AppHandle, active: bool) -> Result<()> {
    if let Some(state) = app.try_state::<AppState>() {
        state
            .shortcut_capture_active
            .store(active, Ordering::SeqCst);
    }
    if active {
        app.global_shortcut().unregister_all()?;
    } else {
        register_shortcut(app);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{clamp_window_position, constrain_window_size};

    #[test]
    fn keeps_cursor_window_inside_monitor_bounds() {
        assert_eq!(
            clamp_window_position(100, 80, 400, 300, 0, 0, 1440, 900),
            (100, 80)
        );
        assert_eq!(
            clamp_window_position(-120, -90, 400, 300, 0, 0, 1440, 900),
            (0, 0)
        );
        assert_eq!(
            clamp_window_position(1300, 820, 400, 300, 0, 0, 1440, 900),
            (1040, 600)
        );
    }

    #[test]
    fn pins_oversized_window_to_monitor_origin() {
        assert_eq!(
            clamp_window_position(40, 50, 1600, 1000, 100, 200, 1440, 900),
            (100, 200)
        );
    }

    #[test]
    fn constrains_main_window_to_monitor_with_margin() {
        assert_eq!(constrain_window_size(1280, 820, 1440, 900), (1280, 820));
        assert_eq!(constrain_window_size(1280, 820, 1160, 760), (1112, 688));
    }

    #[test]
    fn keeps_main_window_usable_on_small_monitors() {
        assert_eq!(constrain_window_size(1280, 820, 800, 540), (800, 540));
    }
}
