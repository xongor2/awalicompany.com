-- =====================================================================
-- AW Ali Company - MySQL Seed Data
-- =====================================================================

USE `aw_ali_db`;

-- User accounts are intentionally not seeded with default credentials.
-- Create the first account through the registration flow or a secure deployment process.

-- 1. SEED PROPERTIES
INSERT INTO `properties` (`id`, `title`, `description`, `property_type`, `location`, `price`, `image`, `status`, `address`, `buy_rent`, `bedrooms`, `bathrooms`, `balcony`, `sqm`, `area_sqft`, `street`, `furnishing_status`, `shopping`, `masjid`, `payment`, `gallery`)
VALUES
  ('prop-1', 'Somalia Oceanfront Executive Villa', 'Ultra luxury Mediterranean design villa right along the pristine coastline of Lido Beach, Mogadishu.', 'Villa', 'Mogadishu, Lido Beach, Somalia', 485000.00, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop&q=80', 'Active', 'Beachfront Road, Lido District, Mogadishu', 'Sale', 5, 6, 'Yes', 450.00, 4840.00, 'Paved Coastline Road', 'Furnished', '5 min to Ocean Mall', 'Near', 'Bank Wire / Installments', '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80"]'),
  ('prop-2', 'Bosphorus View Panoramic Penthouse', 'High-end duplex penthouse in Beşiktaş, Istanbul overlooking the Bosphorus Strait with direct yacht berth access.', 'Apartment', 'Beşiktaş, Istanbul, Turkey', 920000.00, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80', 'Active', 'Çırağan Cd. No: 42, Beşiktaş, Istanbul', 'Sale', 4, 4, 'Yes', 320.00, 3440.00, 'Main Boulevard', 'Furnished', 'Near Zorlu Center', 'Near', 'Full / Mortgage Eligible', '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80"]')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- 3. SEED SERVICES
INSERT INTO `services` (`id`, `name`, `category`, `description`, `image`, `status`, `features`)
VALUES
  ('srv-1', 'Corporate Strategy & Governance Advisory', 'Consulting', 'Full spectrum strategic enterprise consulting, feasibility diagnostics, and regulatory restructuring.', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80', 'Active', '["Commercial Feasibility Studies", "Governance Structuring", "Market Entry & Due Diligence"]'),
  ('srv-2', 'Foreign Academic Admissions & Visa Placement', 'Education', 'Certified university placement and scholarship admissions for top-tier institutions across Turkey, UK, and Europe.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80', 'Active', '["Guaranteed Admission Guidance", "Embassy Visa Verification", "Student Housing Coordination"]')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 4. SEED AGENCIES
INSERT INTO `agencies` (`id`, `name`, `location`, `contact`, `phone`, `email`, `status`, `website`, `rating`, `verified`, `services_offered`)
VALUES
  ('ag-1', 'Istanbul Horizon Trade & Logistics', 'Istanbul, Turkey', 'Mehmet Demir', '+90 212 555 8899', 'info@istanbulhorizontrade.com', 'Active', 'https://istanbulhorizontrade.com', 4.90, TRUE, '["Import/Export", "Customs Clearance", "Warehouse Storage"]'),
  ('ag-2', 'Hormuud Global Cargo & Freight', 'Mogadishu, Somalia', 'Abdirahman Nuur', '+252 61 555 4321', 'support@hormuudcargo.so', 'Active', 'https://hormuudcargo.so', 4.85, TRUE, '["Air Cargo", "Sea Freight", "Express Distribution"]')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);
