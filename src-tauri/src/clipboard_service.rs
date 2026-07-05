use std::{path::Path, sync::{Arc, atomic::{AtomicBool, Ordering}}};

use anyhow::Result;
use arboard::Clipboard;
use sha2::{Digest, Sha256};
use tauri::{AppHandle, Emitter};
use tokio::time::{self, Duration};

use crate::{
    detection::{detect_clipboard_type, detect_content_signals, normalize_formats},
    models::{ClipboardItem, ClipboardItemInput, Settings},
    repository::ClipRepository,
};

#[derive(Clone)]
pub struct ClipboardService {
    repository: ClipRepository,
    app: AppHandle,
    running: Arc<AtomicBool>,
    last_hash: Arc<std::sync::Mutex<String>>,
}

impl ClipboardService {
    pub fn new(repository: ClipRepository, app: AppHandle) -> Self {
        Self {
            repository,
            app,
            running: Arc::new(AtomicBool::new(false)),
            last_hash: Arc::new(std::sync::Mutex::new(String::new())),
        }
    }

    pub fn start(&self) {
        self.running.store(true, Ordering::SeqCst);
        let service = self.clone();
        tauri::async_runtime::spawn(async move {
            let mut interval = time::interval(Duration::from_millis(750));
            while service.running.load(Ordering::SeqCst) {
                interval.tick().await;
                if let Ok(Some(item)) = service.capture() {
                    let _ = service.app.emit("clipboard-item", &item);
                    let _ = service.app.emit("items-changed", ());
                }
            }
        });
    }

    pub fn stop(&self) {
        self.running.store(false, Ordering::SeqCst);
    }

    pub fn capture(&self) -> Result<Option<ClipboardItem>> {
        let settings = self.repository.get_settings()?;
        if settings.pause_capture {
            return Ok(None);
        }

        let mut clipboard = match Clipboard::new() {
            Ok(clipboard) => clipboard,
            Err(_) => return Ok(None),
        };
        let text = clipboard.get_text().unwrap_or_default();
        let file_paths = if settings.capture_files { detect_file_paths(&text) } else { Vec::new() };
        let hash = hash_content(&[text.as_bytes(), file_paths.join("\n").as_bytes()]);
        if *self.last_hash.lock().expect("last hash mutex poisoned") == hash {
            return Ok(None);
        }
        if settings.ignore_duplicates && self.repository.find_by_hash(&hash)?.is_some() {
            *self.last_hash.lock().expect("last hash mutex poisoned") = hash;
            return Ok(None);
        }

        let type_info = detect_clipboard_type(&text, None, false, &file_paths);
        if !should_capture_type(&type_info.item_type, &settings) {
            return Ok(None);
        }
        if text.trim().is_empty() && file_paths.is_empty() {
            return Ok(None);
        }

        let format_info = normalize_formats(vec!["text/plain".into()], !text.is_empty(), false, false, false, !file_paths.is_empty());
        let item = self.repository.create_item(ClipboardItemInput {
            item_type: type_info.item_type.clone(),
            title: make_title(&type_info.item_type, &text, &file_paths),
            preview_text: make_preview(&type_info.item_type, &text, &file_paths),
            content_text: if type_info.item_type == "file_reference" { None } else { Some(text.clone()) },
            content_html: None,
            content_rtf: None,
            image_path: None,
            thumbnail_path: None,
            file_paths,
            format_info,
            content_signals: detect_content_signals(&text, None, type_info.code_language.as_deref()),
            url: type_info.url,
            code_language: type_info.code_language,
            source_app: None,
            size_bytes: text.len() as i64,
            content_hash: hash.clone(),
        })?;
        *self.last_hash.lock().expect("last hash mutex poisoned") = hash;
        Ok(Some(item))
    }

    pub fn restore(&self, item: &ClipboardItem) -> Result<()> {
        let mut clipboard = Clipboard::new()?;
        let text = if item.item_type == "file_reference" {
            item.file_paths.join("\n")
        } else {
            item.content_text.clone().or_else(|| item.url.clone()).unwrap_or_else(|| item.preview_text.clone())
        };
        clipboard.set_text(text)?;
        *self.last_hash.lock().expect("last hash mutex poisoned") = item.content_hash.clone();
        self.repository.mark_used(&item.id)?;
        Ok(())
    }

    pub fn clear_system_clipboard(&self) -> Result<()> {
        Clipboard::new()?.set_text("")?;
        Ok(())
    }
}

fn should_capture_type(item_type: &str, settings: &Settings) -> bool {
    match item_type {
        "image" => settings.capture_images,
        "file_reference" => settings.capture_files,
        "code" | "command" => settings.capture_code,
        "rich_text" => settings.capture_rich_text,
        _ => settings.capture_plain_text,
    }
}

fn detect_file_paths(text: &str) -> Vec<String> {
    text.lines()
        .map(|line| line.trim().trim_start_matches("file://").to_string())
        .filter(|line| line.starts_with('/') || line.as_bytes().get(1) == Some(&b':'))
        .filter(|line| Path::new(line).exists())
        .collect()
}

fn make_title(item_type: &str, text: &str, file_paths: &[String]) -> String {
    match item_type {
        "file_reference" => format!("{} file{}", file_paths.len(), if file_paths.len() == 1 { "" } else { "s" }),
        "url" => single_line(text).trim_start_matches("https://").trim_start_matches("http://").chars().take(80).collect(),
        _ => {
            let title: String = single_line(text).chars().take(80).collect();
            if title.is_empty() { item_type.replace('_', " ") } else { title }
        }
    }
}

fn make_preview(item_type: &str, text: &str, file_paths: &[String]) -> String {
    if item_type == "file_reference" {
        file_paths.join("\n")
    } else {
        text.chars().take(600).collect()
    }
}

fn single_line(text: &str) -> String {
    text.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn hash_content(parts: &[&[u8]]) -> String {
    let mut hasher = Sha256::new();
    for part in parts {
        hasher.update(part);
    }
    format!("{:x}", hasher.finalize())
}
