-- Piece Dot Fun Advanced SQLite Schema

-- USERS (ACCOUNTS)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_key TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT,
  password_hash TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- USER PROFILES (EXTENDED DETAILS)
CREATE TABLE IF NOT EXISTS user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  language TEXT,
  country TEXT,
  timezone TEXT,
  website TEXT,
  social_links TEXT, -- JSON string
  preferences TEXT,  -- JSON string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- USER ADDRESSES
CREATE TABLE IF NOT EXISTS user_addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  label TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  latitude REAL,
  longitude REAL,
  is_primary BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- MARKETS
CREATE TABLE IF NOT EXISTS markets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id INTEGER,
  state TEXT,
  city TEXT,
  address TEXT,
  postal_code TEXT,
  country TEXT,
  latitude REAL,
  longitude REAL,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  banner_url TEXT,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(owner_id) REFERENCES users(id),
  FOREIGN KEY(category_id) REFERENCES market_categories(id)
);

-- MARKET CATEGORIES
CREATE TABLE IF NOT EXISTS market_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  parent_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(parent_id) REFERENCES market_categories(id)
);

-- MARKET IMAGES
CREATE TABLE IF NOT EXISTS market_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  market_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(market_id) REFERENCES markets(id)
);

-- MARKET REVIEWS
CREATE TABLE IF NOT EXISTS market_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  market_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(market_id) REFERENCES markets(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- MARKET ADMINS (MULTI-ADMIN SUPPORT)
CREATE TABLE IF NOT EXISTS market_admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  market_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(market_id) REFERENCES markets(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- EXTENSIBLE USER/ACCOUNT DETAILS
CREATE TABLE IF NOT EXISTS user_custom_fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  field_name TEXT NOT NULL,
  field_value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- EXTENSIBLE MARKET DETAILS
CREATE TABLE IF NOT EXISTS market_custom_fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  market_id INTEGER NOT NULL,
  field_name TEXT NOT NULL,
  field_value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(market_id) REFERENCES markets(id)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_public_key ON users(public_key);
CREATE INDEX IF NOT EXISTS idx_markets_owner_id ON markets(owner_id);
CREATE INDEX IF NOT EXISTS idx_markets_category_id ON markets(category_id);
CREATE INDEX IF NOT EXISTS idx_market_reviews_market_id ON market_reviews(market_id);
CREATE INDEX IF NOT EXISTS idx_market_reviews_user_id ON market_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_market_admins_market_id ON market_admins(market_id);
CREATE INDEX IF NOT EXISTS idx_market_admins_user_id ON market_admins(user_id); 