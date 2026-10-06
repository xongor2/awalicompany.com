-- Production-safe reference data only. No demo business records are inserted.

INSERT IGNORE INTO blog_categories (name) VALUES
  ('Real Estate'), ('Investment'), ('Business'), ('Education'), ('Lifestyle');

INSERT IGNORE INTO roles (id, name, description, type, page_access) VALUES
  ('role-admin', 'Admin', 'Full access to every management page and configuration area.', 'System',
   '["dashboard","properties","services","agencies","blogs","users","roles","profile"]'),
  ('role-agent', 'Agent', 'Operational access for property, service, agency, and content work.', 'System',
   '["dashboard","properties","services","agencies","blogs","profile"]'),
  ('role-client', 'Client', 'Limited portal access for authorized clients.', 'System',
   '["dashboard","properties","services","profile"]');
