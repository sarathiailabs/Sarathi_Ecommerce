# 🛒 Sarathi Store

> A modern, premium, and production-ready full-stack e-commerce application built with **Express (Node.js)** on the backend, **React + TypeScript** on the frontend, and backed by **Supabase (PostgreSQL)**, featuring containerized setup with **Docker**.

---

## 📋 Table of Contents

- [Project Description](#-project-description)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Environment Variables](#-environment-variables)
- [Installation & Local Setup](#-installation--local-setup)
- [Screenshots](#-screenshots)
- [Deployment Instructions](#-deployment-instructions)
- [Build Commands](#-build-commands)
- [License](#-license)
- [Author & Support](#-author--support)

---

## 📦 Project Description

**Sarathi Store** is a state-of-the-art e-commerce platform designed to offer a premium, frictionless shopping experience similar to industry leaders like Amazon and Flipkart. The application incorporates beautiful custom card grid structures, modern slider carousels, instant category switching, real-time search, robust user authentication, interactive cart systems, and an administrative hub to manage catalogs and monitor client orders. 

The frontend has been audited for maximum visual quality, responsive sizing (consistent gutters, flexible card sizing, custom gap configurations), and polished micro-animations (`active:scale-95`, smooth transitions) to engage users on mobile, tablet, and desktop screens alike.

---

## ✅ Key Features

### 🛍️ Customer Features
- **User Authentication**: Secure signup and login using JWTs with authorization claims.
- **Product Catalog & Details**: Browse products, view detailed specifications, review counts, stock statuses, and dynamic rating badges.
- **Responsive Layout**: Specially optimized layout padding (`px-4 sm:px-6 lg:px-8`) and adaptive card grids (`gap-3 sm:gap-6` on mobile to desktop viewports).
- **Search & Filters**: Search products by name, filter by categories, rating filters, and drag-and-drop price ranges.
- **Wishlist & Cart**: Instantly add items to the cart or wishlist with seamless status synchronizations.
- **Atomic Checkout**: Checkout process with stock validation, database transaction integrity, and automated cart clearance.
- **Order Tracking**: Comprehensive user order history detailing products purchased, totals, and delivery status badges (Pending, Shipped, Delivered).

### 🔑 Admin Features
- **Product Management**: Create, edit, and delete products dynamically.
- **Order Tracking**: Supervise customer purchases, filter items, and manage shipping statuses.

---

## 🛠️ Tech Stack

### Backend
- **Express (Node.js)**: Asynchronous API layer and routing.
- **Supabase Client**: Remote PostgreSQL database management.
- **jsonwebtoken (JWT)**: Secure user session creation.
- **bcryptjs**: Advanced password hashing algorithms.

### Frontend
- **React v18 & TypeScript**: Component-based user interface logic.
- **Vite**: Ultra-fast build tool and bundler.
- **Tailwind CSS**: Utility-first styling framework.
- **Lucide React**: Vector icon pack.
- **Swiper & Framer Motion**: Touch-swipe carousels and smooth transition animations.

### Infrastructure & Operations
- **Docker & Docker Compose**: Automated container orchestration.
- **Nginx**: Production-grade static asset hosting.

---

## 📁 Folder Structure

```
Sarathi_ecommerce/
├── docker-compose.yml          # Orchestrates backend & frontend docker setups
│
├── backend/
│   ├── Dockerfile              # Node.js alpine Docker container definition
│   ├── package.json            # Node backend dependencies
│   ├── src/
│   │   ├── app.js              # Express application entry point
│   │   ├── config/
│   │   │   └── settings.js     # System settings and environment loader
│   │   ├── db/
│   │   │   └── supabase.js     # Supabase DB client initializer
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT validation middleware
│   │   │   ├── error.js        # Global HTTP error handler
│   │   │   └── tracking.js     # Request-ID tracking middleware
│   │   ├── routes/
│   │   │   ├── auth.js         # Auth routes (/api/auth)
│   │   │   ├── products.js     # Product routes (/api/products)
│   │   │   ├── cart.js         # Cart routes (/api/cart)
│   │   │   └── orders.js       # Order routes (/api/orders)
│   │   └── controllers/
│   │       ├── authController.js
│   │       ├── productController.js
│   │       ├── cartController.js
│   │       └── orderController.js
│
└── frontend/
    ├── Dockerfile              # Multi-stage Docker config (Build -> Nginx serve)
    ├── nginx.conf              # Nginx routing configuration
    ├── index.html              # Frontend DOM entry point
    ├── package.json            # Frontend packages & script definitions
    ├── vite.config.ts          # Vite configuration & split chunk strategies
    └── src/
        ├── main.tsx            # React application mount point
        ├── App.tsx             # Main routing hub and global layout
        ├── index.css           # Global design tokens, Tailwind, and custom styles
        ├── context/
        │   ├── AuthContext.tsx # Context provider for auth sessions
        │   └── CartContext.tsx # Context provider for cart quantities
        ├── services/
        │   └── api.ts          # Axios wrapper configured with base url & JWT header
        ├── components/
        │   ├── Navbar.tsx      # Premium navigation bar with responsive controls
        │   ├── HeroSlider.tsx  # Dynamic slider showcase
        │   └── ProductSearch.tsx # Advanced search dashboard with filters
        └── pages/
            ├── Home.tsx        # Storefront main catalog view
            ├── ProductDetails.tsx # Detailed single item preview
            ├── Cart.tsx        # Checkout and order summary overview
            └── AdminDashboard.tsx # Catalog CRUD panel and order status manager
```

---

## 🔧 Environment Variables

### Backend Configuration
Create a `.env` file inside the `backend/` directory:

```env
PORT=8000
ENVIRONMENT=development
JWT_SECRET=your-secure-jwt-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
```

### Frontend Configuration
Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js (version 20 or higher)
- npm or yarn packet manager
- A Supabase Project instance

### Step 1: Clone and Configure Backend
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file using the template in [Environment Variables](#-environment-variables).
4. Launch the local API server:
   ```bash
   npm run dev
   ```

### Step 2: Configure and Start Frontend
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the backend's server URL (`VITE_API_URL=http://localhost:8000/api`).
4. Start the local Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 🖼️ Screenshots

*Placeholder section for visual demonstrations of the storefront, catalog listing, filters panel, and dashboard.*

| Home Page Catalog | Admin Dashboard |
|---|---|
| ![Storefront Catalog Showcase](https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80) | ![Admin Dashboard Overview](https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80) |

---

## 🚢 Deployment Instructions

### Docker Compose Deployment (Recommended)
You can deploy the entire stack (Node Backend, React Frontend, and routing) on any server environment with a single command from the project root:

```bash
docker-compose up --build -d
```

- **Frontend Application**: Accessible via `http://localhost:3000`
- **Backend API Server**: Accessible via `http://localhost:8000`

To stop and tear down all container resources:
```bash
docker-compose down
```

### Manual Production Setup
1. **API Server**: Host the `backend` folder on a cloud VM or Serverless runner. Ensure to mount the environment variables. Use a process manager like `pm2` to run `node src/app.js`.
2. **Static Files**: Run the production build command inside the `frontend` directory. Deploy the output `dist/` directory to static hosting providers (e.g. Netlify, Vercel, AWS S3) or configure Nginx/Apache to point to it.

---

## 🔨 Build Commands

All build-related workflows can be triggered using the following scripts inside the `frontend` folder:

- **Type Checking (TypeScript)**:
  ```bash
  npx tsc --noEmit
  ```
- **Production Asset Compilation**:
  ```bash
  npm run build
  ```
- **Development Server**:
  ```bash
  npm run dev
  ```

---

## 📄 License

This software is licensed under the MIT License. You are free to modify, distribute, and compile the code for both personal and enterprise use.

---

## 👤 Author & Support

Developed and maintained by **Sarathi AI Labs**. For enquiries, configuration assistance, or direct assistance, reach out using the following details:

- **Author**: Sarathi AI Labs
- **Email**: [support@sarathiailabs.com](mailto:support@sarathiailabs.com)
- **Phone**: [+91 90224 73314](tel:+919022473314)
- **Website**: [sarathiailabs.com](https://sarathiailabs.com)
