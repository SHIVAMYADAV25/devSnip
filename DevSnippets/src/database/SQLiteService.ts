import * as SQLite from 'expo-sqlite';
import type { Snippet, Attachment, ExportRecord, Stats } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('devsnippets.db');
    await initDatabase(db);
  }
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS snippets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      language TEXT NOT NULL,
      code TEXT NOT NULL,
      tags TEXT DEFAULT '',
      favorite INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snippet_id INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT DEFAULT 'file',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(snippet_id) REFERENCES snippets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snippet_id INTEGER,
      file_path TEXT NOT NULL,
      format TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

// ── Snippets ──────────────────────────────────────────────────────────────────

export async function createSnippet(
  title: string,
  language: string,
  code: string,
  tags: string
): Promise<number> {
  const database = await getDb();
  const result = await database.runAsync(
    `INSERT INTO snippets (title, language, code, tags) VALUES (?, ?, ?, ?)`,
    [title, language, code, tags]
  );
  return result.lastInsertRowId;
}

export async function getAllSnippets(
  search = '',
  language = '',
  favoritesOnly = false,
  sortBy = 'created_at',
  sortOrder = 'DESC'
): Promise<Snippet[]> {
  const database = await getDb();
  let query = `SELECT * FROM snippets WHERE 1=1`;
  const params: (string | number)[] = [];

  if (search) {
    query += ` AND (title LIKE ? OR code LIKE ? OR tags LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s);
  }
  if (language) {
    query += ` AND language = ?`;
    params.push(language);
  }
  if (favoritesOnly) {
    query += ` AND favorite = 1`;
  }

  const validSort = ['created_at', 'updated_at', 'title'].includes(sortBy) ? sortBy : 'created_at';
  const validOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';
  query += ` ORDER BY ${validSort} ${validOrder}`;

  return await database.getAllAsync<Snippet>(query, params);
}

export async function getSnippet(id: number): Promise<Snippet | null> {
  const database = await getDb();
  return await database.getFirstAsync<Snippet>(
    `SELECT * FROM snippets WHERE id = ?`, [id]
  );
}

export async function updateSnippet(
  id: number,
  title: string,
  language: string,
  code: string,
  tags: string
): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `UPDATE snippets SET title=?, language=?, code=?, tags=?, updated_at=datetime('now') WHERE id=?`,
    [title, language, code, tags, id]
  );
}

export async function deleteSnippet(id: number): Promise<void> {
  const database = await getDb();
  await database.runAsync(`DELETE FROM snippets WHERE id = ?`, [id]);
}

export async function toggleFavorite(id: number, current: number): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `UPDATE snippets SET favorite = ?, updated_at=datetime('now') WHERE id = ?`,
    [current === 1 ? 0 : 1, id]
  );
}

export async function getStats(): Promise<Stats> {
  const database = await getDb();
  const snippetsRow = await database.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM snippets`);
  const favRow = await database.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM snippets WHERE favorite = 1`);
  const exportsRow = await database.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM exports`);

  return {
    totalSnippets: snippetsRow?.count ?? 0,
    totalFavorites: favRow?.count ?? 0,
    totalFiles: 0,
    totalExports: exportsRow?.count ?? 0,
  };
}

// ── Attachments ───────────────────────────────────────────────────────────────

export async function addAttachment(
  snippetId: number,
  filePath: string,
  fileName: string,
  fileType: string
): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO attachments (snippet_id, file_path, file_name, file_type) VALUES (?, ?, ?, ?)`,
    [snippetId, filePath, fileName, fileType]
  );
}

export async function getAttachments(snippetId: number): Promise<Attachment[]> {
  const database = await getDb();
  return await database.getAllAsync<Attachment>(
    `SELECT * FROM attachments WHERE snippet_id = ?`, [snippetId]
  );
}

export async function deleteAttachment(id: number): Promise<void> {
  const database = await getDb();
  await database.runAsync(`DELETE FROM attachments WHERE id = ?`, [id]);
}

// ── Exports ───────────────────────────────────────────────────────────────────

export async function recordExport(
  snippetId: number,
  filePath: string,
  format: string
): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO exports (snippet_id, file_path, format) VALUES (?, ?, ?)`,
    [snippetId, filePath, format]
  );
}

export async function getDatabaseSize(): Promise<string> {
  try {
    const database = await getDb();
    const countRow = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM snippets`
    );
    // Rough estimate: avg 2KB per snippet
    const sizeKb = ((countRow?.count ?? 0) * 2 + 12).toFixed(1);
    return `${sizeKb} KB`;
  } catch {
    return '—';
  }
}

export async function clearDatabase(): Promise<void> {
  const database = await getDb();
  await database.execAsync(`
    DELETE FROM attachments;
    DELETE FROM exports;
    DELETE FROM snippets;
  `);
}
