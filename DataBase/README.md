# DataBase (Production MySQL Architecture)

This folder contains the complete relational MySQL database configuration, schemas, seed data, and connection utilities for the AW Ali Company application.

## Files
- `schema.sql`: Idempotent DDL for all application tables inside the database created in hPanel.
- `seeds.sql`: Production-safe reference rows only (system roles and blog categories); it never inserts demo business data.
- `mysql.ts`: Database connection pool using `mysql2/promise` with automatic keep-alive and environment variable configuration.
- `migrate.ts`: Automated migration script to apply `schema.sql` and `seeds.sql`.
- `repository.ts`: The asynchronous MySQL repository used by every API route.
- `models.ts`: Shared backend data contracts.
- `security.ts`: Password hashing and legacy-hash verification.
- `awali_database.json`: One-time legacy import source. It is ignored by Git and is not used after migration.

## Configuration (.env)
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=your_hpanel_database_name
SEED_ADMIN_NAME=Main Admin
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=change-this-after-first-login
```

The `SEED_ADMIN_*` values bootstrap one active administrator only when it does
not already exist. Existing passwords are never overwritten. Keep all secrets
in Hostinger environment variables, never in Git.

## Running Migrations
To migrate the database directly using Node.js:
```bash
npx tsx DataBase/migrate.ts --run
```
The server also runs these idempotent migrations before it starts accepting traffic.
