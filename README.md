# BookMe

BookMe is a full-stack appointment booking platform for service businesses. It includes a Node.js + Express API for auth, services, bookings, payments, and integrations, and a React + Vite frontend for business owners and customers to manage availability, accept appointments, and complete bookings.

## Overview

- Business owners can create an account, configure their business profile, and manage services and weekly availability.
- Customers can browse a public business profile, see available slots, verify their email with OTP, and book services.
- Bookings support Stripe payments for paid services and calendar integrations with Google Calendar.
- Admins can review platform stats, log in separately, and approve or reject withdrawal requests.

## Tech stack

- Backend: Node.js, Express, Mongoose, JWT, Stripe, Google APIs
- Frontend: React, Vite, JavaScript
- Database: MongoDB

## Project structure

```text
backend/
  server.js                 Express server entry point
  routes/                   API route definitions
  controllers/              Business logic handlers
  models/                   Mongoose schemas
  middleware/               Auth and request middleware
  config/                   DB / env configuration helpers
  utils/                    Payment, OTP, slot, calendar helpers
frontend/
  src/                      React application source
  public/                   Static assets
  package.json              Frontend scripts and dependencies
```

## Local setup

### 1) Clone the project

```bash
git clone https://github.com/jobigutenburg02/BookMe.git
cd BookMe
```

### 2) Install backend dependencies

```bash
cd backend
npm install
```

### 3) Configure environment variables

Create a `.env` file inside `backend/` with the values required by the app:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bookme
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173

# Optional but required for paid bookings / wallet flows
STRIPE_SECRET_KEY=your_stripe_secret_key

# Optional but required for Google Calendar integration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/integrations/google/callback

# Optional admin login configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

The app also supports `ADMIN_PASSWORD_HASH` if you prefer a bcrypt hash instead of a plain-text admin password.

### 4) Start the backend

```bash
cd backend
npm start
```

The API will run on `http://localhost:5000`.

### 5) Install frontend dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

### 6) Start the frontend

```bash
cd frontend
npm run dev
```

The React app will typically run on `http://localhost:5173`.

### 7) Open the app

Visit:

```text
http://localhost:5173
```

## Frontend: API base URL configuration

The frontend HTTP client uses `frontend/src/api/client.js` to configure the API base URL. This file defines the request base URL used by all frontend API calls.

Key lines (from `frontend/src/api/client.js`):

```javascript
import axios from 'axios'

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
})
```

This means:
- If `VITE_API_URL` is set, that value is used.
- Otherwise, the frontend falls back to `http://localhost:5000/api`.

### Local development configuration

Create a `.env` file inside the `frontend/` directory:

```env
# frontend/.env
VITE_API_URL=http://localhost:5000/api
```

Then restart the Vite dev server after creating or updating the file:

```bash
cd frontend
npm run dev
```

### Production configuration

For production deployment, set `VITE_API_URL` to the deployed backend URL in your hosting provider or CI environment.

Example:

```bash
# Unix/macOS
VITE_API_URL=https://api.mybookme.com/api npm run build

# Windows PowerShell
$env:VITE_API_URL='https://api.mybookme.com/api'; npm run build
```

In other words, the frontend is not hard-coded to a single host; it reads the backend URL from the environment at build time.

## Example production deployment flows

### 1) Separate frontend + backend hosting (recommended)

- Frontend
  - Run: `cd frontend && npm run build`
  - Deploy the generated `frontend/dist` folder to a static host (Netlify, Vercel, CloudFront, etc.)
  - Set `VITE_API_URL` on that host to your backend API URL, for example:
    ```env
    VITE_API_URL=https://api.mybookme.com/api
    ```

- Backend
  - Deploy the Node/Express app to a server or PaaS (Render, Railway, Heroku, DigitalOcean, AWS EC2, etc.)
  - Set backend env vars like:
    ```env
    MONGO_URI=mongodb://...
    JWT_SECRET=...
    STRIPE_SECRET_KEY=...
    CLIENT_URL=https://your-frontend-url.com
    ```
  - Ensure CORS is enabled and allows the frontend origin.

### 2) Single-server deployment

- Build the frontend: `cd frontend && npm run build`
- Copy the generated `frontend/dist` files into a folder served by the backend, or configure your web server to serve static files from there.
- Example backend pattern:

```javascript
app.use(express.static(path.join(process.cwd(), 'frontend/dist')))
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'frontend/dist', 'index.html'))
})
```

- Run the backend with production environment variables.

### 3) Docker-based deployment

Example frontend Dockerfile:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build command:

```bash
docker build --build-arg VITE_API_URL=https://api.mybookme.com/api -t bookme-frontend .
```

Notes:
- `VITE_API_URL` is read at build time, so it must be set before the production bundle is generated.
- Do not expose JWT secrets or Stripe keys to the frontend; keep them server-side.
- Make sure `CLIENT_URL` in the backend matches the production frontend URL so Google OAuth and redirect flows work correctly.

## API reference

Base URL for the backend API:

```text
http://localhost:5000
```

### Root

| Method | Route | Auth | Request body | Response |
|---|---|---|---|---|
| GET | `/` | No | None | `API WORKING` |

### Auth routes

Mounted at `/api/auth`.

| Method | Route | Auth | Request body | Response |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | `{ name, email, password, businessName?, businessDescription?, timezone?, emailOtp }` | `201` with `{ message, token, user }` |
| POST | `/api/auth/register/request-otp` | No | `{ email }` | `{ message: 'Verification code sent', result }` |
| POST | `/api/auth/register/verify-otp` | No | `{ email, emailOtp }` | `{ message: 'OTP Verified' }` |
| POST | `/api/auth/login` | No | `{ email, password }` | `{ message, token, user }` |
| GET | `/api/auth/me` | Yes (JWT) | None | `{ user }` |
| PUT | `/api/auth/profile` | Yes (JWT) | `{ businessName?, businessDescription?, timezone?, brandTheme?, brandAccent? }` | `{ message, user }` |

Notes:
- Registration requires a valid email OTP.
- Login returns a JWT token used for protected routes.

### Service routes

Mounted at `/api/services`.

| Method | Route | Auth | Request body | Response |
|---|---|---|---|---|
| GET | `/api/services` | Yes | None | `{ services: [...] }` |
| POST | `/api/services` | Yes | `{ name, duration, price?, description?, icon? }` | `201` with `{ message: 'Service created', service }` |
| PATCH | `/api/services/:id` | Yes | `{ name?, duration?, price?, description?, isActive?, icon? }` | `{ message: 'Service updated', service }` |
| DELETE | `/api/services/:id` | Yes | None | `{ message: 'Service deleted', service }` |

Notes:
- `listServices` returns all active, non-deleted services for the logged-in business owner.
- `duration` is expected to be a service duration value used by the booking flow.

### Availability routes

Mounted at `/api/availability`.

| Method | Route | Auth | Request body | Response |
|---|---|---|---|---|
| GET | `/api/availability` | Yes | None | `{ availability: [...] }` |
| PUT | `/api/availability` | Yes | `{ dayOfWeek, slots: [{ startTime, endTime }] }` | `{ message: 'Availabiliy saved', availability }` |

Notes:
- `dayOfWeek` is an integer from `0` (Sunday) to `6` (Saturday).
- Each slot is a time range used to generate available booking times.

### Booking routes

Mounted at `/api/bookings`.

| Method | Route | Auth | Request body | Response |
|---|---|---|---|---|
| GET | `/api/bookings` | Yes | Optional query: `status`, `date` | `{ bookings: [...] }` |
| PATCH | `/api/bookings/:id` | Yes | `{ status }` (allowed: `pending`, `pending_payment`, `confirmed`, `cancelled`, `payment_failed`) | `{ message, booking, email }` |
| PATCH | `/api/bookings/:id/reschedule` | Yes | `{ date, startTime, endTime }` | `{ message: 'Booking rescheduled', booking, email }` |

Notes:
- `GET /api/bookings` can filter by query string such as `?status=confirmed` or `?date=2026-10-13`.
- Reschedule checks for slot conflicts before updating the booking.

### Payment routes

Mounted at `/api/payments`.

| Method | Route | Auth | Request body | Response |
|---|---|---|---|---|
| GET | `/api/payments` | Yes | None | `{ payoutDetails, wallet, transactions, withdrawals }` |
| PUT | `/api/payments/payout-details` | Yes | `{ accountHolderName, bankName?, accountNumber?, ifsc?, upiId? }` | `{ message: 'Payout details saved', payoutDetails }` |
| POST | `/api/payments/withdrawals` | Yes | `{ amount }` | `201` with `{ message: 'Withdrawal requested', withdrawal }` |

Notes:
- Payout details can be either bank account details or a UPI ID.
- Withdrawal requests are validated against available wallet balance and minimum amount rules.

### Integration routes

Mounted at `/api/integrations`.

| Method | Route | Auth | Request body | Response |
|---|---|---|---|---|
| GET | `/api/integrations/google/connect` | Yes | None | `{ url }` |
| GET | `/api/integrations/google/callback` | Yes | Query params: `code`, `state` | Redirect to frontend `/profile?calendar=connected` or failure variant |

Notes:
- This route starts the Google Calendar OAuth flow and redirects back to the app after authorization.
- If Google credentials are not configured, the API responds with a `403` error.

### Admin routes

Mounted at `/api/admin`.

| Method | Route | Auth | Request body | Response |
|---|---|---|---|---|
| POST | `/api/admin/login` | No | `{ email, password }` | `{ message, token, admin }` |
| GET | `/api/admin/dashboard` | Yes (admin auth) | None | `{ summary, users, withdrawals, recentBookings }` |
| PATCH | `/api/admin/withdrawals/:id` | Yes (admin auth) | `{ status, adminNote? }` | `{ message, withdrawal, summary }` |

Notes:
- `status` can be one of `pending`, `processing`, `paid`, or `rejected`.
- Admin-only endpoints are protected by a dedicated admin middleware.

### Public booking routes

Mounted at `/public`.

| Method | Route | Auth | Request body | Response |
|---|---|---|---|---|
| GET | `/public/booking/status` | No | Query: `session_id` or `booking_id` | `{ booking }` |
| POST | `/public/booking/cancel-payment` | No | `{ booking_id }` | `{ message }` |
| GET | `/public/:slug` | No | None | `{ business, services }` |
| GET | `/public/:slug/slots` | No | Query: `date`, `serviceId` | `{ slots }` |
| POST | `/public/:slug/request-otp` | No | `{ customerEmail }` | `{ message: 'Verification code sent', result }` |
| POST | `/public/:slug/verify-otp` | No | `{ customerEmail, emailOtp }` | `{ message: 'OTP verified' }` |
| POST | `/public/:slug/book` | No | `{ serviceId, customerName, customerEmail, customerAvatar?, date, startTime, endTime, notes?, emailOtp }` | `201` with either `{ message: 'Booking confirmed', booking, ... }` or `{ message: 'Continue to payment', bookingId, checkoutUrl }` |

Notes:
- These are public customer-facing endpoints that allow a customer to book without logging into the app.
- For paid bookings, the response may include a Stripe checkout URL that redirects the customer to payment.

## Example request flow

A typical appointment flow looks like this:

1. Business owner signs up via `/api/auth/register`.
2. Business owner adds services via `/api/services` and sets availability via `/api/availability`.
3. Customer visits `/public/:slug` and requests available slots.
4. Customer verifies their email with OTP via `/public/:slug/request-otp` and `/public/:slug/verify-otp`.
5. Customer books a slot via `/public/:slug/book`.
6. If the service is paid, the API returns a Stripe checkout URL and the customer completes payment.
7. Booking status is checked via `/public/booking/status`.

## Notes

- The backend is currently structured as a service-business booking platform rather than a generic scheduling library.
- Most routes are protected by JWT authentication for business-owner actions.
- Public booking endpoints are intended for customer-facing booking pages.

This README is designed to give a quick overview and a practical, local-start guide for running and testing BookMe.
