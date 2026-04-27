import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dataDirectory = path.join(process.cwd(), 'data');
const databasePath = path.join(dataDirectory, 'group-communication.db');

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const db = new Database(databasePath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS groups_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    owner_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES groups_table(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups_table(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    due_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'To Do',
    priority TEXT NOT NULL DEFAULT 'Medium',
    expected_hours REAL NOT NULL DEFAULT 0,
    actual_hours REAL NOT NULL DEFAULT 0,
    assignee_id INTEGER,
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups_table(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS availability_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    day TEXT NOT NULL,
    time_label TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    reason TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (group_id, user_id, day, time_label),
    FOREIGN KEY (group_id) REFERENCES groups_table(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_key_material (
    user_id INTEGER PRIMARY KEY,
    public_key TEXT NOT NULL,
    encrypted_private_key TEXT NOT NULL,
    wrapping_salt TEXT NOT NULL,
    wrapping_iv TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS group_key_envelopes (
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    encrypted_group_key TEXT NOT NULL,
    shared_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES groups_table(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE
  );
`);

function hasColumn(tableName: string, columnName: string) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  return columns.some((column) => column.name === columnName);
}

function ensureColumn(tableName: string, columnName: string, statement: string) {
  if (hasColumn(tableName, columnName)) {
    return;
  }

  try {
    db.exec(statement);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('duplicate column name')) {
      throw error;
    }
  }
}

ensureColumn('messages', 'is_encrypted', `ALTER TABLE messages ADD COLUMN is_encrypted INTEGER NOT NULL DEFAULT 0;`);
ensureColumn('messages', 'e2ee_iv', `ALTER TABLE messages ADD COLUMN e2ee_iv TEXT;`);

export { db };
