# Doctor Tracker

A secure administrative web application for managing doctors and their corresponding patients.

## Technology Stack

- **Frontend:** Next.js (App Router), JavaScript, Tailwind CSS
- **Backend:** Node.js, Express.js, JavaScript
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **Frontend Data Fetching:** TanStack Query
- **Data Visualization:** Recharts

## Project Structure

```
doctor-tracker/
├── frontend/     → Next.js application
└── backend/      → standalone Node.js + Express application
```

## Current Progress

**Phase 1 — Project setup**
- Frontend and backend apps created
- Express app, CORS, centralized error handling, and health check (`GET /api/health`)
- MongoDB Atlas connected with Mongoose

**Phase 2 — Database models**
- `Doctor` and `Patient` models added
- Patient records are linked to a doctor

**Phase 3 — Authentication**
- Admin user model (`name`, `email`, hashed `password`, `role`)
- Passwords hashed with bcrypt (never stored as plain text)
- Admin seed script creates one admin from environment variables
- `POST /api/auth/login` returns a JWT and safe user info
- `GET /api/auth/me` is a protected test route
- Auth middleware verifies `Authorization: Bearer <token>`
- Minimal login page at `/login` (UI only for now)

Doctor CRUD, Patient CRUD, and the dashboard are not implemented yet.

## Backend setup

1. Copy `backend/.env.example` to `backend/.env` and fill in the values.
2. Install dependencies and start the API:

```bash
cd backend
npm install
npm run dev
```

3. Create the admin user (run once):

```bash
npm run seed:admin
```

Required environment variables:

```
PORT=5000
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=http://localhost:3000
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

## Auth endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/login` | No | Login with email and password |
| GET | `/api/auth/me` | Bearer token | Returns the authenticated user |

Login request body:

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The login page is at `http://localhost:3000/login`.
