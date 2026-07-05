mod clipboard_service;
mod commands;
mod detection;
mod media;
mod models;
mod repository;

use anyhow::Result;
use tauri::{AppHandle, Emitter, Manager, WebviewWindow};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

use clipboard_service::ClipboardService;
use repository::ClipRepository;

pub struct AppState {
    repository: ClipRepository,
    clipboard: ClipboardService,
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
            commands::save_transformed_item,
            commands::get_settings,
            commands::update_settings,
            commands::cleanup,
            commands::clear_system_clipboard,
            commands::get_image_data_url,
            commands::show_window,
            commands::close_wheel,
        ])
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir()?;
            let repository = ClipRepository::new(&app_data_dir)?;
            let clipboard = ClipboardService::new(repository.clone(), app.handle().clone());
            let state = AppState { repository, clipboard: clipboard.clone() };
            app.manage(state);
            clipboard.start();
            register_shortcut(app.handle());
            setup_windows(app.handle())?;
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
                    if state.repository.get_settings().map(|s| s.clear_clipboard_on_quit).unwrap_or(false) {
                        let _ = state.clipboard.clear_system_clipboard();
                    }
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
        position_wheel_window(&window)?;
        window.emit("wheel-opened", ())?;
    }
    window.show()?;
    window.set_focus()?;
    Ok(())
}

fn setup_windows(app: &AppHandle) -> Result<()> {
    if let Some(main) = app.get_webview_window("main") {
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

fn position_wheel_window(window: &WebviewWindow) -> Result<()> {
    if let Some(monitor) = window.current_monitor()? {
        let size = monitor.size();
        let position = monitor.position();
        let x = position.x + (size.width as i32 / 2) - 680;
        let y = position.y + (size.height as i32 / 2) - 380;
        window.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }))?;
    }
    Ok(())
}

fn register_shortcut(app: &AppHandle) {
    let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyV);
    if let Err(error) = app.global_shortcut().register(shortcut) {
        eprintln!("Unable to register ClipWheel shortcut: {error}");
    }
}
