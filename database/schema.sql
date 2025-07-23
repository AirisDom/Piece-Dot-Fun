-- Piece Dot Fun SQLite Schema

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_key TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS markets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  state TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  market_id INTEGER,
  amount REAL NOT NULL,
  type TEXT NOT NULL,
  status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(market_id) REFERENCES markets(id)
);

CREATE INDEX IF NOT EXISTS idx_users_public_key ON users(public_key);
CREATE INDEX IF NOT EXISTS idx_markets_owner_id ON markets(owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
