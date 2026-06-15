# DineFlow

Discover restaurants, reserve tables, order food, and run your entire restaurant business—all in one place.

## Architecture

- **Frontend**: Next.js 14 (App Router) + React + Zustand + Tailwind CSS
- **Backend**: Express.js + MongoDB (Mongoose) + JWT Auth
- **State**: Zustand with auto-detection of backend availability (demo/live mode)

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm install
npm start        # Starts on port 5000
```

The backend auto-seeds sample data on first run (2 restaurants, tables, menu items, staff, reservations, orders).

#### Pre-seeded Accounts

| Role     | Email              | Password      |
|----------|--------------------|---------------|
| Customer | sarah@dineflow.com | password123   |
| Staff    | staff@garden.com   | password123   |
| Owner    | owner@garden.com   | password123   |

### Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL if backend runs on non-default port
npm install
npm run dev       # Starts on port 3000
```

### Demo vs Live Mode

The frontend automatically detects whether the backend is running:
- **Live mode**: Uses real API calls with MongoDB persistence
- **Demo mode**: Falls back to localStorage mock data (works offline)

Switch roles during login to access different portals:
- `/customer` — Browse restaurants, book tables, order food
- `/staff` — Manage orders, floor plan, table status
- `/owner` — Dashboard analytics, staff/menu/finance management

## API Endpoints

| Method | Endpoint              | Auth     | Description                  |
|--------|-----------------------|----------|------------------------------|
| GET    | /api/health           | Public   | Backend health check         |
| POST   | /api/auth/register    | Public   | Register (role-aware)        |
| POST   | /api/auth/login       | Public   | Login                        |
| GET    | /api/auth/me          | JWT      | Current user profile         |
| PATCH  | /api/auth/profile     | JWT      | Update profile               |
| POST   | /api/auth/wallet/topup| JWT      | Top up wallet                |
| GET    | /api/restaurants      | Public   | List restaurants             |
| GET    | /api/restaurants/:id  | Public   | Restaurant detail            |
| GET    | /api/restaurants/:id/menu | Public | Restaurant menu            |
| POST   | /api/restaurants/:id/menu | Owner | Add menu item              |
| PATCH  | /api/restaurants/:id  | Owner    | Update restaurant            |
| GET    | /api/tables           | JWT      | List tables (scoped)         |
| POST   | /api/tables           | Owner    | Add table                    |
| PATCH  | /api/tables/:id/status| JWT      | Update table status          |
| PUT    | /api/tables/:id       | JWT      | Update table                 |
| DELETE | /api/tables/:id       | Owner    | Delete table                 |
| GET    | /api/reservations     | JWT      | List reservations            |
| POST   | /api/reservations     | JWT      | Create reservation           |
| PATCH  | /api/reservations/:id | JWT      | Update reservation           |
| DELETE | /api/reservations/:id | JWT      | Delete reservation           |
| GET    | /api/orders           | JWT      | List orders                  |
| POST   | /api/orders           | JWT      | Create order                 |
| PUT    | /api/orders/:id/status| JWT      | Update order status          |
| GET    | /api/analytics/summary| JWT      | Analytics summary            |
| GET    | /api/analytics/sales-chart | JWT | Sales chart data           |
| GET    | /api/analytics/reservations-chart | JWT | Reservations chart data |
| GET    | /api/staff            | Owner    | List staff                   |
| POST   | /api/staff            | Owner    | Add staff                    |
| DELETE | /api/staff/:id        | Owner    | Remove staff                 |

## Tech Stack

- **Frontend**: Next.js, React, Zustand, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Express, Mongoose, JWT, bcryptjs
- **Auth**: JWT tokens stored in localStorage with role-based routing middleware
