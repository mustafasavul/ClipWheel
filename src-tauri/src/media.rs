use std::{fs, path::Path};

use anyhow::Result;
use base64::{engine::general_purpose, Engine};

use crate::models::ClipboardItem;

pub fn image_data_url(item: &ClipboardItem) -> Result<Option<String>> {
    let Some(path) = item.thumbnail_path.as_ref().or(item.image_path.as_ref()) else {
        return Ok(None);
    };
    if !Path::new(path).exists() {
        return Ok(None);
    }
    let bytes = fs::read(path)?;
    Ok(Some(format!(
        "data:image/png;base64,{}",
        general_purpose::STANDARD.encode(bytes)
    )))
}
