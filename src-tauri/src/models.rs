use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::{OnceLock, RwLock};

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
    pub priority_flag: Option<String>,
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
    #[serde(default)]
    pub wheel_appearance_presets: Vec<CustomWheelAppearancePreset>,
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

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomWheelAppearancePreset {
    pub id: String,
    pub name: String,
    pub appearance: WheelAppearanceSettings,
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
            segment_color: "#1c252c".into(),
            segment_opacity: 0.94,
            active_color: "#8eb45a".into(),
            active_opacity: 0.38,
            active_line_color: "#b8ef7a".into(),
            ring_line_color: "#2c3740".into(),
            panel_color: "#091116".into(),
            panel_opacity: 0.96,
            icon_background_color: "#151e24".into(),
            label_color: "#e8edf0".into(),
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
            wheel_appearance_presets: Vec::new(),
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
    settings.wheel_appearance_presets =
        normalize_wheel_appearance_presets(settings.wheel_appearance_presets);
    settings
}

fn normalize_wheel_appearance_presets(
    mut presets: Vec<CustomWheelAppearancePreset>,
) -> Vec<CustomWheelAppearancePreset> {
    presets.retain(|preset| !preset.id.trim().is_empty() && !preset.name.trim().is_empty());
    presets.truncate(24);
    for preset in &mut presets {
        preset.id = preset.id.trim().chars().take(80).collect();
        preset.name = preset.name.trim().chars().take(48).collect();
    }
    presets
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
    pub flag_filter: Option<String>,
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

/// Kullanici arayuzu dili yalnizca renderer tarafinda bilinir. Tepsi menusu ve
/// yakalama sirasinda uretilen basliklar Rust tarafinda olustugu icin renderer
/// dil degistikce bu tabloyu `set_locale_strings` ile gunceller.
/// ponytail: surec genelinde tek bir arayuz dili var, bu yuzden global tutuluyor;
/// pencere basina dil gerekirse AppState icine tasinmali.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LocaleStrings {
    pub tray_open: String,
    pub tray_wheel: String,
    pub tray_settings: String,
    pub tray_quit: String,
    pub tray_recent_captures: String,
    pub tray_no_recent_captures: String,
    pub tray_untitled_capture: String,
    pub image: String,
    pub files: String,
    pub url: String,
    pub capture_image_title: String,
    pub capture_image_preview: String,
    /// `{count}` yer tutucusu dosya sayisiyla degistirilir.
    pub capture_file_count_one: String,
    pub capture_file_count_other: String,
}

impl Default for LocaleStrings {
    fn default() -> Self {
        Self {
            tray_open: "Open ClipWheel".into(),
            tray_wheel: "Open Wheel".into(),
            tray_settings: "Settings".into(),
            tray_quit: "Quit ClipWheel".into(),
            tray_recent_captures: "Recent Captures".into(),
            tray_no_recent_captures: "No Recent Captures".into(),
            tray_untitled_capture: "Untitled Capture".into(),
            image: "Image".into(),
            files: "Files".into(),
            url: "URL".into(),
            capture_image_title: "Screenshot or image".into(),
            capture_image_preview: "Image captured locally".into(),
            capture_file_count_one: "{count} file".into(),
            capture_file_count_other: "{count} files".into(),
        }
    }
}

static LOCALE_STRINGS: OnceLock<RwLock<LocaleStrings>> = OnceLock::new();

fn locale_cell() -> &'static RwLock<LocaleStrings> {
    LOCALE_STRINGS.get_or_init(|| RwLock::new(LocaleStrings::default()))
}

pub fn locale_strings() -> LocaleStrings {
    locale_cell()
        .read()
        .map(|guard| guard.clone())
        .unwrap_or_default()
}

pub fn set_locale_strings(next: LocaleStrings) {
    if let Ok(mut guard) = locale_cell().write() {
        *guard = next;
    }
}
