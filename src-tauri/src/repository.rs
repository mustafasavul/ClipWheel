use std::{
    fs,
    path::{Path, PathBuf},
};

use anyhow::{Context, Result};
use diesel::{
    prelude::*,
    r2d2::{ConnectionManager, Pool},
    sql_query,
    sql_types::{BigInt, Integer, Nullable, Text},
};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use serde_json::Value;
use uuid::Uuid;

use crate::models::{
    default_format_info, CleanupJob, CleanupRequest, ClipboardItem, ClipboardItemInput,
    HistoryQuery, Settings,
};

const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

#[derive(Clone)]
pub struct ClipRepository {
    pool: Pool<ConnectionManager<SqliteConnection>>,
}

#[derive(QueryableByName)]
struct ClipboardRow {
    #[diesel(sql_type = Text)]
    id: String,
    #[diesel(sql_type = Text)]
    type_: String,
    #[diesel(sql_type = Text)]
    title: String,
    #[diesel(sql_type = Text)]
    preview_text: String,
    #[diesel(sql_type = Nullable<Text>)]
    content_text: Option<String>,
    #[diesel(sql_type = Nullable<Text>)]
    content_html: Option<String>,
    #[diesel(sql_type = Nullable<Text>)]
    content_rtf: Option<String>,
    #[diesel(sql_type = Nullable<Text>)]
    image_path: Option<String>,
    #[diesel(sql_type = Nullable<Text>)]
    thumbnail_path: Option<String>,
    #[diesel(sql_type = Nullable<Text>)]
    file_paths_json: Option<String>,
    #[diesel(sql_type = Nullable<Text>)]
    formats_json: Option<String>,
    #[diesel(sql_type = Nullable<Text>)]
    content_signals_json: Option<String>,
    #[diesel(sql_type = Nullable<Text>)]
    url: Option<String>,
    #[diesel(sql_type = Nullable<Text>)]
    code_language: Option<String>,
    #[diesel(sql_type = Nullable<Text>)]
    source_app: Option<String>,
    #[diesel(sql_type = BigInt)]
    size_bytes: i64,
    #[diesel(sql_type = Text)]
    content_hash: String,
    #[diesel(sql_type = Integer)]
    is_pinned: i32,
    #[diesel(sql_type = Integer)]
    is_favorite: i32,
    #[diesel(sql_type = Nullable<Text>)]
    priority_flag: Option<String>,
    #[diesel(sql_type = Integer)]
    is_deleted: i32,
    #[diesel(sql_type = Text)]
    created_at: String,
    #[diesel(sql_type = Text)]
    updated_at: String,
    #[diesel(sql_type = Nullable<Text>)]
    last_used_at: Option<String>,
    #[diesel(sql_type = Nullable<Text>)]
    deleted_at: Option<String>,
}

#[derive(QueryableByName)]
struct CountRow {
    #[diesel(sql_type = BigInt)]
    count: i64,
}

#[derive(QueryableByName)]
struct SettingRow {
    #[diesel(sql_type = Text)]
    key: String,
    #[diesel(sql_type = Text)]
    value_json: String,
}

impl ClipRepository {
    pub fn new(app_data_dir: &Path) -> Result<Self> {
        fs::create_dir_all(app_data_dir)?;
        let electron_path = electron_db_path();
        let db_path = if app_data_dir.join("clipwheel.sqlite").exists() {
            app_data_dir.join("clipwheel.sqlite")
        } else if electron_path.exists() {
            electron_path
        } else {
            app_data_dir.join("clipwheel.sqlite")
        };
        Self::with_path(&db_path)
    }

    pub fn with_path(db_path: &Path) -> Result<Self> {
        if let Some(parent) = db_path.parent() {
            fs::create_dir_all(parent)?;
        }
        let manager =
            ConnectionManager::<SqliteConnection>::new(db_path.to_string_lossy().to_string());
        let pool = Pool::builder().max_size(4).build(manager)?;
        let repo = Self { pool };
        repo.configure_and_migrate()?;
        repo.seed_settings()?;
        Ok(repo)
    }

    pub fn create_item(&self, input: ClipboardItemInput) -> Result<ClipboardItem> {
        let now = now();
        let id = Uuid::new_v4().to_string();
        let mut conn = self.conn()?;
        sql_query(
            "INSERT INTO clipboard_items (
              id, type, title, preview_text, content_text, content_html, content_rtf, image_path,
              thumbnail_path, file_paths_json, formats_json, content_signals_json, url, code_language, source_app, size_bytes, content_hash,
              is_pinned, is_favorite, is_sensitive, is_deleted, created_at, updated_at
            ) VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?
            )",
        )
        .bind::<Text, _>(&id)
        .bind::<Text, _>(&input.item_type)
        .bind::<Text, _>(&input.title)
        .bind::<Text, _>(&input.preview_text)
        .bind::<Nullable<Text>, _>(&input.content_text)
        .bind::<Nullable<Text>, _>(&input.content_html)
        .bind::<Nullable<Text>, _>(&input.content_rtf)
        .bind::<Nullable<Text>, _>(&input.image_path)
        .bind::<Nullable<Text>, _>(&input.thumbnail_path)
        .bind::<Nullable<Text>, _>(Some(serde_json::to_string(&input.file_paths)?))
        .bind::<Nullable<Text>, _>(Some(serde_json::to_string(&input.format_info)?))
        .bind::<Nullable<Text>, _>(Some(serde_json::to_string(&input.content_signals)?))
        .bind::<Nullable<Text>, _>(&input.url)
        .bind::<Nullable<Text>, _>(&input.code_language)
        .bind::<Nullable<Text>, _>(&input.source_app)
            .bind::<BigInt, _>(input.size_bytes)
            .bind::<Text, _>(&input.content_hash)
            .bind::<Text, _>(&now)
            .bind::<Text, _>(&now)
            .execute(&mut conn)?;
        drop(conn);
        let settings = self.get_settings()?;
        self.enforce_history_limit(settings.max_history_items, Some(&id))?;
        self.get_item(&id)
    }

    pub fn get_item(&self, id: &str) -> Result<ClipboardItem> {
        let mut conn = self.conn()?;
        let row = sql_query(select_sql("WHERE id = ?"))
            .bind::<Text, _>(id)
            .get_result::<ClipboardRow>(&mut conn)
            .with_context(|| format!("Clipboard item not found: {id}"))?;
        Ok(row_to_item(row))
    }

    pub fn find_by_hash(&self, hash: &str) -> Result<Option<ClipboardItem>> {
        let mut conn = self.conn()?;
        let rows = sql_query(format!(
            "{} LIMIT 1",
            select_sql("WHERE content_hash = ? AND is_deleted = 0")
        ))
        .bind::<Text, _>(hash)
        .load::<ClipboardRow>(&mut conn)?;
        Ok(rows.into_iter().next().map(row_to_item))
    }

    pub fn list_items(&self, query: HistoryQuery) -> Result<Vec<ClipboardItem>> {
        let where_sql = build_where(&query);
        let limit = query.limit.unwrap_or(500);
        let offset = query.offset.unwrap_or(0);
        let sql = format!(
            "{} {} ORDER BY is_pinned DESC, created_at DESC LIMIT {} OFFSET {}",
            select_sql(""),
            where_sql,
            limit,
            offset
        );
        let mut conn = self.conn()?;
        Ok(sql_query(sql)
            .load::<ClipboardRow>(&mut conn)?
            .into_iter()
            .map(row_to_item)
            .collect())
    }

    pub fn list_recent_captures(&self, limit: i64) -> Result<Vec<ClipboardItem>> {
        let limit = limit.clamp(0, 20);
        let mut conn = self.conn()?;
        Ok(sql_query(format!(
            "{} WHERE is_deleted = 0 ORDER BY created_at DESC LIMIT {}",
            select_sql(""),
            limit
        ))
        .load::<ClipboardRow>(&mut conn)?
        .into_iter()
        .map(row_to_item)
        .collect())
    }

    pub fn count_items(&self, query: HistoryQuery) -> Result<i64> {
        let where_sql = build_where(&query);
        let mut conn = self.conn()?;
        let row = sql_query(format!(
            "SELECT COUNT(*) as count FROM clipboard_items {where_sql}"
        ))
        .get_result::<CountRow>(&mut conn)?;
        Ok(row.count)
    }

    pub fn update_item_title(&self, id: &str, title: &str) -> Result<ClipboardItem> {
        let title = title.trim();
        anyhow::ensure!(!title.is_empty(), "Item name cannot be empty");
        anyhow::ensure!(
            title.chars().count() <= 120,
            "Item name cannot exceed 120 characters"
        );

        let now = now();
        let mut conn = self.conn()?;
        sql_query("UPDATE clipboard_items SET title = ?, updated_at = ? WHERE id = ?")
            .bind::<Text, _>(title)
            .bind::<Text, _>(&now)
            .bind::<Text, _>(id)
            .execute(&mut conn)?;
        self.get_item(id)
    }

    pub fn set_priority_flag(&self, id: &str, flag: Option<String>) -> Result<ClipboardItem> {
        if let Some(value) = flag.as_deref() {
            anyhow::ensure!(
                matches!(
                    value,
                    "red" | "orange" | "yellow" | "green" | "blue" | "purple"
                ),
                "Unsupported flag color"
            );
        }
        let now = now();
        let mut conn = self.conn()?;
        sql_query("UPDATE clipboard_items SET priority_flag = ?, updated_at = ? WHERE id = ?")
            .bind::<Nullable<Text>, _>(&flag)
            .bind::<Text, _>(&now)
            .bind::<Text, _>(id)
            .execute(&mut conn)?;
        self.get_item(id)
    }

    pub fn update_flags(
        &self,
        id: &str,
        is_pinned: Option<bool>,
        is_favorite: Option<bool>,
    ) -> Result<ClipboardItem> {
        let current = self.get_item(id)?;
        let now = now();
        let mut conn = self.conn()?;
        sql_query("UPDATE clipboard_items SET is_pinned = ?, is_favorite = ?, updated_at = ? WHERE id = ?")
            .bind::<Integer, _>(bool_int(is_pinned.unwrap_or(current.is_pinned)))
            .bind::<Integer, _>(bool_int(is_favorite.unwrap_or(current.is_favorite)))
            .bind::<Text, _>(&now)
            .bind::<Text, _>(id)
            .execute(&mut conn)?;
        self.get_item(id)
    }

    pub fn soft_delete(&self, id: &str) -> Result<()> {
        let now = now();
        let mut conn = self.conn()?;
        sql_query("UPDATE clipboard_items SET is_deleted = 1, deleted_at = ?, updated_at = ? WHERE id = ?")
            .bind::<Text, _>(&now)
            .bind::<Text, _>(&now)
            .bind::<Text, _>(id)
            .execute(&mut conn)?;
        Ok(())
    }

    pub fn mark_used(&self, id: &str) -> Result<()> {
        let now = now();
        let mut conn = self.conn()?;
        sql_query("UPDATE clipboard_items SET last_used_at = ?, updated_at = ? WHERE id = ?")
            .bind::<Text, _>(&now)
            .bind::<Text, _>(&now)
            .bind::<Text, _>(id)
            .execute(&mut conn)?;
        Ok(())
    }

    pub fn cleanup(&self, request: CleanupRequest) -> Result<CleanupJob> {
        let now = now();
        let mut where_sql = "is_deleted = 0".to_string();
        if request.include_pinned != Some(true) {
            where_sql.push_str(" AND is_pinned = 0");
        }
        if request.mode == "type" {
            if let Some(item_type) = &request.item_type {
                where_sql.push_str(&format!(" AND type = '{}'", sql_escape(item_type)));
            }
        }
        if request.mode == "older_than" {
            if let Some(older_than) = &request.older_than {
                where_sql.push_str(&format!(" AND created_at < '{}'", sql_escape(older_than)));
            }
        }
        if request.mode == "between" {
            if let (Some(start), Some(end)) = (&request.start_date, &request.end_date) {
                where_sql.push_str(&format!(
                    " AND created_at BETWEEN '{}' AND '{}'",
                    sql_escape(start),
                    sql_escape(end)
                ));
            }
        }

        let mut conn = self.conn()?;
        let changes = if request.mode == "purge_deleted" {
            sql_query("DELETE FROM clipboard_items WHERE is_deleted = 1").execute(&mut conn)?
        } else {
            sql_query(format!("UPDATE clipboard_items SET is_deleted = 1, deleted_at = '{}', updated_at = '{}' WHERE {where_sql}", sql_escape(&now), sql_escape(&now))).execute(&mut conn)?
        } as i64;

        let job = CleanupJob {
            id: Uuid::new_v4().to_string(),
            action: request.mode.clone(),
            criteria_json: serde_json::to_string(&request)?,
            deleted_count: changes,
            created_at: now,
        };
        sql_query("INSERT INTO cleanup_jobs (id, action, criteria_json, deleted_count, created_at) VALUES (?, ?, ?, ?, ?)")
            .bind::<Text, _>(&job.id)
            .bind::<Text, _>(&job.action)
            .bind::<Text, _>(&job.criteria_json)
            .bind::<BigInt, _>(job.deleted_count)
            .bind::<Text, _>(&job.created_at)
            .execute(&mut conn)?;
        Ok(job)
    }

    pub fn get_settings(&self) -> Result<Settings> {
        let mut settings_value = serde_json::to_value(Settings::default())?;
        let mut conn = self.conn()?;
        let rows =
            sql_query("SELECT key, value_json FROM settings").load::<SettingRow>(&mut conn)?;
        let object = settings_value
            .as_object_mut()
            .context("default settings must be an object")?;
        for row in rows {
            if let Ok(value) = serde_json::from_str::<Value>(&row.value_json) {
                object.insert(row.key, value);
            }
        }
        Ok(crate::models::normalize_settings(serde_json::from_value(
            settings_value,
        )?))
    }

    pub fn update_settings(&self, patch: Value) -> Result<Settings> {
        let object = patch
            .as_object()
            .context("settings patch must be an object")?;
        let now = now();
        let mut conn = self.conn()?;
        for (key, value) in object {
            sql_query("INSERT INTO settings (key, value_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at")
                .bind::<Text, _>(key)
                .bind::<Text, _>(&serde_json::to_string(value)?)
                .bind::<Text, _>(&now)
                .execute(&mut conn)?;
        }
        drop(conn);
        let next = self.get_settings()?;
        if object.contains_key("maxHistoryItems") {
            self.enforce_history_limit(next.max_history_items, None)?;
        }
        Ok(next)
    }

    fn configure_and_migrate(&self) -> Result<()> {
        let mut conn = self.conn()?;
        sql_query("PRAGMA journal_mode = WAL").execute(&mut conn)?;
        sql_query("PRAGMA foreign_keys = ON").execute(&mut conn)?;
        conn.run_pending_migrations(MIGRATIONS)
            .map_err(|err| anyhow::anyhow!("{err}"))?;
        add_column_if_missing(&mut conn, "clipboard_items", "formats_json", "TEXT")?;
        add_column_if_missing(&mut conn, "clipboard_items", "content_signals_json", "TEXT")?;
        sql_query("DROP INDEX IF EXISTS idx_clipboard_items_hash_live").execute(&mut conn)?;
        sql_query("CREATE INDEX IF NOT EXISTS idx_clipboard_items_hash_live_lookup ON clipboard_items(content_hash) WHERE is_deleted = 0").execute(&mut conn)?;
        let now = now();
        sql_query("UPDATE clipboard_items SET is_deleted = 1, deleted_at = COALESCE(deleted_at, ?), updated_at = ? WHERE is_deleted = 0 AND (type = 'sensitive' OR is_sensitive = 1)")
            .bind::<Text, _>(&now)
            .bind::<Text, _>(&now)
            .execute(&mut conn)?;
        Ok(())
    }

    fn enforce_history_limit(&self, max_history_items: i64, keep_id: Option<&str>) -> Result<()> {
        if max_history_items <= 0 {
            return Ok(());
        }
        let active_count = self.count_items(HistoryQuery {
            include_deleted: Some(false),
            ..Default::default()
        })?;
        let overflow = active_count - max_history_items;
        if overflow <= 0 {
            return Ok(());
        }

        let now = now();
        let keep_clause = keep_id
            .map(|id| format!(" AND id != '{}'", sql_escape(id)))
            .unwrap_or_default();
        let mut conn = self.conn()?;
        sql_query(format!(
            "UPDATE clipboard_items
             SET is_deleted = 1, deleted_at = '{deleted_at}', updated_at = '{updated_at}'
             WHERE id IN (
               SELECT id FROM clipboard_items
               WHERE is_deleted = 0 AND is_pinned = 0{keep_clause}
               ORDER BY created_at ASC, id ASC
               LIMIT {overflow}
             )",
            deleted_at = sql_escape(&now),
            updated_at = sql_escape(&now),
            keep_clause = keep_clause,
            overflow = overflow,
        ))
        .execute(&mut conn)?;
        Ok(())
    }

    fn seed_settings(&self) -> Result<()> {
        if self.count_settings()? > 0 {
            return Ok(());
        }
        self.update_settings(serde_json::to_value(Settings::default())?)?;
        Ok(())
    }

    fn count_settings(&self) -> Result<i64> {
        let mut conn = self.conn()?;
        Ok(sql_query("SELECT COUNT(*) as count FROM settings")
            .get_result::<CountRow>(&mut conn)?
            .count)
    }

    fn conn(&self) -> Result<diesel::r2d2::PooledConnection<ConnectionManager<SqliteConnection>>> {
        Ok(self.pool.get()?)
    }
}

fn select_sql(where_sql: &str) -> String {
    format!(
        "SELECT id, type as type_, title, preview_text, content_text, content_html, content_rtf, image_path,
        thumbnail_path, file_paths_json, formats_json, content_signals_json,
        url, code_language, source_app, size_bytes, content_hash,
        is_pinned, is_favorite, priority_flag, is_deleted, created_at, updated_at, last_used_at, deleted_at FROM clipboard_items {where_sql}"
    )
}

fn build_where(query: &HistoryQuery) -> String {
    let mut clauses = Vec::<String>::new();
    if query.include_deleted != Some(true) {
        clauses.push("is_deleted = 0".into());
    }
    if let Some(item_type) = &query.item_type {
        if item_type != "all" {
            clauses.push(format!("type = '{}'", sql_escape(item_type)));
        }
    }
    match query.collection_filter.as_deref() {
        Some("favorites") => clauses.push("is_favorite = 1".into()),
        _ => {}
    }
    if let Some(flag) = query
        .flag_filter
        .as_ref()
        .map(|value| value.trim())
        .filter(|value| !value.is_empty() && *value != "all")
    {
        if flag == "none" {
            clauses.push("priority_flag IS NULL".into());
        } else {
            clauses.push(format!("priority_flag = '{}'", sql_escape(flag)));
        }
    }
    if let Some(search) = query
        .search
        .as_ref()
        .map(|value| value.trim())
        .filter(|value| !value.is_empty())
    {
        let search = sql_escape(search);
        clauses.push(format!("(title LIKE '%{search}%' OR preview_text LIKE '%{search}%' OR content_text LIKE '%{search}%' OR url LIKE '%{search}%')"));
    }
    match query.date_filter.as_deref() {
        Some("custom") => {
            if let Some(start) = &query.start_date {
                clauses.push(format!("created_at >= '{}'", sql_escape(start)));
            }
            if let Some(end) = &query.end_date {
                clauses.push(format!("created_at <= '{}'", sql_escape(end)));
            }
        }
        _ => {}
    }
    if clauses.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", clauses.join(" AND "))
    }
}

fn add_column_if_missing(
    conn: &mut SqliteConnection,
    table: &str,
    column: &str,
    definition: &str,
) -> Result<()> {
    #[derive(QueryableByName)]
    struct TableInfo {
        #[diesel(sql_type = Text)]
        name: String,
    }
    let rows = sql_query(format!("PRAGMA table_info({table})")).load::<TableInfo>(conn)?;
    if !rows.iter().any(|row| row.name == column) {
        sql_query(format!(
            "ALTER TABLE {table} ADD COLUMN {column} {definition}"
        ))
        .execute(conn)?;
    }
    Ok(())
}

fn row_to_item(row: ClipboardRow) -> ClipboardItem {
    ClipboardItem {
        id: row.id,
        item_type: row.type_,
        title: row.title,
        preview_text: row.preview_text,
        content_text: row.content_text,
        content_html: row.content_html,
        content_rtf: row.content_rtf,
        image_path: row.image_path,
        thumbnail_path: row.thumbnail_path,
        file_paths: parse_json(row.file_paths_json).unwrap_or_default(),
        format_info: parse_json(row.formats_json).unwrap_or_else(|| default_format_info("unknown")),
        content_signals: parse_json(row.content_signals_json).unwrap_or_default(),
        priority_flag: row.priority_flag,
        url: row.url,
        code_language: row.code_language,
        source_app: row.source_app,
        size_bytes: row.size_bytes,
        content_hash: row.content_hash,
        is_pinned: row.is_pinned != 0,
        is_favorite: row.is_favorite != 0,
        is_deleted: row.is_deleted != 0,
        created_at: row.created_at,
        updated_at: row.updated_at,
        last_used_at: row.last_used_at,
        deleted_at: row.deleted_at,
    }
}

fn parse_json<T: serde::de::DeserializeOwned>(value: Option<String>) -> Option<T> {
    value.and_then(|value| serde_json::from_str(&value).ok())
}

fn bool_int(value: bool) -> i32 {
    if value {
        1
    } else {
        0
    }
}

fn now() -> String {
    chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true)
}

fn sql_escape(value: &str) -> String {
    value.replace('\'', "''")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{default_format_info, ClipboardItemInput};

    fn test_repo() -> (tempfile::TempDir, ClipRepository) {
        let dir = tempfile::tempdir().expect("temp dir");
        let repo = ClipRepository::with_path(&dir.path().join("clipwheel.sqlite")).expect("repo");
        (dir, repo)
    }

    fn text_input(content: &str, hash: &str) -> ClipboardItemInput {
        ClipboardItemInput {
            item_type: "plain_text".into(),
            title: content.into(),
            preview_text: content.into(),
            content_text: Some(content.into()),
            content_html: None,
            content_rtf: None,
            image_path: None,
            thumbnail_path: None,
            file_paths: Vec::new(),
            format_info: default_format_info("test"),
            content_signals: Vec::new(),
            url: None,
            code_language: None,
            source_app: None,
            size_bytes: content.len() as i64,
            content_hash: hash.into(),
        }
    }

    #[test]
    fn allows_duplicate_hash_rows_for_duplicate_capture_setting() {
        let (_dir, repo) = test_repo();

        repo.create_item(text_input("same", "duplicate-hash"))
            .expect("first item");
        repo.create_item(text_input("same", "duplicate-hash"))
            .expect("duplicate item");

        let items = repo
            .list_items(HistoryQuery {
                limit: Some(10),
                ..Default::default()
            })
            .expect("items");
        assert_eq!(items.len(), 2);
        assert!(items
            .iter()
            .all(|item| item.content_hash == "duplicate-hash"));
    }

    #[test]
    fn updates_item_name_and_filters_by_priority_flag() {
        let (_dir, repo) = test_repo();
        let item = repo
            .create_item(text_input("original", "metadata-hash"))
            .expect("item");

        let renamed = repo
            .update_item_title(&item.id, "Release checklist")
            .expect("title");
        let flagged = repo
            .set_priority_flag(&item.id, Some("red".into()))
            .expect("flag");

        assert_eq!(renamed.title, "Release checklist");
        assert_eq!(flagged.priority_flag.as_deref(), Some("red"));
        let filtered = repo
            .list_items(HistoryQuery {
                flag_filter: Some("red".into()),
                ..Default::default()
            })
            .expect("filtered items");
        assert_eq!(filtered.len(), 1);
        assert_eq!(filtered[0].id, item.id);
        assert!(repo
            .set_priority_flag(&item.id, Some("neon".into()))
            .is_err());
    }

    #[test]
    fn persists_custom_wheel_appearance_presets() {
        let (_dir, repo) = test_repo();
        let appearance = serde_json::to_value(crate::models::WheelAppearanceSettings::default())
            .expect("appearance");
        let updated = repo
            .update_settings(serde_json::json!({
                "wheelAppearancePresets": [{
                    "id": "focus-lime",
                    "name": "Focus Lime",
                    "appearance": appearance,
                }]
            }))
            .expect("settings");

        assert_eq!(updated.wheel_appearance_presets.len(), 1);
        assert_eq!(updated.wheel_appearance_presets[0].name, "Focus Lime");
        let reloaded = repo.get_settings().expect("reloaded settings");
        assert_eq!(reloaded.wheel_appearance_presets[0].id, "focus-lime");
    }

    #[test]
    fn max_history_items_soft_deletes_oldest_unpinned_items() {
        let (_dir, repo) = test_repo();
        repo.update_settings(serde_json::json!({ "maxHistoryItems": 2 }))
            .expect("settings");

        let first = repo
            .create_item(text_input("first", "hash-1"))
            .expect("first");
        std::thread::sleep(std::time::Duration::from_millis(2));
        let second = repo
            .create_item(text_input("second", "hash-2"))
            .expect("second");
        std::thread::sleep(std::time::Duration::from_millis(2));
        let third = repo
            .create_item(text_input("third", "hash-3"))
            .expect("third");

        let active = repo
            .list_items(HistoryQuery {
                limit: Some(10),
                ..Default::default()
            })
            .expect("active");
        assert_eq!(active.len(), 2);
        assert!(!active.iter().any(|item| item.id == first.id));
        assert!(active.iter().any(|item| item.id == second.id));
        assert!(active.iter().any(|item| item.id == third.id));

        let deleted_first = repo.get_item(&first.id).expect("deleted first");
        assert!(deleted_first.is_deleted);
    }

    #[test]
    fn lowering_max_history_items_prunes_existing_history() {
        let (_dir, repo) = test_repo();

        let first = repo
            .create_item(text_input("first", "hash-1"))
            .expect("first");
        std::thread::sleep(std::time::Duration::from_millis(2));
        let second = repo
            .create_item(text_input("second", "hash-2"))
            .expect("second");
        std::thread::sleep(std::time::Duration::from_millis(2));
        let third = repo
            .create_item(text_input("third", "hash-3"))
            .expect("third");

        repo.update_flags(&first.id, Some(true), None)
            .expect("pin first");
        repo.update_settings(serde_json::json!({ "maxHistoryItems": 1 }))
            .expect("settings");

        let active = repo
            .list_items(HistoryQuery {
                limit: Some(10),
                ..Default::default()
            })
            .expect("active");
        assert_eq!(active.len(), 1);
        assert!(active
            .iter()
            .any(|item| item.id == first.id && item.is_pinned));

        let deleted_second = repo.get_item(&second.id).expect("deleted second");
        assert!(deleted_second.is_deleted);
        let deleted_third = repo.get_item(&third.id).expect("deleted third");
        assert!(deleted_third.is_deleted);
    }
}

fn electron_db_path() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_default();
    if cfg!(target_os = "macos") {
        PathBuf::from(home).join("Library/Application Support/ClipWheel/clipwheel.sqlite")
    } else if cfg!(target_os = "windows") {
        std::env::var("APPDATA")
            .map(PathBuf::from)
            .unwrap_or_default()
            .join("ClipWheel/clipwheel.sqlite")
    } else {
        std::env::var("XDG_CONFIG_HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from(home).join(".config"))
            .join("ClipWheel/clipwheel.sqlite")
    }
}
