#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod app_updates;
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
        .plugin(tauri_plugin_updater::Builder::new().build())
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
            commands::restore_item,
            commands::purge_item,
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
            commands::open_external_url,
            commands::close_wheel,
            app_updates::check_update,
            app_updates::install_update,
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
            app.manage(app_updates::PendingUpdate::default());
            clipboard.start();
            register_shortcut(app.handle());
            setup_windows(app.handle())?;
            tray::sync_tray_icon(app.handle())?;
            sync_autostart(app.handle());
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

/// Kaydedilen `startAtLogin` ayarini isletim sisteminin oturum acilis kaydina uygular.
/// macOS LaunchAgent, Windows Run kaydi ve Linux .desktop girdisi plugin tarafindan yonetilir.
pub fn sync_autostart(app: &AppHandle) {
    use tauri_plugin_autostart::ManagerExt;
    let Some(state) = app.try_state::<AppState>() else {
        return;
    };
    let Ok(settings) = state.repository.get_settings() else {
        return;
    };
    let manager = app.autolaunch();
    // Zaten istenen durumdaysa dokunma: enable() tekrari bazi platformlarda kaydi cogaltir.
    if manager.is_enabled().unwrap_or(false) == settings.start_at_login {
        return;
    }
    let result = if settings.start_at_login {
        manager.enable()
    } else {
        manager.disable()
    };
    if let Err(error) = result {
        eprintln!("Unable to sync ClipWheel autostart: {error}");
    }
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
    } else {
        let view = if name == "settings" {
            "settings"
        } else {
            "history"
        };
        window.emit(
            "main-navigation-requested",
            serde_json::json!({ "view": view }),
        )?;
    }
    window.show()?;
    window.set_focus()?;
    Ok(())
}

pub fn show_main_view(
    app: &AppHandle,
    view: &str,
    settings_tab: Option<&str>,
    selected_id: Option<&str>,
) -> Result<()> {
    let Some(window) = app.get_webview_window("main") else {
        return Ok(());
    };
    window.show()?;
    window.set_focus()?;

    let mut payload = serde_json::Map::new();
    payload.insert("view".into(), serde_json::Value::String(view.into()));
    if let Some(tab) = settings_tab {
        payload.insert("settingsTab".into(), serde_json::Value::String(tab.into()));
    }
    if let Some(id) = selected_id {
        payload.insert("selectedId".into(), serde_json::Value::String(id.into()));
    }
    window.emit(
        "main-navigation-requested",
        serde_json::Value::Object(payload),
    )?;
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
    let (current_width, current_height) = scaled_outer_size(window, monitor.scale_factor())?;
    let current_size = tauri::PhysicalSize {
        width: current_width as u32,
        height: current_height as u32,
    };
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
    // macOS'ta tao her degeri farkli bir olcekle cevirir: cursor_position() logical x primary
    // ekranin scale factor'i, monitor.position()/size() logical x kendi ekraninin scale factor'i,
    // monitor_from_point() ise dogrudan logical CGDisplayBounds ile karsilastirir. Bu yuzden
    // coklu monitorde tutarli olan tek uzay logical. Windows/Linux'ta tersi gecerli: sanal masaustu
    // fiziksel piksellerle tanimli, logical uzay tutarsiz. Tum matematigi tek uzayda yapiyoruz.
    let macos_space = cfg!(target_os = "macos");
    let cursor = app.cursor_position()?;
    let cursor_scale = if macos_space {
        app.primary_monitor()?
            .map(|monitor| monitor.scale_factor())
            .unwrap_or(1.0)
    } else {
        1.0
    };
    let cursor = (cursor.x / cursor_scale, cursor.y / cursor_scale);

    let monitor = app
        .monitor_from_point(cursor.0, cursor.1)?
        .or(window.current_monitor()?);
    let Some(monitor) = monitor else {
        return Ok(());
    };

    let monitor_scale = monitor.scale_factor();
    let space_scale = if macos_space { 1.0 } else { monitor_scale };
    let to_space = |value: f64| (value / monitor_scale * space_scale).round() as i32;

    let (window_width, window_height) = scaled_outer_size(window, space_scale)?;
    let monitor_size = monitor.size();
    let monitor_position = monitor.position();
    let (x, y) = wheel_target_position(
        wheel_position,
        cursor,
        (window_width, window_height),
        (
            to_space(monitor_position.x as f64),
            to_space(monitor_position.y as f64),
        ),
        (
            to_space(monitor_size.width as f64),
            to_space(monitor_size.height as f64),
        ),
    );

    window.set_position(if macos_space {
        tauri::Position::Logical(tauri::LogicalPosition {
            x: x as f64,
            y: y as f64,
        })
    } else {
        tauri::Position::Physical(tauri::PhysicalPosition { x, y })
    })?;
    Ok(())
}

fn wheel_target_position(
    wheel_position: &str,
    cursor: (f64, f64),
    window_size: (i32, i32),
    monitor_origin: (i32, i32),
    monitor_size: (i32, i32),
) -> (i32, i32) {
    let (window_width, window_height) = window_size;
    if wheel_position == "cursor" {
        clamp_window_position(
            (
                cursor.0.round() as i32 - window_width / 2,
                cursor.1.round() as i32 - window_height / 2,
            ),
            window_size,
            monitor_origin,
            monitor_size,
        )
    } else {
        (
            monitor_origin.0 + (monitor_size.0 - window_width) / 2,
            monitor_origin.1 + (monitor_size.1 - window_height) / 2,
        )
    }
}

// ponytail: outer_size() macOS'ta ilk show() oncesi logical deger dondurur (backingScaleFactor
// henuz hedef ekranin katsayisi degil). outer_size()/window.scale_factor() her zaman dogru logical
// boyutu verir; istenen uzayin olcegiyle carpip dogru boyutu turetiyoruz.
fn scaled_outer_size(window: &WebviewWindow, scale: f64) -> Result<(i32, i32)> {
    let logical = window
        .outer_size()?
        .to_logical::<f64>(window.scale_factor()?);
    Ok(scale_size((logical.width, logical.height), scale))
}

fn scale_size(logical: (f64, f64), scale: f64) -> (i32, i32) {
    (
        (logical.0 * scale).round() as i32,
        (logical.1 * scale).round() as i32,
    )
}

fn clamp_window_position(
    position: (i32, i32),
    window_size: (i32, i32),
    monitor_origin: (i32, i32),
    monitor_size: (i32, i32),
) -> (i32, i32) {
    let (x, y) = position;
    let (window_width, window_height) = window_size;
    let (monitor_x, monitor_y) = monitor_origin;
    let (monitor_width, monitor_height) = monitor_size;
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
    use super::{clamp_window_position, constrain_window_size, scale_size, wheel_target_position};

    #[test]
    fn centers_wheel_on_the_secondary_monitor() {
        // Ikinci monitor logical uzayda x=1512'den basliyor; teker orada ortalanmali.
        assert_eq!(
            wheel_target_position("center", (1800.0, 400.0), (1500, 900), (1512, 0), (1920, 1080)),
            (1722, 90)
        );
    }

    #[test]
    fn follows_cursor_onto_the_secondary_monitor() {
        assert_eq!(
            wheel_target_position("cursor", (2400.0, 600.0), (1500, 900), (1512, 0), (1920, 1080)),
            (1650, 150)
        );
        // Monitorun sag kenarina yakin imlec pencereyi o monitorun icinde tutar.
        assert_eq!(
            wheel_target_position("cursor", (3400.0, 1050.0), (1500, 900), (1512, 0), (1920, 1080)),
            (1932, 180)
        );
    }

    #[test]
    fn scales_logical_window_size_to_target_monitor() {
        assert_eq!(scale_size((1500.0, 900.0), 2.0), (3000, 1800));
        assert_eq!(scale_size((1500.0, 900.0), 1.0), (1500, 900));
        assert_eq!(scale_size((1500.0, 900.0), 1.5), (2250, 1350));
    }

    #[test]
    fn keeps_cursor_window_inside_monitor_bounds() {
        assert_eq!(
            clamp_window_position((100, 80), (400, 300), (0, 0), (1440, 900)),
            (100, 80)
        );
        assert_eq!(
            clamp_window_position((-120, -90), (400, 300), (0, 0), (1440, 900)),
            (0, 0)
        );
        assert_eq!(
            clamp_window_position((1300, 820), (400, 300), (0, 0), (1440, 900)),
            (1040, 600)
        );
    }

    #[test]
    fn pins_oversized_window_to_monitor_origin() {
        assert_eq!(
            clamp_window_position((40, 50), (1600, 1000), (100, 200), (1440, 900)),
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
