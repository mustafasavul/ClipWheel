use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

const TRAY_ID: &str = "clipwheel-tray";
const RECENT_CAPTURE_MENU_PREFIX: &str = "recent-capture:";
const RECENT_CAPTURE_LIMIT: i64 = 5;

pub fn sync_tray_icon(app: &AppHandle) -> tauri::Result<()> {
    let show_tray_icon = app
        .try_state::<crate::AppState>()
        .and_then(|state| state.repository.get_settings().ok())
        .map(|settings| settings.show_tray_icon)
        .unwrap_or(true);

    if show_tray_icon {
        ensure_tray_icon(app)
    } else {
        remove_tray_icon(app);
        crate::show_window(app, "main").map_err(tauri::Error::Anyhow)
    }
}

fn ensure_tray_icon(app: &AppHandle) -> tauri::Result<()> {
    if app.tray_by_id(TRAY_ID).is_some() {
        refresh_tray_menu(app)?;
        return Ok(());
    }

    let menu = build_tray_menu(app)?;
    let icon = app
        .default_window_icon()
        .cloned()
        .ok_or_else(|| tauri::Error::Anyhow(anyhow::anyhow!("missing default window icon")))?;

    TrayIconBuilder::with_id(TRAY_ID)
        .tooltip("ClipWheel")
        .icon(icon)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "open" => {
                let _ = crate::show_window(app, "history");
            }
            "settings" => {
                let _ = crate::show_window(app, "settings");
            }
            "wheel" => {
                let _ = crate::show_window(app, "wheel");
            }
            "quit" => app.exit(0),
            id if id.starts_with(RECENT_CAPTURE_MENU_PREFIX) => {
                let item_id = id.trim_start_matches(RECENT_CAPTURE_MENU_PREFIX);
                let _ = restore_recent_capture(app, item_id);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if matches!(
                event,
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                }
            ) {
                let _ = crate::show_window(tray.app_handle(), "wheel");
            }
        })
        .build(app)?;

    Ok(())
}

pub fn refresh_tray_menu(app: &AppHandle) -> tauri::Result<()> {
    if let Some(tray) = app.tray_by_id(TRAY_ID) {
        tray.set_menu(Some(build_tray_menu(app)?))?;
    }
    Ok(())
}

fn build_tray_menu(app: &AppHandle) -> tauri::Result<Menu<tauri::Wry>> {
    let open = MenuItem::with_id(app, "open", "Open ClipWheel", true, None::<&str>)?;
    let wheel = MenuItem::with_id(app, "wheel", "Open Wheel", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Quit ClipWheel", true, None::<&str>)?;

    let recent_captures = build_recent_captures_submenu(app)?;
    Menu::with_items(
        app,
        &[
            &open,
            &wheel,
            &settings,
            &recent_captures,
            &separator,
            &quit,
        ],
    )
}

fn build_recent_captures_submenu(app: &AppHandle) -> tauri::Result<Submenu<tauri::Wry>> {
    let items = app
        .try_state::<crate::AppState>()
        .and_then(|state| {
            state
                .repository
                .list_recent_captures(RECENT_CAPTURE_LIMIT)
                .ok()
        })
        .unwrap_or_default();

    if items.is_empty() {
        let empty = MenuItem::with_id(
            app,
            "recent-captures-empty",
            "No Recent Captures",
            false,
            None::<&str>,
        )?;
        return Submenu::with_id_and_items(
            app,
            "recent-captures",
            "Recent Captures",
            true,
            &[&empty],
        );
    }

    let menu_items = items
        .into_iter()
        .map(|item| {
            MenuItem::with_id(
                app,
                format!("{RECENT_CAPTURE_MENU_PREFIX}{}", item.id),
                recent_capture_label(&item),
                true,
                None::<&str>,
            )
        })
        .collect::<tauri::Result<Vec<_>>>()?;
    let item_refs = menu_items
        .iter()
        .map(|item| item as &dyn tauri::menu::IsMenuItem<tauri::Wry>)
        .collect::<Vec<_>>();

    Submenu::with_id_and_items(app, "recent-captures", "Recent Captures", true, &item_refs)
}

fn recent_capture_label(item: &crate::models::ClipboardItem) -> String {
    let fallback = match item.item_type.as_str() {
        "image" => "Image",
        "file_reference" => "Files",
        "url" => item.url.as_deref().unwrap_or("URL"),
        _ => item.preview_text.as_str(),
    };
    let label = if item.title.trim().is_empty() {
        fallback
    } else {
        item.title.as_str()
    };
    truncate_menu_label(label)
}

fn truncate_menu_label(label: &str) -> String {
    const MAX_CHARS: usize = 48;
    let sanitized = label.split_whitespace().collect::<Vec<_>>().join(" ");
    let mut chars = sanitized.chars();
    let truncated = chars.by_ref().take(MAX_CHARS).collect::<String>();
    if chars.next().is_some() {
        format!("{truncated}...")
    } else if truncated.is_empty() {
        "Untitled Capture".into()
    } else {
        truncated
    }
}

fn restore_recent_capture(app: &AppHandle, item_id: &str) -> tauri::Result<()> {
    let Some(state) = app.try_state::<crate::AppState>() else {
        return Ok(());
    };
    let item = state
        .repository
        .get_item(item_id)
        .map_err(tauri::Error::Anyhow)?;
    state
        .clipboard
        .restore(&item)
        .map_err(tauri::Error::Anyhow)?;
    app.emit("items-changed", ())?;
    crate::show_main_view(app, "history", None, Some(item_id)).map_err(tauri::Error::Anyhow)?;
    Ok(())
}

fn remove_tray_icon(app: &AppHandle) {
    let _ = app.remove_tray_by_id(TRAY_ID);
}
