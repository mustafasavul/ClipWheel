use crate::models::{ClipboardFormatInfo, ContentSignal};

pub struct TypeInfo {
    pub item_type: String,
    pub code_language: Option<String>,
    pub url: Option<String>,
}

pub fn detect_clipboard_type(
    text: &str,
    html: Option<&str>,
    has_image: bool,
    file_paths: &[String],
) -> TypeInfo {
    let trimmed = detection_sample(text).trim();
    if has_image {
        return TypeInfo {
            item_type: "image".into(),
            code_language: None,
            url: None,
        };
    }
    if !file_paths.is_empty() {
        return TypeInfo {
            item_type: "file_reference".into(),
            code_language: None,
            url: None,
        };
    }
    if is_url(trimmed) {
        let url = if trimmed.starts_with("www.") {
            format!("https://{trimmed}")
        } else {
            trimmed.into()
        };
        return TypeInfo {
            item_type: "url".into(),
            code_language: None,
            url: Some(url),
        };
    }
    if is_command_snippet(trimmed) {
        return TypeInfo {
            item_type: "command".into(),
            code_language: Some("shell".into()),
            url: None,
        };
    }
    let language = detect_code_language(trimmed);
    if language != "unknown" {
        return TypeInfo {
            item_type: "code".into(),
            code_language: Some(language),
            url: None,
        };
    }
    if html.is_some_and(|value| !value.trim().is_empty()) {
        return TypeInfo {
            item_type: "rich_text".into(),
            code_language: None,
            url: None,
        };
    }
    TypeInfo {
        item_type: "plain_text".into(),
        code_language: None,
        url: None,
    }
}

pub fn normalize_formats(
    raw_formats: Vec<String>,
    has_text: bool,
    has_html: bool,
    has_rtf: bool,
    has_image: bool,
    has_files: bool,
) -> ClipboardFormatInfo {
    let mut normalized = Vec::<String>::new();
    if has_text {
        normalized.push("text/plain".into());
    }
    if has_html {
        normalized.push("text/html".into());
    }
    if has_rtf {
        normalized.push("text/rtf".into());
    }
    if has_image {
        normalized.push("image".into());
    }
    if has_files {
        normalized.push("files".into());
    }
    ClipboardFormatInfo {
        raw_formats,
        normalized_formats: normalized,
        has_text,
        has_html,
        has_rtf,
        has_image,
        has_files,
        platform: std::env::consts::OS.into(),
    }
}

pub fn detect_content_signals(
    text: &str,
    html: Option<&str>,
    code_language: Option<&str>,
) -> Vec<ContentSignal> {
    let mut signals = Vec::new();
    if html.is_some_and(|value| !value.trim().is_empty()) {
        signals.push(signal("html", "high", None));
    }
    if let Some(language) = code_language {
        if language != "unknown" {
            signals.push(signal(
                if language == "shell" { "shell" } else { "code" },
                "high",
                Some(language),
            ));
            if language == "json" {
                signals.push(signal("json", "high", Some("json")));
            }
        }
    }
    let trimmed = detection_sample(text).trim();
    if trimmed.contains("://") || trimmed.starts_with("www.") {
        signals.push(signal(
            "url",
            if is_url(trimmed) { "high" } else { "medium" },
            None,
        ));
    }
    if trimmed.contains('@') && trimmed.contains('.') {
        signals.push(signal("email", "medium", None));
    }
    if trimmed.contains("```") {
        signals.push(signal("code_block", "medium", None));
    }
    signals
}

fn signal(kind: &str, confidence: &str, language: Option<&str>) -> ContentSignal {
    ContentSignal {
        kind: kind.into(),
        confidence: confidence.into(),
        language: language.map(str::to_string),
        range: None,
        metadata: None,
    }
}

fn is_url(text: &str) -> bool {
    !text.contains(char::is_whitespace)
        && (starts_with_ignore_ascii_case(text, "http://")
            || starts_with_ignore_ascii_case(text, "https://")
            || starts_with_ignore_ascii_case(text, "www."))
}

fn starts_with_ignore_ascii_case(value: &str, prefix: &str) -> bool {
    value
        .get(..prefix.len())
        .is_some_and(|candidate| candidate.eq_ignore_ascii_case(prefix))
}

fn detection_sample(text: &str) -> &str {
    const MAX_DETECTION_BYTES: usize = 64 * 1024;
    if text.len() <= MAX_DETECTION_BYTES {
        return text;
    }
    let mut end = MAX_DETECTION_BYTES;
    while !text.is_char_boundary(end) {
        end -= 1;
    }
    &text[..end]
}

fn is_command_snippet(text: &str) -> bool {
    let commands = [
        "npm", "pnpm", "yarn", "git", "cd", "ls", "mkdir", "rm", "cp", "mv", "curl", "wget",
        "docker", "kubectl", "ssh", "brew", "python", "node",
    ];
    let lines: Vec<_> = text
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .collect();
    !lines.is_empty()
        && lines.len() <= 4
        && lines
            .iter()
            .all(|line| commands.iter().any(|command| line.starts_with(command)))
}

fn detect_code_language(text: &str) -> String {
    if text.is_empty() {
        return "unknown".into();
    }
    if (text.starts_with('{') || text.starts_with('['))
        && serde_json::from_str::<serde_json::Value>(text).is_ok()
    {
        return "json".into();
    }
    if text.contains("<!doctype html") || (text.contains('<') && text.contains("</")) {
        return "html".into();
    }
    if text.contains("function")
        || text.contains("const ")
        || text.contains("=>")
        || text.contains("console.log")
    {
        return "javascript".into();
    }
    if text.contains("interface ") || text.contains("type ") && text.contains("export ") {
        return "typescript".into();
    }
    if text.contains("def ") || text.contains("import ") && text.contains("print(") {
        return "python".into();
    }
    "unknown".into()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn classifies_large_content_from_a_bounded_sample() {
        let text = format!("const value = 1;{}", "x".repeat(2 * 1024 * 1024));
        let result = detect_clipboard_type(&text, None, false, &[]);
        assert_eq!(result.item_type, "code");
        assert_eq!(result.code_language.as_deref(), Some("javascript"));
    }

    #[test]
    fn keeps_url_detection_case_insensitive_without_allocating_a_lowercase_copy() {
        let result = detect_clipboard_type("HTTPS://example.com", None, false, &[]);
        assert_eq!(result.item_type, "url");
    }
}
