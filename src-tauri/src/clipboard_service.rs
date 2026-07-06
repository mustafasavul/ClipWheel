use std::{fs, path::{Path, PathBuf}, sync::{Arc, atomic::{AtomicBool, Ordering}}};

use anyhow::Result;
use arboard::{Clipboard, ImageData};
use image::{ImageBuffer, ImageReader, Rgba};
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
    media_dir: PathBuf,
    running: Arc<AtomicBool>,
    last_hash: Arc<std::sync::Mutex<String>>,
}

impl ClipboardService {
    pub fn new(repository: ClipRepository, app: AppHandle, media_dir: PathBuf) -> Self {
        Self {
            repository,
            app,
            media_dir,
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
        let (image, image_format) = if settings.capture_images {
            clipboard.get_image().ok().map(|image| (image, "image".to_string()))
                .or_else(|| platform_image_fallback().map(|image| (image, "public.png".to_string())))
                .map_or((None, None), |(image, format)| (Some(image), Some(format)))
        } else {
            (None, None)
        };
        let file_paths = if settings.capture_files { detect_file_paths(&text) } else { Vec::new() };
        let file_paths_text = file_paths.join("\n");
        let image_bytes = image.as_ref().map(|image| image.bytes.as_ref());
        let hash = hash_content(&[text.as_bytes(), file_paths_text.as_bytes(), image_bytes.unwrap_or(&[])]);
        if *self.last_hash.lock().expect("last hash mutex poisoned") == hash {
            return Ok(None);
        }
        if self.repository.find_by_hash(&hash)?.is_some() {
            *self.last_hash.lock().expect("last hash mutex poisoned") = hash;
            return Ok(None);
        }

        let has_image = image.is_some();
        let type_info = detect_clipboard_type(&text, None, has_image, &file_paths);
        if !should_capture_type(&type_info.item_type, &settings) {
            return Ok(None);
        }
        if text.trim().is_empty() && file_paths.is_empty() && !has_image {
            return Ok(None);
        }

        let media = if let Some(image) = image.as_ref() {
            save_image_assets(&self.media_dir, image, settings.max_image_size_mb)?
        } else {
            SavedImage::default()
        };
        if has_image && media.image_path.is_none() {
            return Ok(None);
        }

        let raw_formats = if has_image { vec![image_format.unwrap_or_else(|| "image".into())] } else { vec!["text/plain".into()] };
        let format_info = normalize_formats(raw_formats, !text.is_empty(), false, false, has_image, !file_paths.is_empty());
        let item = self.repository.create_item(ClipboardItemInput {
            item_type: type_info.item_type.clone(),
            title: make_title(&type_info.item_type, &text, &file_paths),
            preview_text: make_preview(&type_info.item_type, &text, &file_paths),
            content_text: if type_info.item_type == "file_reference" || type_info.item_type == "image" { None } else { Some(text.clone()) },
            content_html: None,
            content_rtf: None,
            image_path: media.image_path,
            thumbnail_path: media.thumbnail_path,
            file_paths,
            format_info,
            content_signals: detect_content_signals(&text, None, type_info.code_language.as_deref()),
            url: type_info.url,
            code_language: type_info.code_language,
            source_app: None,
            size_bytes: media.size_bytes.unwrap_or(text.len() as i64),
            content_hash: hash.clone(),
        })?;
        *self.last_hash.lock().expect("last hash mutex poisoned") = hash;
        Ok(Some(item))
    }

    pub fn restore(&self, item: &ClipboardItem) -> Result<()> {
        let mut clipboard = Clipboard::new()?;
        if item.item_type == "image" {
            if let Some(path) = item.image_path.as_ref() {
                let image = load_image_data(path)?;
                clipboard.set_image(image)?;
                *self.last_hash.lock().expect("last hash mutex poisoned") = item.content_hash.clone();
                self.repository.mark_used(&item.id)?;
                return Ok(());
            }
        }
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
        "image" => "Screenshot or image".into(),
        "file_reference" => format!("{} file{}", file_paths.len(), if file_paths.len() == 1 { "" } else { "s" }),
        "url" => single_line(text).trim_start_matches("https://").trim_start_matches("http://").chars().take(80).collect(),
        _ => {
            let title: String = single_line(text).chars().take(80).collect();
            if title.is_empty() { item_type.replace('_', " ") } else { title }
        }
    }
}

fn make_preview(item_type: &str, text: &str, file_paths: &[String]) -> String {
    match item_type {
        "image" => "Image captured locally".into(),
        "file_reference" => file_paths.join("\n"),
        _ => text.chars().take(600).collect(),
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

#[derive(Default)]
struct SavedImage {
    image_path: Option<String>,
    thumbnail_path: Option<String>,
    size_bytes: Option<i64>,
}

fn save_image_assets(media_dir: &Path, image: &ImageData<'_>, max_image_size_mb: i64) -> Result<SavedImage> {
    let size_bytes = image.bytes.len() as i64;
    if size_bytes > max_image_size_mb * 1024 * 1024 {
        return Ok(SavedImage { image_path: None, thumbnail_path: None, size_bytes: Some(size_bytes) });
    }

    fs::create_dir_all(media_dir)?;
    let id = format!("{}-{}", chrono::Utc::now().timestamp_millis(), uuid::Uuid::new_v4());
    let image_path = media_dir.join(format!("{id}.png"));
    let thumbnail_path = media_dir.join(format!("{id}-thumb.png"));
    let rgba = rgba_image_from_clipboard(image)?;
    rgba.save(&image_path)?;
    let thumbnail_width = 360;
    let thumbnail_height = ((rgba.height() as f32) * (thumbnail_width as f32 / rgba.width().max(1) as f32)).round().max(1.0) as u32;
    let thumbnail = image::imageops::resize(&rgba, thumbnail_width, thumbnail_height, image::imageops::FilterType::Lanczos3);
    thumbnail.save(&thumbnail_path)?;

    Ok(SavedImage {
        image_path: Some(image_path.to_string_lossy().to_string()),
        thumbnail_path: Some(thumbnail_path.to_string_lossy().to_string()),
        size_bytes: Some(size_bytes),
    })
}

#[cfg(target_os = "macos")]
fn platform_image_fallback() -> Option<ImageData<'static>> {
    use objc2::{msg_send, rc::{autoreleasepool, Retained}, ClassType};
    use objc2_app_kit::{NSPasteboard, NSPasteboardTypePNG};

    let png_bytes = autoreleasepool(|_| {
        let pasteboard: Option<Retained<NSPasteboard>> = unsafe { msg_send![NSPasteboard::class(), generalPasteboard] };
        let pasteboard = pasteboard?;
        let data = unsafe { pasteboard.dataForType(NSPasteboardTypePNG) }?;
        Some(unsafe { data.as_bytes_unchecked() }.to_vec())
    })?;

    let image = image::load_from_memory_with_format(&png_bytes, image::ImageFormat::Png).ok()?.to_rgba8();
    let width = image.width() as usize;
    let height = image.height() as usize;
    Some(ImageData {
        width,
        height,
        bytes: image.into_raw().into(),
    })
}

#[cfg(not(target_os = "macos"))]
fn platform_image_fallback() -> Option<ImageData<'static>> {
    None
}

fn rgba_image_from_clipboard(image: &ImageData<'_>) -> Result<ImageBuffer<Rgba<u8>, Vec<u8>>> {
    let width = image.width as u32;
    let height = image.height as u32;
    let bytes = image.bytes.as_ref().to_vec();
    ImageBuffer::<Rgba<u8>, Vec<u8>>::from_raw(width, height, bytes)
        .ok_or_else(|| anyhow::anyhow!("Clipboard image has invalid RGBA dimensions"))
}

fn load_image_data(path: &str) -> Result<ImageData<'static>> {
    let image = ImageReader::open(path)?.decode()?.to_rgba8();
    let width = image.width() as usize;
    let height = image.height() as usize;
    Ok(ImageData {
        width,
        height,
        bytes: image.into_raw().into(),
    })
}
