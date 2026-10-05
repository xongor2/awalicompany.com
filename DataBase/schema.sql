-- =====================================================================
-- AW Ali Company - MySQL Database Schema
-- Technology: MySQL 8.0+ / MariaDB 10.5+
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `aw_ali_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `aw_ali_db`;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `password_salt` VARCHAR(128) NOT NULL,
  `role` ENUM('Admin', 'Agent', 'Client') NOT NULL DEFAULT 'Client',
  `status` ENUM('Active', 'Pending', 'Inactive') NOT NULL DEFAULT 'Active',
  `profile_image` TEXT NULL,
  `phone` VARCHAR(50) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. USER SESSIONS TABLE
CREATE TABLE IF NOT EXISTS `sessions` (
  `token` VARCHAR(128) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_sessions_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS `properties` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `property_type` ENUM('Residential', 'Commercial', 'Apartment', 'Villa', 'Plot') NOT NULL DEFAULT 'Residential',
  `location` VARCHAR(191) NOT NULL,
  `price` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `image` TEXT NOT NULL,
  `status` ENUM('Active', 'Pending', 'Sold') NOT NULL DEFAULT 'Active',
  `address` VARCHAR(255) NULL,
  `buy_rent` ENUM('Sale', 'Rent') NOT NULL DEFAULT 'Sale',
  `bedrooms` INT UNSIGNED NULL DEFAULT 0,
  `bathrooms` INT UNSIGNED NULL DEFAULT 0,
  `balcony` ENUM('Yes', 'No') NULL DEFAULT 'No',
  `sqm` DECIMAL(10, 2) NULL DEFAULT 0.00,
  `area_sqft` DECIMAL(10, 2) NULL DEFAULT 0.00,
  `street` VARCHAR(100) NULL DEFAULT 'Yes',
  `furnishing_status` ENUM('Furnished', 'Semi-Furnished', 'Unfurnished') NULL DEFAULT 'Unfurnished',
  `shopping` VARCHAR(100) NULL,
  `masjid` ENUM('Near', 'Far') NULL DEFAULT 'Near',
  `payment` VARCHAR(100) NULL,
  `gallery` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_properties_status` (`status`),
  INDEX `idx_properties_type` (`property_type`),
  INDEX `idx_properties_location` (`location`),
  INDEX `idx_properties_price` (`price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. SERVICES TABLE
CREATE TABLE IF NOT EXISTS `services` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` ENUM('Education', 'Consulting', 'Import / Export', 'Real Estate') NOT NULL,
  `description` TEXT NOT NULL,
  `image` TEXT NOT NULL,
  `status` ENUM('Active', 'Pending', 'Inactive') NOT NULL DEFAULT 'Active',
  `features` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_services_category` (`category`),
  INDEX `idx_services_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS `blogs` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `excerpt` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `author_name` VARCHAR(150) NOT NULL DEFAULT 'AW Ali Editorial',
  `image` TEXT NOT NULL,
  `status` ENUM('Published', 'Draft') NOT NULL DEFAULT 'Published',
  `views` INT UNSIGNED NOT NULL DEFAULT 0,
  `published_at` VARCHAR(50) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_blogs_status` (`status`),
  INDEX `idx_blogs_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. AGENCIES TABLE
CREATE TABLE IF NOT EXISTS `agencies` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `location` VARCHAR(191) NOT NULL,
  `contact` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `status` ENUM('Active', 'Pending', 'Inactive') NOT NULL DEFAULT 'Active',
  `website` VARCHAR(255) NULL,
  `rating` DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  `verified` BOOLEAN NOT NULL DEFAULT TRUE,
  `services_offered` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_agencies_status` (`status`),
  INDEX `idx_agencies_location` (`location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. INQUIRIES & CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `type` ENUM('Property', 'Consulting', 'Health', 'Education', 'Agency', 'General') NOT NULL DEFAULT 'General',
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `subject` VARCHAR(255) NULL,
  `details` TEXT NOT NULL,
  `status` ENUM('New', 'In Progress', 'Resolved', 'Archived') NOT NULL DEFAULT 'New',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_inquiries_type` (`type`),
  INDEX `idx_inquiries_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `subscribed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
