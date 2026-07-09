use serde::{Deserialize, Serialize};
use serde_json::Value;

pub const MIN_WHEEL_ITEMS: i64 = 4;
pub const DEFAULT_WHEEL_ITEMS: i64 = 8;
pub const MAX_WHEEL_ITEMS: i64 = 12;

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
    #[serde(default)]
    pub wheel_item_ids: Vec<String>,
    pub theme: String,
    #[serde(default = "default_language")]
    pub language: String,
    #[serde(default)]
    pub shortcuts: ShortcutSettings,
    pub wheel_appearance: WheelAppearanceSettings,
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
    pub auto_paste: bool,
}

fn default_language() -> String {
    "system".into()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShortcutSettings {
    #[serde(default = "default_open_wheel_shortcut")]
    pub open_wheel: String,
    #[serde(default = "default_select_active_item_shortcut")]
    pub select_active_item: String,
    #[serde(default = "default_back_shortcut")]
    pub back: String,
    #[serde(default = "default_wheel_item_shortcuts")]
    pub wheel_items: Vec<String>,
}

fn default_open_wheel_shortcut() -> String {
    "CmdOrCtrl+Shift+V".into()
}

fn default_select_active_item_shortcut() -> String {
    "Enter".into()
}

fn default_back_shortcut() -> String {
    "Escape".into()
}

fn default_wheel_item_shortcuts() -> Vec<String> {
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="]
        .into_iter()
        .map(String::from)
        .collect()
}

impl Default for ShortcutSettings {
    fn default() -> Self {
        Self {
            open_wheel: default_open_wheel_shortcut(),
            select_active_item: default_select_active_item_shortcut(),
            back: default_back_shortcut(),
            wheel_items: default_wheel_item_shortcuts(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WheelAppearanceSettings {
    #[serde(default = "default_wheel_color_mode")]
    pub color_mode: String,
    #[serde(default = "default_wheel_palette_colors")]
    pub palette_colors: Vec<String>,
    #[serde(alias = "backgroundColor")]
    pub segment_color: String,
    #[serde(alias = "backgroundOpacity")]
    pub segment_opacity: f64,
    pub active_color: String,
    pub active_opacity: f64,
    pub active_line_color: String,
    pub ring_line_color: String,
    pub panel_color: String,
    pub panel_opacity: f64,
    pub icon_background_color: String,
    pub label_color: String,
}

fn default_wheel_color_mode() -> String {
    "single".into()
}

fn default_wheel_palette_colors() -> Vec<String> {
    vec![
        "#b22f2b".into(),
        "#db7218".into(),
        "#d6ad14".into(),
        "#3f963f".into(),
        "#0b8977".into(),
        "#2569b8".into(),
        "#554192".into(),
        "#8b3fa1".into(),
    ]
}

impl Default for WheelAppearanceSettings {
    fn default() -> Self {
        Self {
            color_mode: "single".into(),
            palette_colors: default_wheel_palette_colors(),
            segment_color: "#6f7d89".into(),
            segment_opacity: 0.86,
            active_color: "#c3d0dc".into(),
            active_opacity: 0.34,
            active_line_color: "#dce7f0".into(),
            ring_line_color: "#20272d".into(),
            panel_color: "#101519".into(),
            panel_opacity: 0.94,
            icon_background_color: "#182027".into(),
            label_color: "#f1f6fb".into(),
        }
    }
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            start_at_login: false,
            show_tray_icon: true,
            wheel_position: "center".into(),
            wheel_item_count: DEFAULT_WHEEL_ITEMS,
            wheel_item_ids: Vec::new(),
            theme: "system".into(),
            language: "system".into(),
            shortcuts: ShortcutSettings::default(),
            wheel_appearance: WheelAppearanceSettings::default(),
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
            auto_paste: false,
        }
    }
}

pub fn clamp_wheel_item_count(value: i64) -> i64 {
    value.clamp(MIN_WHEEL_ITEMS, MAX_WHEEL_ITEMS)
}

pub fn normalize_settings(mut settings: Settings) -> Settings {
    settings.wheel_item_count = clamp_wheel_item_count(settings.wheel_item_count);
    settings.wheel_item_ids = normalize_wheel_item_ids(settings.wheel_item_ids);
    settings.shortcuts.wheel_items = normalize_wheel_item_shortcuts(settings.shortcuts.wheel_items);
    settings
}

fn normalize_wheel_item_ids(mut ids: Vec<String>) -> Vec<String> {
    ids.resize(MAX_WHEEL_ITEMS as usize, String::new());
    ids.truncate(MAX_WHEEL_ITEMS as usize);
    ids
}

fn normalize_wheel_item_shortcuts(mut shortcuts: Vec<String>) -> Vec<String> {
    shortcuts.resize(MAX_WHEEL_ITEMS as usize, String::new());
    shortcuts.truncate(MAX_WHEEL_ITEMS as usize);
    shortcuts
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct HistoryQuery {
    pub search: Option<String>,
    #[serde(rename = "type")]
    pub item_type: Option<String>,
    pub collection_filter: Option<String>,
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
