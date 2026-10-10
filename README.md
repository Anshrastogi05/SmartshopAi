# ShopSmart AI 🛍️

> An AI-powered e-commerce platform built with React + Vite, Node.js + Express, and PostgreSQL.

## ✨ Features

- **Version 1** – Project foundation: Express health check, centralized error handling, CORS, environment config
- **Version 2** – Product catalog with full-text search, filters, sorting, and pagination
- **Version 3** – JWT authentication: secure signup/login with bcrypt password hashing

---

## 🗂️ Project Structure

```
SmartshopAi/
├── frontend/          # React + Vite SPA
│   ├── src/
│   │   ├── components/    # Reusable UI (Navbar, ProductCard)
│   │   ├── context/       # AuthContext (useReducer)
│   │   ├── lib/           # Axios API client
│   │   └── pages/         # Homepage, Catalog, Detail, Login, Signup, Profile
│   └── vite.config.js
│
└── backend/           # Node.js + Express API
    ├── src/
    │   ├── app.js          # Express app setup
    │   ├── server.js       # Entry point with env validation
    │   ├── routes/         # health, catalog, auth
    │   ├── controllers/    # catalogController, authController
    │   ├── middleware/      # auth (JWT), errorHandler, response
    │   └── db/             # pool.js, migrations.sql, seed.js
    └── tests/             # Jest + Supertest test suites
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14 (running locally)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/shopsmart_dev
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
```

### 3. Create Database & Seed Data

First create the PostgreSQL database:
```sql
CREATE DATABASE shopsmart_dev;
```

Then run migrations + seed:
```bash
cd backend
npm run db:migrate
```

### 4. Start Both Servers

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
# Starts on http://localhost:5000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
# Starts on http://localhost:5173
```

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

Tests cover:
- `health.test.js` – Health check endpoint, 404 handling
- `auth.test.js`   – Signup, login (success/fail), protected routes, expired tokens
- `catalog.test.js`– Products listing, search, price filters, validation, 404

---

## 🔌 API Reference

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server + DB status |

### Catalog
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/catalog/categories` | All categories |
| GET | `/api/catalog/products` | Products (with `?q=`, `?category=`, `?minPrice=`, `?maxPrice=`, `?sort=`, `?page=`, `?limit=`) |
| GET | `/api/catalog/products/:idOrSlug` | Single product |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/auth/me` | Current user (🔒 Bearer token) |
| POST | `/api/auth/logout` | Logout (🔒 Bearer token) |

---

## 🔐 Security

- Passwords hashed with **bcrypt** (12 rounds) — never stored in plaintext
- JWT tokens with configurable expiry (`JWT_EXPIRES_IN`)
- Generic `"Invalid email or password"` message on failed login (prevents user enumeration)
- Parameterized SQL queries — no SQL injection risk
- Helmet.js security headers
- CORS restricted to configured origin
- Secrets in environment variables only — never in source code

---

## 🛠️ Environment Variables

See [`backend/.env.example`](./backend/.env.example) for the full reference.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Token signing secret (min 32 chars) |
| `PORT` | No | API server port (default: 5000) |
| `NODE_ENV` | No | `development` / `production` / `test` |
| `CORS_ORIGIN` | No | Frontend URL (default: `http://localhost:5173`) |
| `JWT_EXPIRES_IN` | No | Token lifetime (default: `7d`) |
