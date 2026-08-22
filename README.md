# Nivera

A full-stack retail inventory management & customer experience platform,
built with the MERN stack (MongoDB, Express, React, Node.js). Built as a
university capstone project.

Customers can browse a real product catalog, leave reviews, and even submit
their own products to sell (subject to admin approval). Admins get a full
back office: order management, customer management, stock control, sales
analytics, and a listings approval queue.

## Features

**Customer-facing**
- Product catalog with search, category filters, and pagination
- Product detail pages with quantity selector and stock status
- Product reviews & star ratings
- Cart (add/update/remove, live stock-aware quantity limits)
- Checkout → order history
- "Sell" page — submit your own product listing for admin review

**Admin**
- Dashboard with live charts: revenue over the last 14 days, revenue by
  category, low-stock alerts, top-selling products
- Product management — add/edit/delete, quick inline stock +/- adjustment
- Order management — view all orders, update status
- Customer management — every customer, order count, total spent
- Listings approval queue — approve or reject customer-submitted products
  before they go live in the public catalog

## Tech stack
- **Frontend:** React (Vite) + Tailwind CSS + React Router + Axios + Recharts
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (DB)

## Folder structure

```
nivera/
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── models/                 # Mongoose schemas (User, Product, Cart, Order, Review)
│   ├── controllers/            # Route logic
│   ├── routes/                 # Express routers
│   ├── middleware/authMiddleware.js
│   ├── seed.js                 # Demo data seeder
│   ├── server.js                # App entry point
│   └── .env.example
└── frontend/
    └── src/
        ├── pages/               # Route-level pages (incl. pages/admin/)
        ├── components/          # Reusable UI (Navbar, ProductCard, etc.)
        ├── context/              # Auth + Cart global state
        └── api/axios.js          # Configured API client
```

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — any long random string
- `JWT_EXPIRES_IN` — e.g. `7d`

Run it:
```bash
npm run dev     # requires nodemon (npm install -g nodemon), or:
npm start
```

Server runs on `http://localhost:5000` by default. Test it's alive:
```bash
curl http://localhost:5000/api/health
```

### Seeding demo data

The catalog is empty until you seed it. With `.env` filled in:
```bash
npm run seed
```
This wipes existing products (and any prior demo accounts) and inserts the
demo catalog plus:

| Role     | Email                    | Password      |
| -------- | ------------------------ | ------------- |
| Admin    | admin@retaildemo.com     | admin123      |
| Customer | customer@retaildemo.com  | customer123   |

Change or delete these before showing this to anyone outside the team.

> **Note:** if you're upgrading an older database that predates the
> approval-queue feature, existing products may be missing the
> `approvalStatus` field and won't show up in the public catalog. Run a
> one-off backfill to fix it:
> ```js
> await Product.updateMany(
>   { approvalStatus: { $exists: false } },
>   { $set: { approvalStatus: "approved" } }
> );
> ```

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env    # points VITE_API_URL at your backend
npm run dev
```

Runs on `http://localhost:5173` by default. Make sure the backend is running
too, or API calls will fail.

To create an admin account: register normally through the UI, then either
manually set `role: "admin"` on that user in MongoDB Atlas, or register via
the API with `{ "role": "admin" }` in the body — the signup form itself
only creates customer accounts.

## Deployment

Three pieces to stand up, in this order:

**1. Database — MongoDB Atlas**
- Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Add a database user and allow access from anywhere (`0.0.0.0/0`) — needed
  if your local IP or your host's IP isn't static
- Copy the connection string — this is your `MONGO_URI`

**2. Backend — Render**
- New Web Service → point at this repo → root directory `backend`
- Build command `npm install`, start command `npm start`
  (or use `backend/render.yaml` as a Blueprint)
- Set env vars in the dashboard: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`
- Once live, confirm `/api/health` responds
- Run `npm run seed` once against this deployed backend's env (or point a
  local run of the script at the Atlas `MONGO_URI`) so the live site isn't
  empty

**3. Frontend — Vercel**
- New Project → point at this repo → root directory `frontend`
- Framework preset: Vite
- Env var: `VITE_API_URL` = `<your Render backend URL>/api`
- `frontend/vercel.json` is already in the repo so client-side routes like
  `/products/:id` don't 404 on refresh

Free tiers on Render spin down after inactivity — the first request after
idle can take ~30s to wake up, worth mentioning if demoing live.

## API reference

### Auth — `/api/auth`
| Method | Route | Access | Body |
|---|---|---|---|
| POST | `/register` | Public | `{ name, email, password, role? }` |
| POST | `/login` | Public | `{ email, password }` |
| GET | `/me` | Logged in | — |

### Products — `/api/products`
| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/` | Public | Only approved listings. Query: `?category=`, `?search=`, `?page=`, `?limit=` (max 100). Returns `{ products, page, totalPages, totalItems }` |
| GET | `/categories` | Public | Distinct category list across all approved products |
| GET | `/:id` | Public | |
| GET | `/dashboard/stats` | Admin | Revenue charts, low-stock, top sellers, pending listings count |
| GET | `/admin/all` | Admin | Every product regardless of approval status |
| POST | `/` | Admin | Create product (auto-approved) |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Delete product |
| GET | `/:id/reviews` | Public | |
| POST | `/:id/reviews` | Logged in | `{ rating, comment }` |
| DELETE | `/:id/reviews` | Logged in | Own review only |

### Listings (customer self-listing) — `/api/products/listings`
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/` | Logged in | Submit a product to sell, starts `pending` |
| GET | `/mine` | Logged in | Own submitted listings, any status |
| DELETE | `/:id` | Logged in | Own listing only |
| GET | `/pending` | Admin | Review queue |
| PUT | `/:id/review` | Admin | `{ decision: "approved" \| "rejected" }` |

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

### Users — `/api/users`
| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/` | Admin | All customers, order count, total spent |

## Contributing
1. Pull latest `main`
2. Create a branch per feature: `git checkout -b feature/whatever`
3. Don't touch core models unless necessary — extend, don't restructure
4. Test your routes with Postman/curl before pushing
