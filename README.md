# AW Ali Company

Mashruucu wuxuu u qaybsan yahay saddex qaybood oo waaweyn:

- `FrontEnd/`: React UI, pages, components, assets, public files, iyo Vite configuration.
- `BackEnd/`: Express server, middleware, API routes, iyo environment example.
- `DataBase/`: MySQL connection, migrations, schema, seeds, iyo JSON fallback database.

Faylasha ku haray root-ka (`package.json`, `bun.lock`, `.gitignore`, iyo `README.md`) waa maamulka guud ee mashruuca oo ay wada isticmaalaan saddexda qaybood.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `BackEnd/.env.example` to `.env` and set the required values.
3. Run the app:
   `npm run dev`

## Other Commands

- `npm run build`: Build the frontend and backend.
- `npm run start`: Start the production server after building.
- `npm run lint`: Type-check the frontend.
- `npx tsx DataBase/migrate.ts --run`: Apply the MySQL schema and seed data.
