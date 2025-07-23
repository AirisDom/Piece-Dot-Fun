const { getDb } = require("./db");

// Helper to run a query and return a promise
function runQuery(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
function runExec(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// USERS
exports.createUser = (user) =>
  runExec(
    `INSERT INTO users (public_key, username, email, password_hash, phone, bio, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      user.public_key,
      user.username,
      user.email,
      user.password_hash,
      user.phone,
      user.bio,
      user.avatar_url,
    ]
  );
exports.getUserById = (id) =>
  runQuery(`SELECT * FROM users WHERE id = ?;`, [id]);
exports.getUserByPublicKey = (public_key) =>
  runQuery(`SELECT * FROM users WHERE public_key = ?;`, [public_key]);
exports.updateUser = (user) =>
  runExec(
    `UPDATE users SET username = ?, email = ?, phone = ?, bio = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;`,
    [user.username, user.email, user.phone, user.bio, user.avatar_url, user.id]
  );
exports.deleteUser = (id) => runExec(`DELETE FROM users WHERE id = ?;`, [id]);

// USER PROFILES
exports.upsertUserProfile = (profile) =>
  runExec(
    `INSERT INTO user_profiles (user_id, first_name, last_name, date_of_birth, gender, language, country, timezone, website, social_links, preferences)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
      first_name=excluded.first_name,
      last_name=excluded.last_name,
      date_of_birth=excluded.date_of_birth,
      gender=excluded.gender,
      language=excluded.language,
      country=excluded.country,
      timezone=excluded.timezone,
      website=excluded.website,
      social_links=excluded.social_links,
      preferences=excluded.preferences,
      updated_at=CURRENT_TIMESTAMP;`,
    [
      profile.user_id,
      profile.first_name,
      profile.last_name,
      profile.date_of_birth,
      profile.gender,
      profile.language,
      profile.country,
      profile.timezone,
      profile.website,
      profile.social_links,
      profile.preferences,
    ]
  );
exports.getUserProfile = (user_id) =>
  runQuery(`SELECT * FROM user_profiles WHERE user_id = ?;`, [user_id]);

// USER ADDRESSES
exports.addUserAddress = (address) =>
  runExec(
    `INSERT INTO user_addresses (user_id, label, address_line1, address_line2, city, state, postal_code, country, latitude, longitude, is_primary)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      address.user_id,
      address.label,
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.postal_code,
      address.country,
      address.latitude,
      address.longitude,
      address.is_primary,
    ]
  );
exports.getUserAddresses = (user_id) =>
  runQuery(`SELECT * FROM user_addresses WHERE user_id = ?;`, [user_id]);
exports.setPrimaryAddress = (user_id, id) =>
  Promise.all([
    runExec(`UPDATE user_addresses SET is_primary = 0 WHERE user_id = ?;`, [
      user_id,
    ]),
    runExec(
      `UPDATE user_addresses SET is_primary = 1 WHERE id = ? AND user_id = ?;`,
      [id, user_id]
    ),
  ]);

// MARKETS
exports.createMarket = (market) =>
  runExec(
    `INSERT INTO markets (owner_id, name, description, category_id, state, city, address, postal_code, country, latitude, longitude, phone, email, website, logo_url, banner_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      market.owner_id,
      market.name,
      market.description,
      market.category_id,
      market.state,
      market.city,
      market.address,
      market.postal_code,
      market.country,
      market.latitude,
      market.longitude,
      market.phone,
      market.email,
      market.website,
      market.logo_url,
      market.banner_url,
    ]
  );
exports.getMarketById = (id) =>
  runQuery(`SELECT * FROM markets WHERE id = ?;`, [id]);
exports.getAllMarkets = () => runQuery(`SELECT * FROM markets;`);
exports.getMarketsByOwner = (owner_id) =>
  runQuery(`SELECT * FROM markets WHERE owner_id = ?;`, [owner_id]);
exports.updateMarket = (market) =>
  runExec(
    `UPDATE markets SET name = ?, description = ?, category_id = ?, state = ?, city = ?, address = ?, postal_code = ?, country = ?, latitude = ?, longitude = ?, phone = ?, email = ?, website = ?, logo_url = ?, banner_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;`,
    [
      market.name,
      market.description,
      market.category_id,
      market.state,
      market.city,
      market.address,
      market.postal_code,
      market.country,
      market.latitude,
      market.longitude,
      market.phone,
      market.email,
      market.website,
      market.logo_url,
      market.banner_url,
      market.id,
    ]
  );
exports.deleteMarket = (id) =>
  runExec(`DELETE FROM markets WHERE id = ?;`, [id]);

// MARKET CATEGORIES
exports.createMarketCategory = (cat) =>
  runExec(
    `INSERT INTO market_categories (name, description, parent_id) VALUES (?, ?, ?);`,
    [cat.name, cat.description, cat.parent_id]
  );
exports.getAllMarketCategories = () =>
  runQuery(`SELECT * FROM market_categories;`);

// MARKET IMAGES
exports.addMarketImage = (img) =>
  runExec(
    `INSERT INTO market_images (market_id, image_url, is_primary) VALUES (?, ?, ?);`,
    [img.market_id, img.image_url, img.is_primary]
  );
exports.getMarketImages = (market_id) =>
  runQuery(`SELECT * FROM market_images WHERE market_id = ?;`, [market_id]);

// MARKET REVIEWS
exports.addMarketReview = (review) =>
  runExec(
    `INSERT INTO market_reviews (market_id, user_id, rating, comment) VALUES (?, ?, ?, ?);`,
    [review.market_id, review.user_id, review.rating, review.comment]
  );
exports.getMarketReviews = (market_id) =>
  runQuery(`SELECT * FROM market_reviews WHERE market_id = ?;`, [market_id]);
exports.getMarketAvgRating = (market_id) =>
  runQuery(
    `SELECT AVG(rating) as avg_rating FROM market_reviews WHERE market_id = ?;`,
    [market_id]
  );

// MARKET ADMINS
exports.addMarketAdmin = (admin) =>
  runExec(
    `INSERT INTO market_admins (market_id, user_id, role) VALUES (?, ?, ?);`,
    [admin.market_id, admin.user_id, admin.role]
  );
exports.getMarketAdmins = (market_id) =>
  runQuery(`SELECT * FROM market_admins WHERE market_id = ?;`, [market_id]);

// TRANSACTIONS
exports.createTransaction = (tx) =>
  runExec(
    `INSERT INTO transactions (user_id, market_id, amount, type, status) VALUES (?, ?, ?, ?, ?);`,
    [tx.user_id, tx.market_id, tx.amount, tx.type, tx.status]
  );
exports.getTransactionsByUser = (user_id) =>
  runQuery(`SELECT * FROM transactions WHERE user_id = ?;`, [user_id]);
exports.getTransactionsByMarket = (market_id) =>
  runQuery(`SELECT * FROM transactions WHERE market_id = ?;`, [market_id]);
exports.updateTransactionStatus = (id, status) =>
  runExec(
    `UPDATE transactions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;`,
    [status, id]
  );

// AUDIT LOGS
exports.addAuditLog = (log) =>
  runExec(
    `INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?);`,
    [log.user_id, log.action, log.details]
  );
exports.getAuditLogsByUser = (user_id) =>
  runQuery(
    `SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC;`,
    [user_id]
  );

// USER CUSTOM FIELDS
exports.addUserCustomField = (field) =>
  runExec(
    `INSERT INTO user_custom_fields (user_id, field_name, field_value) VALUES (?, ?, ?);`,
    [field.user_id, field.field_name, field.field_value]
  );
exports.getUserCustomFields = (user_id) =>
  runQuery(`SELECT * FROM user_custom_fields WHERE user_id = ?;`, [user_id]);

// MARKET CUSTOM FIELDS
exports.addMarketCustomField = (field) =>
  runExec(
    `INSERT INTO market_custom_fields (market_id, field_name, field_value) VALUES (?, ?, ?);`,
    [field.market_id, field.field_name, field.field_value]
  );
exports.getMarketCustomFields = (market_id) =>
  runQuery(`SELECT * FROM market_custom_fields WHERE market_id = ?;`, [
    market_id,
  ]);

// ADVANCED/FILTERED QUERIES
exports.getMarketsByCategory = (category_id) =>
  runQuery(`SELECT * FROM markets WHERE category_id = ?;`, [category_id]);
exports.getReviewsByUser = (user_id) =>
  runQuery(`SELECT * FROM market_reviews WHERE user_id = ?;`, [user_id]);
// Bounding box query for markets (for distance filtering)
exports.getMarketsInBoundingBox = (latMin, latMax, lngMin, lngMax) =>
  runQuery(
    `SELECT * FROM markets WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?;`,
    [latMin, latMax, lngMin, lngMax]
  );
