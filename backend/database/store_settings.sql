-- Shivora Lighting: store settings
-- The Node.js backend also creates this table automatically on startup.
-- This script is provided for manual database setup/reference.

CREATE TABLE IF NOT EXISTS store_settings (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  store_name VARCHAR(120) NOT NULL,
  store_email VARCHAR(190) NOT NULL,
  store_mobile VARCHAR(30) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  theme VARCHAR(50) NOT NULL DEFAULT 'Slate & Pearl',
  store_status VARCHAR(20) NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO store_settings
(
  id,
  store_name,
  store_email,
  store_mobile,
  currency,
  theme,
  store_status
)
VALUES
(
  1,
  'Shivora Lighting',
  'admin@shivora.com',
  '9999999999',
  'INR',
  'Slate & Pearl',
  'Open'
);
