/**
 * db.js — SQLite connection and schema setup for MedTrack API.
 *
 * Uses a separate database file for tests (set via DB_PATH env var) so that
 * running the test suite never touches the real medtrack.db used by the
 * running server — this matters once this app is exercised by a Jenkins
 * pipeline (Test stage should not corrupt data used by the Deploy stage).
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'medtrack.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS medications (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name   TEXT NOT NULL,
    medication     TEXT NOT NULL,
    dosage         TEXT NOT NULL,
    time_of_day    TEXT NOT NULL,
    taken          INTEGER NOT NULL DEFAULT 0,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

module.exports = db;
