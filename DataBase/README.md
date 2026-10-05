# DataBase (MySQL Database Architecture)

This folder contains the complete relational MySQL database configuration, schemas, seed data, and connection utilities for the AW Ali Company application.

## Files
- `schema.sql`: Full DDL script creating `aw_ali_db` database and all relational tables (`users`, `properties`, `services`, `agencies`, `blogs`, `inquiries`, `newsletter_subscribers`, `sessions`).
- `seeds.sql`: Initial seed data for production and development, including admin users, featured properties, services, and agencies.
- `mysql.ts`: Database connection pool using `mysql2/promise` with automatic keep-alive and environment variable configuration.
- `migrate.ts`: Automated migration script to apply `schema.sql` and `seeds.sql`.
- `db.ts`: JSON fallback data adapter used when MySQL is unavailable.
- `awali_database.json`: Persistent fallback data.

## Configuration (.env)
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=aw_ali_db
```

## Running Migrations
To migrate the database directly using Node.js:
```bash
npx tsx DataBase/migrate.ts --run
```
Or with the MySQL CLI:
```bash
mysql -u root -p < DataBase/schema.sql
mysql -u root -p < DataBase/seeds.sql
```
