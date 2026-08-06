# Retail Inventory Management & Customer Experience System

Capstone project — a system for managing store inventory and giving customers
a smooth shopping experience, built with the MERN stack (MongoDB, Express,
React, Node.js).

## Project status (as of Aug 7)

This repo is being built incrementally. Check this section before starting
work so you know what's actually finished vs. what's a stub.

### ✅ Done — Backend (Day 1)
- Project structure and config
- MongoDB models: `User`, `Product`, `Cart`, `Order`
- Auth: register/login/JWT, role-based access (`customer` / `admin`)
- Product CRUD API (admin-protected write routes, public read routes)
- Cart API (add/update/remove items)
- Order API — **creating an order auto-deducts stock and updates units sold**
- Admin dashboard stats endpoint (total products, low-stock list, top sellers)
- Health check endpoint (`/api/health`)

### ✅ Done — Frontend (Day 2)
- React (Vite) + Tailwind v4 setup
- Auth context + cart context (global state, token persisted in localStorage)
- Customer: product browse page with search + category filter
- Customer: cart page (update quantity, remove item, checkout)
- Customer: order history page
- Admin: dashboard (total products, low-stock alert, top sellers)
- Admin: product management (add/edit/delete via modal form + table)
- Protected routes (login-required and admin-only)
- Verified: `npm run build` succeeds, frontend + backend boot and talk to each other locally

### 🚧 Not started yet
- Deployment (Vercel for frontend, Render/Railway for backend, MongoDB Atlas for DB)
- Seed script with demo data (needed before a real demo — empty product list right now)
- Product detail page (currently browse-only, no dedicated page per product)

### 🔮 Later phase (post Aug 12 — intentionally NOT built yet, don't start these early)
- Recommendation engine
- Loyalty points / rewards
- Product reviews & ratings
- Supplier/restock management workflow
- Sales analytics with charts
- Barcode scanning
- Notifications (email/SMS)

If you're picking this up and want to add a "later phase" feature, that's
great — just make sure the core (above) still works after your changes.

## Folder structure

```
retail-system/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── models/                # Mongoose schemas
│   ├── controllers/           # Route logic
│   ├── routes/                 # Express routers
│   ├── middleware/authMiddleware.js
│   ├── server.js               # App entry point
│   └── .env.example
└── frontend/                  # (coming next)
```

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Then fill in `.env` with:
- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — any long random string

Run it:
```bash
npm run dev     # requires nodemon (npm install -g nodemon), or:
npm start
```

Server runs on `http://localhost:5000` by default. Test it's alive:
```bash
curl http://localhost:5000/api/health
```

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env    # points VITE_API_URL at your backend
npm run dev
```

Runs on `http://localhost:5173` by default. Make sure the backend is running
too (see above) or API calls will fail.

To create an admin account: register normally through the UI, then either
manually set `role: "admin"` on that user in MongoDB Atlas, or register via
API with `{ "role": "admin" }` in the body (see API reference below) — the
signup form itself only creates customer accounts.

## API reference (current)

### Auth — `/api/auth`
| Method | Route | Access | Body |
|---|---|---|---|
| POST | `/register` | Public | `{ name, email, password, role? }` |
| POST | `/login` | Public | `{ email, password }` |
| GET | `/me` | Logged in | — |

### Products — `/api/products`
| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/` | Public | Query params: `?category=`, `?search=` |
| GET | `/:id` | Public | |
| GET | `/dashboard/stats` | Admin | Total/low-stock/top-selling |
| POST | `/` | Admin | Create product |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Delete product |

### Cart — `/api/cart` (all routes require login)
| Method | Route | Body |
|---|---|---|
| GET | `/` | — |
| POST | `/` | `{ productId, quantity }` |
| PUT | `/:productId` | `{ quantity }` (0 removes item) |
| DELETE | `/:productId` | — |

### Orders — `/api/orders` (all routes require login)
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/` | Customer | Creates order from cart, deducts stock |
| GET | `/myorders` | Customer | Own order history |
| GET | `/:id` | Owner or admin | |
| GET | `/` | Admin | All orders |
| PUT | `/:id/status` | Admin | `{ status }` |

## Tech stack
- **Frontend:** React (Vite) + Tailwind CSS + React Router + Axios
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Deployment (planned):** Vercel (frontend), Render/Railway (backend), MongoDB Atlas (DB)

## Contributing (for teammates)
1. Pull latest `main`
2. Create a branch per feature: `git checkout -b feature/reviews`
3. Don't touch core models unless necessary — extend them, don't restructure,
   unless discussed with the team
4. Test your routes with Postman/curl before pushing
