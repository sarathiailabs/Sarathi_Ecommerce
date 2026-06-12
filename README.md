# 🛒 Nova Cart — Full-Stack E-Commerce Application

> A modern, production-ready e-commerce platform built with **Express** (Node.js backend) and **React + TypeScript** (frontend), backed by **Supabase** and fully containerized with **Docker**.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Backend — Express](#-backend--express)
  - [Backend File Overview](#backend-file-overview)
  - [API Endpoints](#api-endpoints)
- [Frontend — React + TypeScript](#-frontend--react--typescript)
  - [Frontend File Overview](#frontend-file-overview)
  - [Pages & Routes](#pages--routes)
- [Getting Started — Local Development](#-getting-started--local-development)
- [Getting Started — Docker (Recommended)](#-getting-started--docker-recommended)
- [Environment Variables](#-environment-variables)
- [Features](#-features)

---

## 📦 Project Overview

**Nova Cart** is a full-stack e-commerce web application that demonstrates:
- User registration & JWT-based authentication
- Product catalogue browsing with category filtering
- Shopping cart management (add, update, remove items)
- Checkout with real-time stock validation and atomic order creation
- Order history for customers
- Full Admin Dashboard for product and order management

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | >=18.0.0 | Runtime environment |
| Express | 4.19.2 | Web framework |
| Supabase JS | 2.43.4 | Database client & logic |
| bcryptjs | 2.4.3 | Password hashing |
| jsonwebtoken | 9.0.2 | JWT token creation & verification |
| morgan | 1.10.0 | HTTP request logger |
| uuid | 9.0.1 | UUID generation |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI library |
| TypeScript | 5.2.2 | Type-safe JavaScript |
| Vite | 5.1.6 | Build tool & dev server |
| React Router DOM | 6.22.3 | Client-side routing |
| Axios | 1.6.8 | HTTP client |
| Tailwind CSS | 3.4.1 | Utility-first CSS framework |
| Lucide React | 0.363.0 | Icon library |

### Infrastructure
| Technology | Purpose |
|---|---|
| Supabase | Cloud hosted Relational PostgreSQL database & backend services |
| Docker + Docker Compose | Containerization & orchestration |
| Nginx | Frontend static file serving (production) |

---

## 📁 Project Structure

```
Nova_Cart/
├── docker-compose.yml          # Orchestrates backend & frontend services
│
├── backend/
│   ├── Dockerfile              # Node.js alpine image
│   ├── package.json            # Node dependencies and scripts
│   ├── src/
│   │   ├── app.js              # Express app entry point
│   │   ├── config/
│   │   │   └── settings.js     # Settings and configuration loader
│   │   ├── db/
│   │   │   └── supabase.js     # Supabase client setup
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT auth middleware
│   │   │   ├── error.js        # Global error handling middleware
│   │   │   └── tracking.js     # X-Request-ID & X-Response-Time tracker
│   │   ├── routes/
│   │   │   ├── auth.js         # /api/auth/* endpoints
│   │   │   ├── products.js     # /api/products/* endpoints
│   │   │   ├── cart.js         # /api/cart/* endpoints
│   │   │   └── orders.js       # /api/orders/* endpoints
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── cartController.js
│   │   │   └── orderController.js
│   │   └── utils/
│   │       └── seed.js         # Mock data seeder (Supabase DB seeder)
│
└── frontend/
    ├── Dockerfile              # Multi-stage: Node build → Nginx serve
    ├── nginx.conf              # Nginx config for SPA routing
    ├── index.html              # HTML entry point
    ├── package.json            # npm scripts & dependencies
    ├── vite.config.ts          # Vite + React plugin config
    ├── tailwind.config.js      # Tailwind CSS configuration
    ├── tsconfig.json           # TypeScript compiler options
    └── src/
        ├── main.tsx            # React DOM root render
        ├── App.tsx             # Root component, BrowserRouter, all route definitions
        ├── index.css           # Global styles + Tailwind directives
        ├── context/
        │   ├── AuthContext.tsx # Global auth state (user, token, login, logout)
        │   └── CartContext.tsx # Global cart state (items, add, remove, clear)
        ├── services/
        │   └── api.ts          # Axios instance with base URL & auth interceptor
        ├── components/
        │   ├── Navbar.tsx      # Top navigation bar with auth & cart state
        │   ├── ProtectedRoute.tsx  # Redirects unauthenticated users to /login
        │   └── AdminRoute.tsx  # Redirects non-admins away from admin pages
        └── pages/
            ├── Home.tsx            # Product catalogue with category filters
            ├── ProductDetails.tsx  # Single product view, add-to-cart
            ├── Cart.tsx            # Shopping cart, quantity control, checkout
            ├── Orders.tsx          # Customer order history
            ├── Login.tsx           # Login form (email + password)
            ├── Register.tsx        # User registration form
            └── AdminDashboard.tsx  # Admin: manage products & update order statuses
```

---

## ⚙️ Backend — Express

### Backend File Overview

| File/Folder | Responsibility |
|---|---|
| [`src/app.js`](backend/src/app.js) | Express app creation, CORS middleware, router registration, lifespan startup database seeding |
| [`src/config/settings.js`](backend/src/config/settings.js) | Settings loaded from environment variables |
| [`src/db/supabase.js`](backend/src/db/supabase.js) | Supabase client initialization |
| [`src/routes/`](backend/src/routes/) | Route controllers mounting points |
| [`src/controllers/`](backend/src/controllers/) | Route request/response handler logic |
| [`src/utils/seed.js`](backend/src/utils/seed.js) | Seeds the database with sample products, reviews, and customer/admin users |

---

### API Endpoints

All endpoints are prefixed with `/api`.

#### 🔐 Authentication — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login via JSON & get JWT access token |
| `POST` | `/api/auth/token` | Public | Login via form-data (compat) & get JWT access token |
| `GET` | `/api/auth/me` | 🔒 User | Get current user's profile |
| `PUT` | `/api/auth/me` | 🔒 User | Update current user's profile |

#### 🛍️ Products — `/api/products`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | List all products |
| `GET` | `/api/products/{id}` | Public | Get single product details |

#### 🛒 Cart — `/api/cart`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/cart` | 🔒 User | Get current user's cart items |
| `POST` | `/api/cart/items` | 🔒 User | Add or update a cart item (with stock check) |
| `DELETE` | `/api/cart/items/{product_id}` | 🔒 User | Remove an item from cart |

#### 📦 Orders — `/api/orders`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders` | 🔒 User | Checkout: create order, deduct stock, clear cart (atomic transaction) |
| `GET` | `/api/orders` | 🔒 User | Get order history for current user |

#### 🔧 Admin — `/api/admin`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/admin/products` | 🔑 Admin | Create a new product |
| `PUT` | `/api/admin/products/{id}` | 🔑 Admin | Update an existing product |
| `DELETE` | `/api/admin/products/{id}` | 🔑 Admin | Delete a product |
| `GET` | `/api/admin/orders` | 🔑 Admin | View all customer orders |
| `PUT` | `/api/admin/orders/{id}/status` | 🔑 Admin | Update an order's status |

---

### Database Schema

All database operations run against Supabase tables:
```
users
  └── id (UUID PK), email, hashed_password, full_name, is_admin, created_at

products
  └── id (UUID PK), name, description, price, stock, image_url, category

carts
  └── id (UUID PK), user_id (FK → users), product_id (FK → products), quantity

orders
  └── id (UUID PK), user_id (FK → users), total_amount, status, created_at

order_items
  └── id (UUID PK), order_id (FK → orders), product_id (FK → products), quantity, price
```

---

## 🎨 Frontend — React + TypeScript

### Frontend File Overview

| File/Folder | Responsibility |
|---|---|
| [`src/main.tsx`](frontend/src/main.tsx) | React app entry point, mounts `<App />` to DOM |
| [`src/App.tsx`](frontend/src/App.tsx) | Root component: wraps app in `AuthProvider`, `CartProvider`, defines all routes |
| [`src/index.css`](frontend/src/index.css) | Global CSS, Tailwind base/components/utilities imports |
| [`src/context/AuthContext.tsx`](frontend/src/context/AuthContext.tsx) | Global auth state — stores JWT token, user info; exposes `login()`, `logout()` |
| [`src/context/CartContext.tsx`](frontend/src/context/CartContext.tsx) | Global cart state — synced with backend; exposes `addItem()`, `removeItem()`, `clearCart()` |
| [`src/services/api.ts`](frontend/src/services/api.ts) | Axios instance with `baseURL` set; request interceptor auto-attaches `Authorization: Bearer <token>` |
| [`src/components/Navbar.tsx`](frontend/src/components/Navbar.tsx) | Responsive navigation bar showing auth status, cart item count, and admin link |
| [`src/components/ProtectedRoute.tsx`](frontend/src/components/ProtectedRoute.tsx) | Route guard — redirects to `/login` if user is not authenticated |
| [`src/components/AdminRoute.tsx`](frontend/src/components/AdminRoute.tsx) | Route guard — redirects to `/` if user is not an admin |

---

### Pages & Routes

| Route | Page | Access | Description |
|---|---|---|---|
| `/` | [`Home.tsx`](frontend/src/pages/Home.tsx) | Public | Product catalogue with category filter chips and product cards |
| `/product/:id` | [`ProductDetails.tsx`](frontend/src/pages/ProductDetails.tsx) | Public | Full product info, stock badge, "Add to Cart" button |
| `/login` | [`Login.tsx`](frontend/src/pages/Login.tsx) | Public | Email/password login form |
| `/register` | [`Register.tsx`](frontend/src/pages/Register.tsx) | Public | User registration form (name, email, password) |
| `/cart` | [`Cart.tsx`](frontend/src/pages/Cart.tsx) | 🔒 Auth | Cart items list, quantity control, order total, checkout button |
| `/orders` | [`Orders.tsx`](frontend/src/pages/Orders.tsx) | 🔒 Auth | Customer's full order history with items and status badges |
| `/admin/dashboard` | [`AdminDashboard.tsx`](frontend/src/pages/AdminDashboard.tsx) | 🔑 Admin | Tabs for product management (CRUD) and all orders management |

---

## 🚀 Getting Started — Local Development

### Prerequisites
- Node.js 20+
- Supabase project credentials

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure the environment variables by editing or creating a .env file:
# PORT=8000
# ENVIRONMENT=development
# JWT_SECRET=super-secret-key-change-in-production-123456
# JWT_ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=1440
# SUPABASE_URL=your-supabase-url
# SUPABASE_SERVICE_KEY=your-supabase-service-key

# Run the backend server
npm run dev
```

> The backend automatically seeds initial data if running in a non-production environment.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

> Frontend runs at: **http://localhost:5173**

---

## 🐳 Getting Started — Docker (Recommended)

Run the entire stack (Express Backend + Frontend) with one command:

```bash
# From the project root
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |

To stop all services:
```bash
docker-compose down
```

---

## 🔧 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=8000
ENVIRONMENT=development
JWT_SECRET=super-secret-key-change-in-production-123456
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

> ⚠️ **Never commit real secrets to version control.** The values in `config.py` are defaults for local development only.

---

## ✅ Features

### Customer Features
- 🔐 Register & Login with JWT authentication (token persisted in localStorage)
- 🏠 Browse all products with category filtering
- 🔍 View detailed product pages with stock availability
- 🛒 Add products to cart, adjust quantities, remove items
- 💳 Checkout with atomic transaction (stock validated & deducted, cart cleared)
- 📦 View full order history with status tracking

### Admin Features
- ➕ Create new products with name, price, stock, category, and image URL
- ✏️ Edit existing product details
- 🗑️ Delete products
- 👁️ View all customer orders across the platform
- 🔄 Update order statuses (Pending → Shipped → Delivered)

### Technical Highlights
- ⚡ **Express + Node.js** async API layer
- 🔒 Secure password hashing with **bcryptjs**
- 🪙 **JWT** with role claims for access control
- 📦 Direct integration with **Supabase** cloud client
- 🐳 Full **Docker Compose** setup for backend & frontend
- 🎨 Responsive dark-themed UI built with **Tailwind CSS**

---

## 👤 Default Admin Account

After first startup (or docker-compose up), a seeded admin account is available:

| Field | Value |
|---|---|
| Email | `admin@novacart.com` |
| Password | `admin123` |

> ⚠️ Change this password in production.

---

## 📄 License

This project is built for demonstration and office presentation purposes.

© 2026 Nova Cart — Built with ❤️ using FastAPI & React
