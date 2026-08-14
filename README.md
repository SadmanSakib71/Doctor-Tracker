# Doctor Tracker

Doctor Tracker is a secure administrative web application for managing doctors and the patients assigned to them. An authenticated admin can search, filter, and update records, then review live dashboard analytics calculated in MongoDB rather than in the browser.

## Features

- Admin authentication with JWT and bcrypt
- Protected frontend routes and protected REST APIs
- Doctor management (create, read, update, delete)
- Patient management (create, read, update, delete)
- Doctor → patient relationship (`doctorId` reference)
- Doctor-specific patient list
- Search, filtering, pagination, and sorting (server-side)
- Dashboard KPIs and charts
- MongoDB aggregation for analytics
- Loading, empty, and error states
- Responsive medical admin UI (desktop table, mobile cards)

## Tech Stack

**Frontend**

- Next.js
- React
- Tailwind CSS
- `fetch()` for API requests
- React state and `localStorage`
- Recharts

**Backend**

- Node.js
- Express

**Database**

- MongoDB
- Mongoose

**Authentication**

- JWT
- bcrypt

## Project Structure

```
doctor-tracker/
├── frontend/     → Next.js application
└── backend/      → standalone Node.js + Express application
```

## Setup Guide

### 1. Clone the repository

```bash
git clone <repository-url>
cd Doctor-Tracker
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

```bash
cd ../backend
npm install
```

### 4. Create the backend environment file

Copy `backend/.env.example` to `backend/.env` and fill in real values:

```bash
cd backend
cp .env.example .env
```

On Windows PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
```

### 5. Create the frontend environment file

Copy `frontend/.env.example` to `frontend/.env.local`:

```bash
cd frontend
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
cd frontend
Copy-Item .env.example .env.local
```

### 6. Start MongoDB / use MongoDB Atlas

Use a local MongoDB instance or a MongoDB Atlas cluster. Put the connection string in `backend/.env` as `MONGODB_URI`.

### 7. Seed the admin user

From the `backend` folder:

```bash
npm run seed:admin
```

This creates one admin from `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. If an admin already exists, the script skips creation.

### 8. Start the backend

```bash
cd backend
npm run dev
```

The API runs on `http://localhost:5000` by default.

### 9. Start the frontend

```bash
cd frontend
npm run dev
```

### 10. Open the application

Open [http://localhost:3000/login](http://localhost:3000/login) and sign in with the seeded admin email and password.

## Environment Variables

### Backend (`backend/.env`)

| Variable         | Purpose                                                            |
| ---------------- | ------------------------------------------------------------------ |
| `PORT`           | API port (default `5000`)                                          |
| `MONGODB_URI`    | MongoDB connection string                                          |
| `JWT_SECRET`     | Secret used to sign and verify JWTs                                |
| `CLIENT_URL`     | Frontend origin allowed by CORS (example: `http://localhost:3000`) |
| `ADMIN_NAME`     | Display name for the seeded admin                                  |
| `ADMIN_EMAIL`    | Email for the seeded admin                                         |
| `ADMIN_PASSWORD` | Plain password hashed with bcrypt during seed                      |

### Frontend (`frontend/.env.local`)

| Variable              | Purpose                                                     |
| --------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL (example: `http://localhost:5000/api`) |

Do not commit `.env` or `.env.local`. Use the `.env.example` files as templates only.

## System Architecture

```
Browser
  ↓
Next.js frontend
  ↓
REST API
  ↓
Express
  ↓
Mongoose
  ↓
MongoDB Atlas
```

### Authentication

```
Login
  ↓
JWT
  ↓
Authorization: Bearer <token>
  ↓
Express auth middleware
```

The frontend stores the JWT in `localStorage` and sends it on protected requests. Missing, invalid, or expired tokens return `401`. Protected pages redirect to `/login`.

### Dashboard

```
Dashboard
  ↓
GET /api/dashboard/summary
  ↓
MongoDB counts + aggregations
  ↓
KPI cards and Recharts
```

The browser does not download all doctors or patients to compute charts. MongoDB returns only the summary and chart series.

## Technical Decisions

### 1. Doctor → Patient references instead of embedding patients

Each patient stores a `doctorId` that references a Doctor document. Doctor details are populated when patients are listed or fetched.

**Why references**

- A doctor can have many patients. Embedding every patient inside the doctor document would make doctor documents large and slower to update.
- Patient search, filtering, pagination, and sorting need to run across all patients, not only inside one doctor. A dedicated Patient collection makes those list queries straightforward.
- The doctor-specific page (`GET /api/doctors/:doctorId/patients`) is a filtered patient query, not a nested rewrite of the data model.
- Updating a doctor name or hospital does not require rewriting every patient document.

**Trade-off**

- Reading a patient list needs a `populate` (or `$lookup`) to show the doctor name. That extra read is acceptable here because list endpoints already paginate, and the populated doctor fields are small.

Embedding would be simpler for a tiny, never-queried nested list. It would not fit search, filters, pagination, or the dashboard aggregations in this project.

### 2. Dashboard analytics in MongoDB instead of the frontend

`GET /api/dashboard/summary` uses `countDocuments` and aggregation pipelines (`$lookup`, `$group`, `$sort`, `$limit`, date `$match`) and returns only the numbers the UI needs.

**Why aggregation**

- The frontend stays a thin display layer: KPI cards and Recharts receive already-shaped data.
- The browser never downloads the full doctor or patient collections.
- Counts, top doctors, condition totals, and 30-day trends stay consistent with the database, including doctors with zero patients.

**Trade-off**

- Aggregation queries are more complex than `find()`. In return, payload size stays small and the UI does not re-implement analytics. Missing days in the 30-day series are filled with `0` in the API so line charts stay continuous without extra frontend math.

## API Documentation

All JSON error responses use:

```json
{
  "success": false,
  "message": "Human-readable error"
}
```

### Health

| Method | Path          | Auth | Description  |
| ------ | ------------- | ---- | ------------ |
| GET    | `/api/health` | No   | Health check |

Response:

```json
{
  "success": true,
  "message": "Doctor Tracker API is running"
}
```

### Auth

| Method | Path              | Auth         | Description                                |
| ------ | ----------------- | ------------ | ------------------------------------------ |
| POST   | `/api/auth/login` | No           | Login with email and password              |
| GET    | `/api/auth/me`    | Bearer token | Returns the authenticated user id and role |

Login request body:

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

Invalid credentials always return `401` with `"Invalid email or password."` so the API does not reveal whether an email exists.

### Doctors

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

Deleting a doctor does not delete that doctor's patients.

### Patients

All patient endpoints require `Authorization: Bearer <token>`.

A patient belongs to a doctor through `doctorId`. List and detail responses populate the doctor's `name`, `specialization`, and `hospital`.

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

`GET /api/doctors/:doctorId/patients` supports the same search, filter, sort, and pagination parameters (except `doctorId`, which comes from the path).

### Dashboard

All dashboard endpoints require `Authorization: Bearer <token>`.

| Method | Path                     | Description                                    |
| ------ | ------------------------ | ---------------------------------------------- |
| GET    | `/api/dashboard/summary` | KPI counts and chart aggregations from MongoDB |

Response:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalDoctors": 25,
      "totalPatients": 156,
      "patientsThisMonth": 18,
      "averagePatientsPerDoctor": 6.24
    },
    "patientsPerDoctor": [],
    "patientsByCondition": [],
    "patientsOverTime": [],
    "doctorsOverTime": []
  }
}
```

## Frontend Notes

- **Login:** `/login` submits email and password to `POST /api/auth/login`. On success the JWT and user info are stored and the admin is sent to `/dashboard`.
- **JWT storage:** `localStorage` key `doctor-tracker-token`. User info is stored alongside it. Both are removed on logout.
- **Protected routes:** `/dashboard`, `/doctors`, and `/patients` redirect to `/login` if no token is present. Visiting `/login` while authenticated redirects to `/dashboard`. APIs still require a Bearer token.
- **Layout:** Sidebar + header. Desktop uses a fixed sidebar; smaller screens use a drawer.
- **Doctors and patients:** Search, filters, sorting, and pagination are query parameters sent to the API. Desktop uses tables; mobile uses cards.
- **Doctor patients:** `/doctors/[id]/patients` lists patients for one doctor. Add Patient on that page assigns the current doctor.
- **Dashboard:** Live KPIs and charts from `GET /api/dashboard/summary`. Failures show “Unable to load dashboard data.” A `401` clears auth and redirects to `/login`.
