-- AW Ali Company production schema. The database itself is created in hPanel.
-- This script creates application tables inside the configured DB_NAME.

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  password_salt VARCHAR(128) NOT NULL,
  role ENUM('Admin', 'Agent', 'Client') NOT NULL DEFAULT 'Client',
  status ENUM('Active', 'Pending', 'Inactive') NOT NULL DEFAULT 'Active',
  profile_image MEDIUMTEXT NULL,
  phone VARCHAR(50) NULL,
  protected_account BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_users_role (role), INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  buy_rent ENUM('Sale', 'Rent') NULL, bedrooms INT UNSIGNED NULL, bathrooms INT UNSIGNED NULL,
  balcony ENUM('Yes', 'No') NULL, sqm DECIMAL(10,2) NULL, area_sqft DECIMAL(10,2) NULL,
  street VARCHAR(100) NULL, furnishing_status ENUM('Furnished', 'Semi-Furnished', 'Unfurnished') NULL,
  shopping VARCHAR(100) NULL, masjid ENUM('Near', 'Far') NULL, payment VARCHAR(100) NULL, gallery JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_properties_status (status), INDEX idx_properties_type (property_type),
  INDEX idx_properties_location (location), INDEX idx_properties_price (price)
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
