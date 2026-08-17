# Company Registration & Verification App

A complete, professional MERN stack application for company registration, authentication, and third-party verification.

## Project Overview

This application allows businesses to register by providing their details (Name, Registration Number, PAN, Address, etc.). Once registered and authenticated via JWT, users access a protected dashboard where they can trigger a third-party API verification process to validate their company credentials.

### Features
- **Frontend**: React (Vite), Tailwind CSS, Shadcn-style UI components, React Hook Form + Zod validation, React Router, Axios.
- **Backend**: Node.js, Express.js, MongoDB + Mongoose, JWT Authentication, bcryptjs.
- **Security**: Protected routes, hashed passwords, secure API endpoints.
- **Mock Verification Service**: Simulates a third-party government verification API with latency, timeouts, and success/failure logic based on PAN and Registration numbers.

---

## Architecture

The project is structured as a Monorepo containing two distinct parts:

1.  **Backend (Node.js/Express REST API)**
    - Uses the MVC (Model-View-Controller) pattern.
    - `models/`: Mongoose schemas (Company).
    - `controllers/`: Handles business logic and HTTP responses.
    - `routes/`: Defines API endpoints.
    - `middleware/`: JWT verification and error handling.
    - `services/`: Encapsulates third-party API logic.

2.  **Frontend (React SPA)**
    - Built with Vite for speed.
    - Follows a component-based architecture.
    - `components/ui/`: Reusable, styled UI elements (Button, Input, Card).
    - `pages/`: Route-level components (Login, Register, Dashboard).
    - `api/`: Axios interceptors for handling auth tokens automatically.

---

## Local Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local instance or MongoDB Atlas URI)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Company-Registration-Verification-App
```

### 2. Backend Setup
```bash
cd backend
npm install
```
- Create a `.env` file in the `backend` directory (see Environment Variables below).
- Start the development server:
```bash
npm run dev
```
*(Runs on `http://localhost:5000`)*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
- Start the development server:
```bash
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/company_verification # Or your MongoDB Atlas URI
JWT_SECRET=your_super_secret_jwt_key_here
```

*(Note: Never commit your `.env` file. An `.env.example` is provided in the repository.)*

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new company.
- `POST /api/auth/login` - Authenticate company and receive JWT.

### Company (Protected Routes - Requires Bearer Token)
- `GET /api/company/profile` - Get the authenticated company's details.
- `POST /api/company/verify` - Trigger third-party verification.

---

## Third-Party API Integration Details

The application is structured to easily integrate with a real government or third-party verification API provider. 

Currently, it uses a **Mock Service** (`backend/services/verificationService.js`) with the following simulated behaviors:
- **Success**: Any valid PAN and Registration Number will be verified successfully after a 1-3 second simulated network delay.
- **Failure**: If the PAN or Registration Number starts with `INV`, the verification will simulate a "Not Found/Rejected" response from the government database.
- **Timeout**: If the Registration Number is `TIMEOUT123`, it simulates an API timeout error (HTTP 503).
- **Service Unavailable**: If the Registration Number is `FAIL123`, it simulates a 500 API failure.

To integrate a real API:
1. Obtain API Keys from the provider.
2. Add them to `.env`.
3. Update `verifyCompanyAPI` in `services/verificationService.js` to make the actual Axios/fetch call.

---

## Deployment Instructions

### Deploying the Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Get your connection string (URI).
3. Replace the `MONGO_URI` in your backend deployment environment variables.

### Deploying the Backend (Render)
1. Push your code to GitHub.
2. Create a new **Web Service** on [Render.com](https://render.com).
3. Connect your GitHub repository.
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node index.js`
5. Add Environment Variables (`MONGO_URI`, `JWT_SECRET`).

### Deploying the Frontend (Vercel)
1. Create a new project on [Vercel](https://vercel.com).
2. Connect your GitHub repository.
3. Settings:
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://your-render-backend-url.onrender.com/api`

---
*Developed as a full-stack assessment project.*
