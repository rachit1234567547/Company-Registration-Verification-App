# VerifyCo — Company Registration and Verification Platform

A production-ready, full-stack MERN application for secure company registration, JWT authentication, and automated third-party business verification.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Data Flow](#data-flow)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Verification States](#verification-states)
8. [Local Setup](#local-setup)
9. [Environment Variables](#environment-variables)
10. [Third-Party Integration](#third-party-integration)
11. [Deployment](#deployment)

---

## Project Overview

VerifyCo is a B2B platform that lets companies register their credentials, log in securely, and verify their business identity against a third-party government-style API. The results are stored in MongoDB and displayed in real time on a protected dashboard.

The core user journey is:

1. A company fills out the registration form with their name, PAN, registration number, and address.
2. They receive a JWT token on successful login.
3. From the dashboard, they trigger a verification request.
4. The backend calls the verification service and updates the database with the result.
5. The dashboard shows the final verification status and the raw API response.

---

## Architecture

This project uses a Monorepo structure. Both the frontend and backend live in the same repository but run as completely independent applications.

```
Company-Registration-Verification-App/
|
|-- backend/                        (Express REST API — deployed on Render)
|   |-- config/
|   |   `-- db.js                   MongoDB Atlas connection
|   |-- controllers/
|   |   |-- authController.js       Register and login business logic
|   |   `-- companyController.js    Profile fetch and verification logic
|   |-- middleware/
|   |   `-- authMiddleware.js       JWT verification for protected routes
|   |-- models/
|   |   `-- Company.js              Mongoose schema, validation, password hashing
|   |-- routes/
|   |   |-- authRoutes.js           /api/auth endpoints
|   |   `-- companyRoutes.js        /api/company endpoints (protected)
|   |-- services/
|   |   `-- verificationService.js  Third-party API abstraction layer
|   |-- .env.example                Template for environment variables
|   `-- index.js                    Server entry point
|
|-- frontend/                       (React + Vite SPA — deployed on Vercel)
|   `-- src/
|       |-- api/
|       |   `-- axios.js            Axios instance with JWT interceptors
|       |-- components/ui/          Button, Input, Card, Label components
|       |-- pages/
|       |   |-- Login.jsx           Login page
|       |   |-- Register.jsx        Registration form
|       |   `-- Dashboard.jsx       Protected company dashboard
|       |-- App.jsx                 Route definitions and protected route logic
|       `-- main.jsx                React entry point
|
|-- postman_collection.json         Ready-to-import API test collection
`-- README.md
```

The backend follows the **MVC (Model-View-Controller)** pattern:
- **Model** — `Company.js` defines the data structure and database rules
- **View** — handled entirely by the React frontend
- **Controller** — `authController.js` and `companyController.js` contain all business logic

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | UI framework and build tool |
| Styling | Tailwind CSS + Custom CSS | Glassmorphism design system |
| HTTP Client | Axios | API requests with interceptors |
| Routing | React Router v6 | SPA navigation and protected routes |
| Backend | Node.js + Express.js | REST API server |
| Database | MongoDB + Mongoose | Document storage and schema validation |
| Auth | JWT + bcryptjs | Stateless authentication and password hashing |
| DB Host | MongoDB Atlas | Cloud-hosted database |
| Backend Host | Render.com | Backend deployment |
| Frontend Host | Vercel | Frontend deployment |

---

## Data Flow

### Login Flow

```
  React (Vercel)              Express (Render)             MongoDB Atlas
       |                            |                             |
       |  POST /api/auth/login      |                             |
       |  { email, password }       |                             |
       |--------------------------->|                             |
       |                            |  Company.findOne({email})   |
       |                            |---------------------------->|
       |                            |                             |
       |                            |  Returns user document      |
       |                            |<----------------------------|
       |                            |                             |
       |                            |  bcrypt.compare(password)   |
       |                            |  Match confirmed            |
       |                            |  jwt.sign({ userId })       |
       |                            |                             |
       |  200 OK { name, token }    |                             |
       |<---------------------------|                             |
       |                            |                             |
       |  Token saved to            |                             |
       |  localStorage              |                             |
       |  Redirect to /dashboard    |                             |
       |                            |                             |
```

### Protected Route Flow

```
  React              Axios Interceptor        authMiddleware          MongoDB
    |                      |                       |                    |
    |  Request /profile    |                       |                    |
    |--------------------->|                       |                    |
    |                      |                       |                    |
    |                      |  Reads token from     |                    |
    |                      |  localStorage,        |                    |
    |                      |  adds to header:      |                    |
    |                      |  Authorization:       |                    |
    |                      |  Bearer eyJhb...      |                    |
    |                      |---------------------->|                    |
    |                      |                       |                    |
    |                      |                       |  jwt.verify(token) |
    |                      |                       |  Valid             |
    |                      |                       |                    |
    |                      |                       |  findById(id)      |
    |                      |                       |------------------->|
    |                      |                       |                    |
    |                      |                       |  User data         |
    |                      |                       |<-------------------|
    |                      |                       |                    |
    |  Company profile     |<----------------------|                    |
    |<---------------------|                       |                    |
    |                      |                       |                    |
    |  Renders dashboard   |                       |                    |
    |                      |                       |                    |
```

---

## Database Schema

```
companies (Collection)
---------------------------------------------------------
Field                | Type          | Rules
---------------------------------------------------------
_id                  | ObjectId      | Auto-generated
name                 | String        | Required
registrationNumber   | String        | Required, Unique
pan                  | String        | Unique, Regex validated
email                | String        | Unique
phoneNumber          | String        | Required
address              | String        | Required
password             | String        | Bcrypt hashed pre-save
verificationStatus   | String (enum) | Pending / Verified / Rejected
verificationResult   | Object        | Raw API response payload
verificationDate     | Date          | Timestamp of verification
createdAt            | Date          | Auto-managed by Mongoose
updatedAt            | Date          | Auto-managed by Mongoose
---------------------------------------------------------
```

The `pan` field is validated against the Indian PAN format using a Regex pattern that enforces exactly 5 uppercase letters, 4 digits, and 1 uppercase letter (e.g., `ABCDE1234F`).

---

## API Endpoints

### Auth Routes — `/api/auth` (public)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/register` | `{ name, email, password, registrationNumber, pan, phoneNumber, address }` | `{ _id, name, email, token }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ _id, name, email, token }` |

### Company Routes — `/api/company` (requires JWT token)

| Method | Endpoint | Headers | Response |
|--------|----------|---------|----------|
| GET | `/api/company/profile` | `Authorization: Bearer <token>` | Full company profile object |
| POST | `/api/company/verify` | `Authorization: Bearer <token>` | Verification result and updated status |

To use protected endpoints, copy the `token` from the login response and set the request header as:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Verification States

The verification system produces one of four outcomes depending on the company's registration number.

```
  [ PENDING ]  <-- Default state after registration
       |
       | User clicks "Verify Company"
       |
  [ verificationService.js runs ]
       |
       |
  -----+---------------------------+-----------------+
  |                                |                 |
  v                                v                 v
[ VERIFIED ]               [ REJECTED ]        [ ERROR ]
  Success                    PAN or RegNo       API Timeout
  JSON payload returned      starts with INV    or crash
```

To test each state, use these registration numbers when creating a test account:

| State | Registration Number | What happens |
|-------|--------------------|----|
| Verified | Any normal value, e.g. `REG12345` | Returns a verified JSON payload |
| Rejected | Starts with `INV`, e.g. `INV99999` | Company not found in records |
| Timeout Error | Exactly `TIMEOUT123` | Simulates third-party API timing out |
| Server Error | Exactly `FAIL123` | Simulates third-party API returning 500 |

---

## Local Setup

### Prerequisites
- Node.js v18 or higher
- Git

### 1. Clone the repository

```bash
git clone https://github.com/rachit1234567547/Company-Registration-Verification-App.git
cd Company-Registration-Verification-App
```

### 2. Start the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder (see Environment Variables below), then run:

```bash
npm run dev
```

Expected output:
```
Server running on port 5001
MongoDB Connected: ac-xxxxx.mongodb.net
```

### 3. Start the frontend

Open a second terminal window:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables

Create a file named `.env` inside the `backend/` directory. Never commit this file to GitHub — it is already listed in `.gitignore`. An `.env.example` file is included in the repository as a reference template.

```env
# Port the server runs on
PORT=5001

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/company_verification

# Secret key used to sign and verify JWT tokens
JWT_SECRET=replace_this_with_a_long_random_string

# Placeholder for future third-party verification API key
THIRD_PARTY_API_KEY=your_api_key_here
```

---

## Third-Party Integration

The verification logic is isolated in `backend/services/verificationService.js`. This is intentional — by keeping it in a service file, swapping from a mock to a real API only requires changing that one file. The controllers, routes, and frontend remain untouched.

### Current implementation: Mock service

The mock service simulates what a real government verification API would do:

```
Request
  |
  +--> Random delay (1-3 seconds) to simulate network latency
  |
  +--> Check for edge-case trigger codes (TIMEOUT123, FAIL123, INV...)
  |
  +--> Return verified JSON payload OR reject with an error
```

### Switching to a real API

Replace the `setTimeout` block inside `verificationService.js` with an actual HTTP call:

```javascript
const response = await axios.post('https://api.provider.com/v1/verify', {
    pan: company.pan,
    registrationNumber: company.registrationNumber
}, {
    headers: {
        'Authorization': `Bearer ${process.env.THIRD_PARTY_API_KEY}`
    },
    timeout: 10000
});

return { success: true, details: response.data };
```

---

## Deployment

### Production setup

```
  Vercel                            Render                    MongoDB Atlas
  (React/Vite SPA)  ------------>  (Node/Express API) ----->  (Cloud Database)
  frontend/             HTTPS      backend/             Mongoose
```

### Step 1 — Database (MongoDB Atlas)

1. Sign up at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Under Network Access, add IP address `0.0.0.0/0` to allow connections from Render
4. Under Database Access, create a database user with a secure password
5. Click Connect → Drivers and copy the connection string

### Step 2 — Backend (Render.com)

1. Go to [render.com](https://render.com) and create a new Web Service
2. Connect your GitHub repository
3. Use these settings:

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

4. Add the environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT`, `THIRD_PARTY_API_KEY`
5. Deploy and copy the live URL (e.g. `https://verifyco-api.onrender.com`)

### Step 3 — Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and create a new project
2. Connect the same GitHub repository
3. Use these settings:

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Framework Preset | Vite (auto-detected) |
| Build Command | `npm run build` |
| Output Directory | `dist` |

4. Add this environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-render-url.onrender.com/api` |

5. Deploy and share the generated URL

---

*Built as a full-stack SaaS assessment project using the MERN stack.*
