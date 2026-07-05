use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClipboardFormatInfo {
    pub raw_formats: Vec<String>,
    pub normalized_formats: Vec<String>,
    pub has_text: bool,
    pub has_html: bool,
    pub has_rtf: bool,
    pub has_image: bool,
    pub has_files: bool,
    pub platform: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContentSignal {
    pub kind: String,
    pub confidence: String,
    pub language: Option<String>,
    pub range: Option<Value>,
    pub metadata: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClipboardItem {
    pub id: String,
    #[serde(rename = "type")]
    pub item_type: String,
    pub title: String,
    pub preview_text: String,
    pub content_text: Option<String>,
    pub content_html: Option<String>,
    pub content_rtf: Option<String>,
    pub image_path: Option<String>,
    pub thumbnail_path: Option<String>,
    pub file_paths: Vec<String>,
    pub format_info: ClipboardFormatInfo,
    pub content_signals: Vec<ContentSignal>,
    pub url: Option<String>,
    pub code_language: Option<String>,
    pub source_app: Option<String>,
    pub size_bytes: i64,
    pub content_hash: String,
    pub is_pinned: bool,
    pub is_favorite: bool,
    pub is_deleted: bool,
    pub created_at: String,
    pub updated_at: String,
    pub last_used_at: Option<String>,
    pub deleted_at: Option<String>,
}

#[derive(Debug, Clone)]
pub struct ClipboardItemInput {
    pub item_type: String,
    pub title: String,
    pub preview_text: String,
    pub content_text: Option<String>,
    pub content_html: Option<String>,
    pub content_rtf: Option<String>,
    pub image_path: Option<String>,
    pub thumbnail_path: Option<String>,
    pub file_paths: Vec<String>,
    pub format_info: ClipboardFormatInfo,
    pub content_signals: Vec<ContentSignal>,
    pub url: Option<String>,
    pub code_language: Option<String>,
    pub source_app: Option<String>,
    pub size_bytes: i64,
    pub content_hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub start_at_login: bool,
    pub show_tray_icon: bool,
    pub wheel_position: String,
    pub wheel_item_count: i64,
    pub theme: String,
    pub capture_plain_text: bool,
    pub capture_rich_text: bool,
    pub capture_images: bool,
    pub capture_files: bool,
    pub capture_code: bool,
    pub ignore_duplicates: bool,
    pub max_history_items: i64,
    pub max_image_size_mb: i64,
    pub auto_delete_after_days: i64,
    pub pause_capture: bool,
    pub ignored_source_apps: Vec<String>,
    pub clear_clipboard_on_quit: bool,
    pub auto_paste: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            start_at_login: false,
            show_tray_icon: true,
            wheel_position: "center".into(),
            wheel_item_count: 8,
            theme: "dark".into(),
            capture_plain_text: true,
            capture_rich_text: true,
            capture_images: true,
            capture_files: true,
            capture_code: true,
            ignore_duplicates: true,
            max_history_items: 5000,
            max_image_size_mb: 25,
            auto_delete_after_days: 0,
            pause_capture: false,
            ignored_source_apps: vec![
                "1Password".into(),
                "Bitwarden".into(),
                "KeePass".into(),
                "Dashlane".into(),
                "LastPass".into(),
            ],
            clear_clipboard_on_quit: false,
            auto_paste: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct HistoryQuery {
    pub search: Option<String>,
    #[serde(rename = "type")]
    pub item_type: Option<String>,
    pub date_filter: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub include_deleted: Option<bool>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CleanupRequest {
    pub mode: String,
    pub include_pinned: Option<bool>,
    pub older_than: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    #[serde(rename = "type")]
    pub item_type: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CleanupJob {
    pub id: String,
    pub action: String,
    pub criteria_json: String,
    pub deleted_count: i64,
    pub created_at: String,
}

pub fn default_format_info(platform: &str) -> ClipboardFormatInfo {
    ClipboardFormatInfo {
        raw_formats: Vec::new(),
        normalized_formats: Vec::new(),
        has_text: false,
        has_html: false,
        has_rtf: false,
        has_image: false,
        has_files: false,
        platform: platform.into(),
    }
}
