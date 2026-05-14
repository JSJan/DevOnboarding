import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database;

export function initDatabase(): void {
  const dbPath = path.join(__dirname, '../../data/onboarding.db');
  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS installations (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      selected_software TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      installation_id TEXT NOT NULL,
      software_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      logs TEXT,
      started_at TEXT,
      completed_at TEXT,
      error TEXT,
      FOREIGN KEY (installation_id) REFERENCES installations(id)
    );
  `);
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}
