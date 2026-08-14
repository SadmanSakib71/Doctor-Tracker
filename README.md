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

**Phase 4 — Doctor Management API**
- Authenticated CRUD for doctors
- Server-side search, filtering, sorting, and pagination

Patient CRUD and the dashboard are not implemented yet.

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

## Doctor Management API

All doctor endpoints require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| POST | `/api/doctors` | Create a doctor |
| GET | `/api/doctors` | List doctors (search, filter, sort, paginate) |
| GET | `/api/doctors/:id` | Get a single doctor |
| PUT | `/api/doctors/:id` | Update a doctor |
| DELETE | `/api/doctors/:id` | Delete a doctor |

List query parameters:

- `page`, `limit` — pagination (`page` defaults to 1, `limit` defaults to 10, max 100)
- `search` — case-insensitive match on name, specialization, or hospital
- `specialization`, `hospital` — optional filters
- `fromDate`, `toDate` — filter by `createdAt` (`YYYY-MM-DD`; `toDate` includes the full day)
- `sortBy` — `createdAt` (default) or `name`
- `sortOrder` — `asc` or `desc` (default)

Pagination response:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 125,
    "totalPages": 13
  }
}
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The login page is at `http://localhost:3000/login`.
