# 🏢 VerifyCo: Enterprise Company Registration & Verification Platform

VerifyCo is a production-ready, full-stack MERN (MongoDB, Express, React, Node.js) application designed for B2B environments. It provides a secure, visually stunning portal for companies to register their business credentials, securely authenticate, and undergo automated third-party verification.

Unlike a standard demo project, VerifyCo is engineered with **Enterprise SaaS aesthetics** (glassmorphism, micro-animations, Inter typography) and **robust backend architecture** (custom regex validation, abstracted services, JWT protection).

---

## 🏛️ System Architecture Detailed Breakdown

This project utilizes a **Monorepo** structure, cleanly separating the client interface from the server logic while keeping them in one repository for easy deployment.

### 1. The Backend (Node.js & Express REST API)
The backend rigidly adheres to the **MVC (Model-View-Controller)** design pattern to ensure scalability and maintainability:

*   **Models (`/models`)**: Defines the data layer. The `Company.js` Mongoose schema strictly enforces data integrity. It uses custom Regex to validate Indian PAN formats, enforces unique constraints (email, PAN, Reg No.), and uses a `pre('save')` hook to automatically salt and hash passwords via `bcryptjs` before they ever touch the database.
*   **Controllers (`/controllers`)**: The brain of the API. `authController.js` handles parsing incoming requests, invoking the database models, minting JWTs, and returning standardized HTTP responses (201 Created, 400 Bad Request, etc.).
*   **Routes (`/routes`)**: Extremely lean router files that simply map HTTP methods (GET, POST) to their respective Controller functions.
*   **Middleware (`/middleware`)**: The `authMiddleware.js` intercepts requests to protected routes. It extracts the Bearer token from the `Authorization` header, verifies the cryptographic signature against the `JWT_SECRET`, and attaches the authenticated user object to the request lifecycle.
*   **Services (`/services`)**: Business logic that relies on external systems (like third-party APIs) is abstracted into service files. This prevents the controllers from becoming bloated and makes swapping API providers trivial.

### 2. The Frontend (React + Vite SPA)
The frontend is a lightning-fast Single Page Application built with React and Vite.

*   **Component-Driven UI (`/components/ui`)**: Built using Shadcn-inspired modular components. We rely on Vanilla CSS and Tailwind CSS (`index.css`) to define global CSS variables, injecting custom radial gradients and frosted-glass (`backdrop-blur`) effects globally.
*   **State & Auth (`localStorage`)**: JWTs are persisted in the browser's `localStorage`. The React Router setup acts as a gatekeeper; if a token is missing, users are forcefully redirected away from the `/dashboard`.
*   **API Layer (`/api/axios.js`)**: A centralized Axios instance is configured to automatically attach the stored JWT to the `Authorization` header of every outbound request, eliminating repetitive code.

---

## 💻 Local Setup & Installation

To run this application on your local machine, you will need two separate terminal windows—one for the backend, and one for the frontend.

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB (Either a local installation like MongoDB Compass, or a cloud MongoDB Atlas URI)
*   Git

### 1. Clone the Repository
```bash
git clone https://github.com/rachit1234567547/Company-Registration-Verification-App.git
cd Company-Registration-Verification-App
```

### 2. Initialize the Backend
Open your first terminal window and navigate to the backend folder:
```bash
cd backend
npm install
```
Next, create a `.env` file inside the `backend` folder (see the Environment Variables section below). Once the `.env` is created, start the server:
```bash
npm run dev
```
*Expected Output:* `Server running on port 5001` and `MongoDB Connected`.

### 3. Initialize the Frontend
Open a **second** terminal window and navigate to the frontend folder:
```bash
cd frontend
npm install
```
Start the React development server:
```bash
npm run dev
```
*Expected Output:* The terminal will provide a local link, usually `http://localhost:5173`. Open this in your browser to view the app!

---

## 🔐 Environment Variables

The backend relies on secure environment variables to function. Create a file named exactly `.env` inside the `/backend` folder and add the following keys:

```env
# The port your Node.js server will run on locally
PORT=5001

# The connection string to your MongoDB Database. 
# For local dev: mongodb://localhost:27017/company_verification
# For production: mongodb+srv://<username>:<password>@cluster0...
MONGO_URI=mongodb://localhost:27017/company_verification

# The cryptographic key used to sign and verify JSON Web Tokens.
# Make this a long, random string in production.
JWT_SECRET=super_secret_jwt_key_development

# API Key for the future third-party verification provider
THIRD_PARTY_API_KEY=dummy_api_key_for_future_integration
```

---

## 🔌 API Endpoints Documentation

The backend exposes a RESTful API. All responses are returned in `application/json` format.

### 1. Authentication Endpoints (Public)

**Register a Company**
*   **URL:** `POST /api/auth/register`
*   **Payload:** `{ "name", "registrationNumber", "pan", "email", "phoneNumber", "address", "password" }`
*   **Success Response (201):** Returns a JWT token and the sanitized user object.

**Login**
*   **URL:** `POST /api/auth/login`
*   **Payload:** `{ "email", "password" }`
*   **Success Response (200):** Returns a JWT token and the sanitized user object.

### 2. Company Endpoints (Protected 🛡️)
*Requires Header: `Authorization: Bearer <your_jwt_token>`*

**Get Company Profile**
*   **URL:** `GET /api/company/profile`
*   **Description:** Uses the JWT payload to look up the user in the database and return their profile data (excluding the password).

**Trigger Verification**
*   **URL:** `POST /api/company/verify`
*   **Description:** Tells the backend to invoke the third-party verification service.
*   **Success Response (200):** Updates the database status to `Verified` or `Rejected` and returns the result payload.

---

## 🔄 Third-Party API Integration (Verification Service)

A core requirement of this application is verifying company credentials against a third-party API (e.g., a government database or corporate registry).

Because real verification APIs charge money per request, this application currently implements an **Intelligent Mock Service** located in `backend/services/verificationService.js`.

### How the Mock Service Works
When the frontend requests a verification, the mock service intercepts the request and simulates a real-world network environment:
1.  **Network Latency**: It artificially delays the response by 1 to 3 seconds to simulate a real HTTP request.
2.  **Success Logic**: If the PAN and Registration Number are properly formatted, it returns a `Verified` status along with a fake JSON payload of "official" company data.
3.  **Failure Logic**: If you register a company with a Registration Number starting with `INV`, the service will reject it, simulating a "Not Found in Government Database" scenario.
4.  **Edge Cases**: If you use `TIMEOUT123` or `FAIL123`, the service mimics catastrophic third-party API failures (HTTP 503 and 500) so you can test the frontend's error handling.

### How to Upgrade to a Real API
Because the logic is abstracted into a Service file, upgrading to a real API is trivial. You do not need to touch the Controllers or Routes. 
Simply open `verificationService.js` and replace the `setTimeout` block with an Axios call:

```javascript
// Example of replacing the mock with a real provider (e.g., Stripe Identity or MCA API)
const response = await axios.post('https://api.real-provider.com/verify', {
    pan: company.pan,
    regNumber: company.registrationNumber
}, {
    headers: { 'Authorization': `Bearer ${process.env.THIRD_PARTY_API_KEY}` }
});
```

---

## 🚀 Production Deployment Guide

Deploying this Monorepo requires three distinct steps: hosting the database, the backend, and the frontend.

### Step 1: Database Deployment (MongoDB Atlas)
1. Sign up for a free tier account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new "M0 Free" cluster.
3. Under Network Access, whitelist all IPs (`0.0.0.0/0`) so your backend can reach it from the cloud.
4. Under Database Access, create a user and copy the auto-generated password.
5. Click "Connect" -> "Drivers" to get your Connection String.

### Step 2: Backend Deployment (Render.com)
1. Push your entire codebase to a public or private GitHub repository.
2. Log into [Render.com](https://render.com) and click **New Web Service**.
3. Connect your GitHub repository.
4. **CRITICAL SETTINGS:**
   *   **Root Directory:** `backend` *(This tells Render to ignore the frontend folder)*
   *   **Build Command:** `npm install`
   *   **Start Command:** `npm start`
5. Under Environment Variables, add your `MONGO_URI` (from Atlas), `JWT_SECRET`, and `PORT` (Render defaults to 10000).
6. Click Deploy. Once finished, Render will give you a live URL (e.g., `https://verifyco-backend.onrender.com`).

### Step 3: Frontend Deployment (Vercel.com)
1. Log into [Vercel](https://vercel.com) and click **Add New Project**.
2. Connect your GitHub repository.
3. **CRITICAL SETTINGS:**
   *   **Root Directory:** `frontend` *(This tells Vercel to ignore the backend folder)*
   *   **Framework Preset:** `Vite`
4. Under Environment Variables, you must add `VITE_API_URL` and set its value to your live Render backend URL, appending `/api` at the end (e.g., `https://verifyco-backend.onrender.com/api`).
5. Click Deploy. Vercel will build your React app and provide you with a live, shareable URL!
