use serde_json::Value;
use tauri::{AppHandle, Emitter, Manager};

use crate::{
    media,
    models::{
        clamp_wheel_item_count, CleanupJob, CleanupRequest, ClipboardItem, HistoryQuery, Settings,
    },
    AppState,
};

type CommandResult<T> = Result<T, String>;

#[tauri::command]
pub fn get_items(
    state: tauri::State<'_, AppState>,
    query: Option<HistoryQuery>,
) -> CommandResult<Vec<ClipboardItem>> {
    let query = query.unwrap_or_default();
    if query.collection_filter.as_deref() == Some("wheel") {
        return get_filtered_wheel_items(&state, &query);
    }
    state.repository.list_items(query).map_err(to_string)
}

#[tauri::command]
pub fn count_items(
    state: tauri::State<'_, AppState>,
    query: Option<HistoryQuery>,
) -> CommandResult<i64> {
    let query = query.unwrap_or_default();
    if query.collection_filter.as_deref() == Some("wheel") {
        let mut count_query = query;
        count_query.limit = None;
        count_query.offset = None;
        return get_filtered_wheel_items(&state, &count_query).map(|items| items.len() as i64);
    }
    state.repository.count_items(query).map_err(to_string)
}

#[tauri::command]
pub fn get_recent_wheel_items(
    state: tauri::State<'_, AppState>,
    count: Option<i64>,
) -> CommandResult<Vec<Option<ClipboardItem>>> {
    let settings = state.repository.get_settings().map_err(to_string)?;
    let limit = clamp_wheel_item_count(count.unwrap_or(settings.wheel_item_count)) as usize;
    Ok(settings
        .wheel_item_ids
        .iter()
        .take(limit)
        .map(|id| {
            if id.is_empty() {
                return None;
            }
            state
                .repository
                .get_item(id)
                .ok()
                .filter(|item| !item.is_deleted)
        })
        .collect())
}

#[tauri::command]
pub fn copy_item(
    app: AppHandle,
    state: tauri::State<'_, AppState>,
    id: String,
) -> CommandResult<()> {
    let item = state.repository.get_item(&id).map_err(to_string)?;
    state.clipboard.restore(&item).map_err(to_string)?;
    if let Some(window) = app.get_webview_window("wheel") {
        let _ = window.hide();
    }
    emit_items_changed(&app)?;
    Ok(())
}

#[tauri::command]
pub fn delete_item(
    app: AppHandle,
    state: tauri::State<'_, AppState>,
    id: String,
) -> CommandResult<()> {
    state.repository.soft_delete(&id).map_err(to_string)?;
    emit_items_changed(&app)?;
    Ok(())
}

#[tauri::command]
pub fn toggle_pin(
    app: AppHandle,
    state: tauri::State<'_, AppState>,
    id: String,
) -> CommandResult<ClipboardItem> {
    let item = state.repository.get_item(&id).map_err(to_string)?;
    let updated = state
        .repository
        .update_flags(&id, Some(!item.is_pinned), None)
        .map_err(to_string)?;
    emit_items_changed(&app)?;
    Ok(updated)
}

#[tauri::command]
pub fn toggle_favorite(
    app: AppHandle,
    state: tauri::State<'_, AppState>,
    id: String,
) -> CommandResult<ClipboardItem> {
    let item = state.repository.get_item(&id).map_err(to_string)?;
    let updated = state
        .repository
        .update_flags(&id, None, Some(!item.is_favorite))
        .map_err(to_string)?;
    emit_items_changed(&app)?;
    Ok(updated)
}

#[tauri::command]
pub fn update_item_title(
    app: AppHandle,
    state: tauri::State<'_, AppState>,
    id: String,
    title: String,
) -> CommandResult<ClipboardItem> {
    let updated = state
        .repository
        .update_item_title(&id, &title)
        .map_err(to_string)?;
    emit_items_changed(&app)?;
    Ok(updated)
}

#[tauri::command]
pub fn set_item_flag(
    app: AppHandle,
    state: tauri::State<'_, AppState>,
    id: String,
    flag: Option<String>,
) -> CommandResult<ClipboardItem> {
    let updated = state
        .repository
        .set_priority_flag(&id, flag)
        .map_err(to_string)?;
    emit_items_changed(&app)?;
    Ok(updated)
}

#[tauri::command]
pub fn save_transformed_item(
    app: AppHandle,
    state: tauri::State<'_, AppState>,
    id: String,
    text: String,
    title: String,
) -> CommandResult<ClipboardItem> {
    use crate::{
        detection::{detect_clipboard_type, detect_content_signals, normalize_formats},
        models::ClipboardItemInput,
    };
    let source = state.repository.get_item(&id).map_err(to_string)?;
    let type_info = detect_clipboard_type(&text, None, false, &[]);
    let item_type = if source.item_type == "url" || source.item_type == "command" {
        source.item_type
    } else if type_info.item_type == "code" {
        "code".into()
    } else {
        "plain_text".into()
    };
    let item = state
        .repository
        .create_item(ClipboardItemInput {
            item_type,
            title,
            preview_text: text.chars().take(600).collect(),
            content_text: Some(text.clone()),
            content_html: None,
            content_rtf: None,
            image_path: None,
            thumbnail_path: None,
            file_paths: Vec::new(),
            format_info: normalize_formats(
                vec!["text/plain".into()],
                true,
                false,
                false,
                false,
                false,
            ),
            content_signals: detect_content_signals(
                &text,
                None,
                type_info.code_language.as_deref(),
            ),
            url: type_info.url,
            code_language: type_info.code_language,
            source_app: None,
            size_bytes: text.len() as i64,
            content_hash: format!(
                "{}:{}",
                source.content_hash,
                chrono::Utc::now().timestamp_millis()
            ),
        })
        .map_err(to_string)?;
    emit_items_changed(&app)?;
    Ok(item)
}

#[tauri::command]
pub fn get_settings(state: tauri::State<'_, AppState>) -> CommandResult<Settings> {
    state.repository.get_settings().map_err(to_string)
}

#[tauri::command]
pub fn update_settings(
    app: AppHandle,
    state: tauri::State<'_, AppState>,
    settings: Value,
) -> CommandResult<Settings> {
    let has_shortcuts_patch = settings.get("shortcuts").is_some();
    let has_tray_patch = settings.get("showTrayIcon").is_some();
    let next = state
        .repository
        .update_settings(settings)
        .map_err(to_string)?;
    if has_shortcuts_patch {
        crate::register_shortcut(&app);
    }
    if has_tray_patch {
        crate::tray::sync_tray_icon(&app).map_err(to_string)?;
    }
    emit_items_changed(&app)?;
    Ok(next)
}

#[tauri::command]
pub fn set_shortcut_capture_active(app: AppHandle, active: bool) -> CommandResult<()> {
    crate::set_shortcut_capture_active(&app, active).map_err(to_string)
}

#[tauri::command]
pub fn cleanup(
    app: AppHandle,
    state: tauri::State<'_, AppState>,
    request: CleanupRequest,
) -> CommandResult<CleanupJob> {
    let job = state.repository.cleanup(request).map_err(to_string)?;
    emit_items_changed(&app)?;
    Ok(job)
}

#[tauri::command]
pub fn get_image_data_url(
    state: tauri::State<'_, AppState>,
    id: String,
) -> CommandResult<Option<String>> {
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

fn emit_items_changed(app: &AppHandle) -> CommandResult<()> {
    crate::tray::refresh_tray_menu(app).map_err(to_string)?;
    app.emit("items-changed", ()).map_err(to_string)
}

fn get_filtered_wheel_items(
    state: &tauri::State<'_, AppState>,
    query: &HistoryQuery,
) -> CommandResult<Vec<ClipboardItem>> {
    let settings = state.repository.get_settings().map_err(to_string)?;
    let mut items = settings
        .wheel_item_ids
        .iter()
        .filter(|id| !id.is_empty())
        .filter_map(|id| state.repository.get_item(id).ok())
        .filter(|item| matches_history_query(item, query))
        .collect::<Vec<_>>();
    let offset = query.offset.unwrap_or(0).max(0) as usize;
    let limit = query.limit.unwrap_or(500).max(0) as usize;
    if offset >= items.len() {
        return Ok(Vec::new());
    }
    let end = (offset + limit).min(items.len());
    Ok(items.drain(offset..end).collect())
}

fn matches_history_query(item: &ClipboardItem, query: &HistoryQuery) -> bool {
    if query.include_deleted != Some(true) && item.is_deleted {
        return false;
    }
    if let Some(item_type) = &query.item_type {
        if item_type != "all" && item.item_type != *item_type {
            return false;
        }
    }
    if let Some(search) = query
        .search
        .as_ref()
        .map(|value| value.trim().to_lowercase())
    {
        if !search.is_empty()
            && !item.title.to_lowercase().contains(&search)
            && !item.preview_text.to_lowercase().contains(&search)
            && !item
                .content_text
                .as_deref()
                .unwrap_or_default()
                .to_lowercase()
                .contains(&search)
            && !item
                .url
                .as_deref()
                .unwrap_or_default()
                .to_lowercase()
                .contains(&search)
        {
            return false;
        }
    }
    if let Some(flag) = query
        .flag_filter
        .as_ref()
        .filter(|value| !value.is_empty() && value.as_str() != "all")
    {
        if (flag == "none" && item.priority_flag.is_some())
            || (flag != "none" && item.priority_flag.as_deref() != Some(flag))
        {
            return false;
        }
    }
    match query.date_filter.as_deref() {
        Some("custom") => {
            if let Some(start) = &query.start_date {
                if item.created_at < *start {
                    return false;
                }
            }
            if let Some(end) = &query.end_date {
                if item.created_at > *end {
                    return false;
                }
            }
        }
        _ => {}
    }
    true
}
