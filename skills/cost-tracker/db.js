#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(process.env.HOME, '.openclaw', 'data');
const DB_PATH = path.join(DB_DIR, 'cost-tracker.db');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Create schema
db.exec(`
  CREATE TABLE IF NOT EXISTS api_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    task_type TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    cost_usd REAL,
    user_id TEXT,
    session_id TEXT,
    metadata TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_timestamp ON api_calls(timestamp);
  CREATE INDEX IF NOT EXISTS idx_provider ON api_calls(provider);
  CREATE INDEX IF NOT EXISTS idx_user ON api_calls(user_id);
  CREATE INDEX IF NOT EXISTS idx_created ON api_calls(created_at);
`);

module.exports = db;
