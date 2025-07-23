const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "piece_dot_fun.sqlite");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

function initializeDatabase() {
  const db = new sqlite3.Database(DB_PATH);
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  db.exec(schema, (err) => {
    if (err) {
      console.error("Error initializing database schema:", err.message);
    } else {
      console.log("Database schema initialized.");
    }
  });
  return db;
}

let dbInstance = null;

function getDb() {
  if (!dbInstance) {
    dbInstance = initializeDatabase();
  }
  return dbInstance;
}

module.exports = { getDb };
