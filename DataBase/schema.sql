-- AW Ali Company production schema. The database itself is created in hPanel.
-- This script creates application tables inside the configured DB_NAME.

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  password_salt VARCHAR(128) NOT NULL,
  role ENUM('Admin', 'Agent', 'Agency', 'Client') NOT NULL DEFAULT 'Client',
  status ENUM('Active', 'Pending', 'Inactive') NOT NULL DEFAULT 'Active',
  profile_image MEDIUMTEXT NULL,
  phone VARCHAR(50) NULL,
  protected_account BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_users_role (role), INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Keep existing production databases aligned when a new account role is introduced.
ALTER TABLE users
  MODIFY COLUMN role ENUM('Admin', 'Agent', 'Agency', 'Client') NOT NULL DEFAULT 'Client';

CREATE TABLE IF NOT EXISTS sessions (
  token VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_user (user_id), INDEX idx_sessions_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS properties (
  id VARCHAR(64) PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT NOT NULL,
  property_type ENUM('Residential', 'Commercial', 'Apartment', 'Villa', 'Plot') NOT NULL,
  location VARCHAR(191) NOT NULL, price DECIMAL(14,2) NOT NULL DEFAULT 0, image MEDIUMTEXT NOT NULL,
  status ENUM('Active', 'Pending', 'Sold') NOT NULL DEFAULT 'Active', address VARCHAR(255) NULL,
  buy_rent ENUM('Sale', 'Rent') NULL, bedrooms VARCHAR(100) NULL, bathrooms INT UNSIGNED NULL,
  balcony ENUM('Yes', 'No') NULL, sqm DECIMAL(10,2) NULL, area_sqft DECIMAL(10,2) NULL,
  street VARCHAR(100) NULL, furnishing_status ENUM('Furnished', 'Semi-Furnished', 'Unfurnished') NULL,
  shopping VARCHAR(100) NULL, masjid ENUM('Near', 'Far') NULL, payment VARCHAR(100) NULL, gallery JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_properties_status (status), INDEX idx_properties_type (property_type),
  INDEX idx_properties_location (location), INDEX idx_properties_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bedrooms can contain descriptive text such as "3+1" or "Studio".
ALTER TABLE properties
  MODIFY COLUMN bedrooms VARCHAR(100) NULL;

CREATE TABLE IF NOT EXISTS property_location_categories (
  id VARCHAR(64) PRIMARY KEY,
  kind ENUM('Country', 'City') NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_property_location_kind_name (kind, name),
  INDEX idx_property_location_kind (kind),
  INDEX idx_property_location_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(64) PRIMARY KEY, name VARCHAR(255) NOT NULL,
  category ENUM('Education', 'Consulting', 'Import / Export', 'Real Estate') NOT NULL,
  description TEXT NOT NULL, image MEDIUMTEXT NOT NULL,
  status ENUM('Active', 'Pending', 'Inactive') NOT NULL DEFAULT 'Active', features JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_services_category (category), INDEX idx_services_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS education_opportunities (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  thumbnail MEDIUMTEXT NULL,
  available_degrees JSON NOT NULL,
  university_url VARCHAR(2048) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_education_opportunities_title (title(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add thumbnails safely when upgrading an Education table created by an earlier release.
SET @education_thumbnail_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'education_opportunities'
    AND COLUMN_NAME = 'thumbnail'
);
SET @education_thumbnail_sql = IF(
  @education_thumbnail_exists = 0,
  'ALTER TABLE education_opportunities ADD COLUMN thumbnail MEDIUMTEXT NULL AFTER description',
  'SELECT 1'
);
PREPARE education_thumbnail_statement FROM @education_thumbnail_sql;
EXECUTE education_thumbnail_statement;
DEALLOCATE PREPARE education_thumbnail_statement;

CREATE TABLE IF NOT EXISTS health_specialties (
  id VARCHAR(64) PRIMARY KEY,
  category VARCHAR(150) NOT NULL,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(150) NOT NULL DEFAULT '',
  city VARCHAR(150) NOT NULL DEFAULT '',
  tagline VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  key_procedures JSON NOT NULL,
  destinations JSON NOT NULL,
  image MEDIUMTEXT NOT NULL,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_health_specialties_category (category),
  INDEX idx_health_specialties_status (status),
  INDEX idx_health_specialties_name (name(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add hospital location safely when upgrading an earlier Health table.
SET @health_country_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'health_specialties' AND COLUMN_NAME = 'country'
);
SET @health_country_sql = IF(
  @health_country_exists = 0,
  'ALTER TABLE health_specialties ADD COLUMN country VARCHAR(150) NOT NULL DEFAULT '''' AFTER name',
  'SELECT 1'
);
PREPARE health_country_statement FROM @health_country_sql;
EXECUTE health_country_statement;
DEALLOCATE PREPARE health_country_statement;

SET @health_city_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'health_specialties' AND COLUMN_NAME = 'city'
);
SET @health_city_sql = IF(
  @health_city_exists = 0,
  'ALTER TABLE health_specialties ADD COLUMN city VARCHAR(150) NOT NULL DEFAULT '''' AFTER country',
  'SELECT 1'
);
PREPARE health_city_statement FROM @health_city_sql;
EXECUTE health_city_statement;
DEALLOCATE PREPARE health_city_statement;

CREATE TABLE IF NOT EXISTS blogs (
  id VARCHAR(64) PRIMARY KEY, title VARCHAR(255) NOT NULL, content LONGTEXT NOT NULL,
  thumbnail MEDIUMTEXT NOT NULL, categories JSON NOT NULL,
  status ENUM('Published', 'Draft') NOT NULL DEFAULT 'Draft', published_date VARCHAR(50) NOT NULL DEFAULT '',
  author VARCHAR(150) NOT NULL DEFAULT 'AW Ali Editorial', views INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_blogs_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_categories (
  name VARCHAR(100) PRIMARY KEY, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS agencies (
  id VARCHAR(64) PRIMARY KEY, name VARCHAR(255) NOT NULL, logo MEDIUMTEXT NULL,
  country VARCHAR(100) NOT NULL, city VARCHAR(100) NOT NULL, contact_name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL, phone VARCHAR(50) NOT NULL, website VARCHAR(255) NOT NULL DEFAULT '',
  address VARCHAR(255) NOT NULL DEFAULT '', verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_agencies_country (country), INDEX idx_agencies_city (city), INDEX idx_agencies_verified (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(64) PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, description TEXT NOT NULL,
  type ENUM('System', 'Custom') NOT NULL DEFAULT 'Custom', page_access JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inquiries (
  id VARCHAR(64) PRIMARY KEY,
  type ENUM('Property', 'Consulting', 'Health', 'Education', 'Agency', 'General') NOT NULL DEFAULT 'General',
  name VARCHAR(150) NOT NULL, email VARCHAR(191) NOT NULL, phone VARCHAR(50) NULL,
  subject VARCHAR(255) NULL, details TEXT NOT NULL,
  status ENUM('New', 'In Progress', 'Resolved', 'Archived') NOT NULL DEFAULT 'New',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_inquiries_status (status), INDEX idx_inquiries_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id VARCHAR(64) PRIMARY KEY, email VARCHAR(191) NOT NULL UNIQUE,
  subscribed_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_migrations (
  migration_key VARCHAR(191) PRIMARY KEY, applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
