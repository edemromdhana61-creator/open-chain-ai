import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

// SQLite für einfache Einrichtung - kein Docker nötig!
const sqlite = new Database('./data/openchain.db');
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite);

// Health check
export function checkDatabase(): boolean {
  try {
    sqlite.prepare('SELECT 1').get();
    return true;
  } catch {
    return false;
  }
}
