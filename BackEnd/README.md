# BackEnd (Node.js & Express API Server)

This folder contains the complete backend REST API application built with **Node.js** and **Express**.

## Directory Structure
- `app.ts`: Express application builder mounting all routes, CORS, and JSON middleware.
- `server.ts`: Application entry point; starts Express and connects the frontend Vite middleware in development.
- `.env.example`: Example environment configuration.
- `tsconfig.json`: TypeScript configuration for the backend and database adapter.
- `middleware/`:
  - `authMiddleware.ts`: Token verification and user role enforcement.
- `routes/`:
  - `authRoutes.ts`: `/api/auth` (login, register, me, logout, users)
  - `propertyRoutes.ts`: `/api/properties` (CRUD for real estate properties)
  - `serviceRoutes.ts`: `/api/services` (CRUD for consulting & education services)
  - `agencyRoutes.ts`: `/api/agencies` (CRUD and registration for partner agencies)
  - `blogRoutes.ts`: `/api/blogs` (articles and industry insights)
  - `inquiryRoutes.ts`: `/api/inquiries` and `/api/newsletter` (customer leads & newsletter subscribers)
  - `statsRoutes.ts`: `/api/stats` (analytics and metrics for the dashboard)

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database Driver**: `mysql2/promise` (connected to `../DataBase/mysql.ts`)
- **Fallback Data Store**: `../DataBase/db.ts`
