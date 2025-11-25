import Database from "better-sqlite3";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root
dotenv.config({ path: path.join(__dirname, "../../.env") });

const dbFile =
  process.env.SQLITE_FILE || path.join(__dirname, "../../data/database.sqlite");

// Ensure data directory exists
const dataDir = path.dirname(dbFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log("Using SQLite DB file:", dbFile);

const db = new Database(dbFile);
// Enable foreign keys
db.pragma("foreign_keys = ON");

function convertPlaceholders(sql) {
  // Convert Postgres-style $1, $2 placeholders to SQLite '?' placeholders
  return sql.replace(/\$[0-9]+/g, "?");
}

async function query(sql, params = []) {
  const converted = convertPlaceholders(sql);
  try {
    const stmt = db.prepare(converted);
    const isSelect = /^\s*(select|pragma)\b/i.test(sql);
    if (isSelect) {
      const rows = stmt.all(...params);
      return { rows };
    } else {
      const info = stmt.run(...params);
      return { rows: [], info };
    }
  } catch (err) {
    console.error("SQLite query error:", err);
    throw err;
  }
}

// Run a quick test query
try {
  const res = db.prepare("SELECT 1 as ok").get();
  console.log("SQLite ready, test query result:", res);
} catch (err) {
  console.error("SQLite initialization error:", err);
}

export default { query, db };
