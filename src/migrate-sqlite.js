import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, "schema-sqlite.sql");
const dbFile =
  process.env.SQLITE_FILE || path.join(__dirname, "../data/database.sqlite");

if (!fs.existsSync(path.dirname(dbFile)))
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });

const schema = fs.readFileSync(schemaPath, "utf8");

const db = new Database(dbFile);
try {
  db.pragma("foreign_keys = ON");
  db.exec(schema);
  console.log("SQLite database created/updated at", dbFile);
} catch (err) {
  console.error("Migration failed:", err);
  process.exit(1);
} finally {
  db.close();
}
