use serde_json::Value;
use tauri::{AppHandle, Emitter, Manager};

use crate::{media, models::{CleanupJob, CleanupRequest, ClipboardItem, HistoryQuery, Settings}, AppState};

type CommandResult<T> = Result<T, String>;

#[tauri::command]
pub fn get_items(state: tauri::State<'_, AppState>, query: Option<HistoryQuery>) -> CommandResult<Vec<ClipboardItem>> {
    state.repository.list_items(query.unwrap_or_default()).map_err(to_string)
}

#[tauri::command]
pub fn count_items(state: tauri::State<'_, AppState>, query: Option<HistoryQuery>) -> CommandResult<i64> {
    state.repository.count_items(query.unwrap_or_default()).map_err(to_string)
}

#[tauri::command]
pub fn get_recent_wheel_items(state: tauri::State<'_, AppState>, count: Option<i64>) -> CommandResult<Vec<ClipboardItem>> {
    state.repository.list_items(HistoryQuery { limit: Some(count.unwrap_or_else(|| state.repository.get_settings().map(|s| s.wheel_item_count).unwrap_or(8))), ..Default::default() }).map_err(to_string)
}

#[tauri::command]
pub fn copy_item(app: AppHandle, state: tauri::State<'_, AppState>, id: String) -> CommandResult<()> {
    let item = state.repository.get_item(&id).map_err(to_string)?;
    state.clipboard.restore(&item).map_err(to_string)?;
    if let Some(window) = app.get_webview_window("wheel") {
        let _ = window.hide();
    }
    app.emit("items-changed", ()).map_err(to_string)?;
    Ok(())
}

#[tauri::command]
pub fn delete_item(app: AppHandle, state: tauri::State<'_, AppState>, id: String) -> CommandResult<()> {
    state.repository.soft_delete(&id).map_err(to_string)?;
    app.emit("items-changed", ()).map_err(to_string)?;
    Ok(())
}

#[tauri::command]
pub fn toggle_pin(app: AppHandle, state: tauri::State<'_, AppState>, id: String) -> CommandResult<ClipboardItem> {
    let item = state.repository.get_item(&id).map_err(to_string)?;
    let updated = state.repository.update_flags(&id, Some(!item.is_pinned), None).map_err(to_string)?;
    app.emit("items-changed", ()).map_err(to_string)?;
    Ok(updated)
}

#[tauri::command]
pub fn toggle_favorite(app: AppHandle, state: tauri::State<'_, AppState>, id: String) -> CommandResult<ClipboardItem> {
    let item = state.repository.get_item(&id).map_err(to_string)?;
    let updated = state.repository.update_flags(&id, None, Some(!item.is_favorite)).map_err(to_string)?;
    app.emit("items-changed", ()).map_err(to_string)?;
    Ok(updated)
}

#[tauri::command]
pub fn save_transformed_item(app: AppHandle, state: tauri::State<'_, AppState>, id: String, text: String, title: String) -> CommandResult<ClipboardItem> {
    use crate::{detection::{detect_clipboard_type, detect_content_signals, normalize_formats}, models::ClipboardItemInput};
    let source = state.repository.get_item(&id).map_err(to_string)?;
    let type_info = detect_clipboard_type(&text, None, false, &[]);
    let item_type = if source.item_type == "url" || source.item_type == "command" { source.item_type } else if type_info.item_type == "code" { "code".into() } else { "plain_text".into() };
    let item = state.repository.create_item(ClipboardItemInput {
        item_type,
        title,
        preview_text: text.chars().take(600).collect(),
        content_text: Some(text.clone()),
        content_html: None,
        content_rtf: None,
        image_path: None,
        thumbnail_path: None,
        file_paths: Vec::new(),
        format_info: normalize_formats(vec!["text/plain".into()], true, false, false, false, false),
        content_signals: detect_content_signals(&text, None, type_info.code_language.as_deref()),
        url: type_info.url,
        code_language: type_info.code_language,
        source_app: None,
        size_bytes: text.len() as i64,
        content_hash: format!("{}:{}", source.content_hash, chrono::Utc::now().timestamp_millis()),
    }).map_err(to_string)?;
    app.emit("items-changed", ()).map_err(to_string)?;
    Ok(item)
}

#[tauri::command]
pub fn get_settings(state: tauri::State<'_, AppState>) -> CommandResult<Settings> {
    state.repository.get_settings().map_err(to_string)
}

#[tauri::command]
pub fn update_settings(app: AppHandle, state: tauri::State<'_, AppState>, settings: Value) -> CommandResult<Settings> {
    let has_shortcuts_patch = settings.get("shortcuts").is_some();
    let next = state.repository.update_settings(settings).map_err(to_string)?;
    if has_shortcuts_patch {
        crate::register_shortcut(&app);
    }
    app.emit("items-changed", ()).map_err(to_string)?;
    Ok(next)
}

#[tauri::command]
pub fn set_shortcut_capture_active(app: AppHandle, active: bool) -> CommandResult<()> {
    crate::set_shortcut_capture_active(&app, active).map_err(to_string)
}

#[tauri::command]
pub fn cleanup(app: AppHandle, state: tauri::State<'_, AppState>, request: CleanupRequest) -> CommandResult<CleanupJob> {
    let job = state.repository.cleanup(request).map_err(to_string)?;
    app.emit("items-changed", ()).map_err(to_string)?;
    Ok(job)
}

#[tauri::command]
pub fn clear_system_clipboard(state: tauri::State<'_, AppState>) -> CommandResult<()> {
    state.clipboard.clear_system_clipboard().map_err(to_string)
}

#[tauri::command]
pub fn get_image_data_url(state: tauri::State<'_, AppState>, id: String) -> CommandResult<Option<String>> {
    let item = state.repository.get_item(&id).map_err(to_string)?;
    media::image_data_url(&item).map_err(to_string)
}

#[tauri::command]
pub fn show_window(app: AppHandle, name: String) -> CommandResult<()> {
    crate::show_window(&app, &name).map_err(to_string)
}

#[tauri::command]
pub fn close_wheel(app: AppHandle) -> CommandResult<()> {
    if let Some(window) = app.get_webview_window("wheel") {
        window.hide().map_err(to_string)?;
    }
    Ok(())
}

fn to_string(error: impl std::fmt::Display) -> String {
    error.to_string()
}
