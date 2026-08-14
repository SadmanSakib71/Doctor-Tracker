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

**Phase 5 — Patient Management API**

- Authenticated CRUD for patients
- Patients belong to a doctor (`doctorId` reference)
- Server-side search, filtering, sorting, and pagination
- Nested list: patients for a specific doctor

**Phase 6 — Frontend authentication & dashboard layout**

- Admin login connected to `POST /api/auth/login`
- JWT stored in `localStorage`
- Protected frontend routes (`/dashboard`, `/doctors`, `/patients`)
- Main dashboard layout (sidebar, header, responsive)
- Placeholder dashboard cards (no live analytics yet)

Doctor and patient CRUD screens are not implemented yet.

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

| Method | Path              | Auth         | Description                    |
| ------ | ----------------- | ------------ | ------------------------------ |
| GET    | `/api/health`     | No           | Health check                   |
| POST   | `/api/auth/login` | No           | Login with email and password  |
| GET    | `/api/auth/me`    | Bearer token | Returns the authenticated user |

Login request body:

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

## Doctor Management API

All doctor endpoints require `Authorization: Bearer <token>`.

| Method | Path               | Description                                   |
| ------ | ------------------ | --------------------------------------------- |
| POST   | `/api/doctors`     | Create a doctor                               |
| GET    | `/api/doctors`     | List doctors (search, filter, sort, paginate) |
| GET    | `/api/doctors/:id` | Get a single doctor                           |
| PUT    | `/api/doctors/:id` | Update a doctor                               |
| DELETE | `/api/doctors/:id` | Delete a doctor                               |

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

## Patient Management API

All patient endpoints require `Authorization: Bearer <token>`.

A patient belongs to a doctor through `doctorId` (ObjectId reference). Doctor details are not copied into the patient document. List and detail responses populate the doctor's `name`, `specialization`, and `hospital`.

| Method | Path                              | Description                                    |
| ------ | --------------------------------- | ---------------------------------------------- |
| POST   | `/api/patients`                   | Create a patient under a doctor                |
| GET    | `/api/patients`                   | List patients (search, filter, sort, paginate) |
| GET    | `/api/patients/:id`               | Get a single patient                           |
| PUT    | `/api/patients/:id`               | Update a patient                               |
| DELETE | `/api/patients/:id`               | Delete a patient                               |
| GET    | `/api/doctors/:doctorId/patients` | List patients for a specific doctor            |

Create requires `doctorId`, `name`, `phone`, and `condition`. Optional fields: `email`, `age`, `gender`, `address`. The referenced doctor must already exist.

List query parameters:

- `page`, `limit` — pagination (`page` defaults to 1, `limit` defaults to 10, max 100)
- `search` — case-insensitive match on name, email, phone, or condition
- `doctorId`, `condition`, `gender` — optional filters
- `fromDate`, `toDate` — filter by `createdAt` (`YYYY-MM-DD`; `toDate` includes the full day)
- `sortBy` — `createdAt` (default), `name`, or `age`
- `sortOrder` — `asc` or `desc` (default)

`GET /api/doctors/:doctorId/patients` supports the same search, filter, sort, and pagination parameters (except `doctorId`, which comes from the path). The doctor must exist.

Pagination response:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

## Frontend setup

1. Copy `frontend/.env.example` to `frontend/.env.local`.
2. Install dependencies and start the app:

```bash
cd frontend
npm install
npm run dev
```

The login page is at `http://localhost:3000/login`.

Required environment variables:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Frontend Authentication & UI

- **Login flow:** `/login` submits email and password to `POST /api/auth/login`. On success, the JWT and user info are saved and the admin is sent to `/dashboard`.
- **JWT storage:** The token is stored in `localStorage` (`doctor-tracker-token`). User info is stored alongside it for the header. Both are removed on logout.
- **Protected routes:** `/dashboard`, `/doctors`, and `/patients` check for a token in the browser and redirect to `/login` if it is missing. Visiting `/login` while already authenticated redirects to `/dashboard`. This is UX-only; APIs still require a Bearer token.
- **Dashboard layout:** Authenticated pages use a sidebar + header shell. Navigation: Dashboard, Doctors, Patients. Doctors and Patients are placeholder pages for now.
- **Responsive design:** Desktop uses a fixed sidebar. On smaller screens the sidebar becomes a drawer opened from the header menu button.
- **Main navigation:** Dashboard is the working home view. It shows placeholder stat cards (24 / 156 / 18 / 8) and an "Analytics will appear here" section.
- **Minimal dependencies:** Login uses `fetch()`, token storage uses `localStorage`, UI state uses React state, and styling uses Tailwind. No extra auth, state, or chart libraries were added.
