# SpringShop

A full-stack modern e-commerce platform for a Cambodian fashion & retail shop, built with **Spring Boot 4 + PostgreSQL** on the backend and **React 19 + Vite + Tailwind CSS v4** on the frontend. It features email-OTP authentication, JWT security, cart/wishlist/orders, a coupon system, an admin dashboard, and **Bakong (KHQR) QR-code payment integration** with the National Bank of Cambodia (NBC).

---

## Table of Contents

- [Monorepo Structure](#monorepo-structure)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Bakong (KHQR) Payment Integration](#bakong-khqr-payment-integration)
- [Newsletter Subscription](#newsletter-subscription)
- [Authentication & Security](#authentication--security)
- [Backend API Overview](#backend-api-overview)
- [Frontend Overview](#frontend-overview)
- [Getting Started](#getting-started)
- [Configuration & Environment Variables](#configuration--environment-variables)
- [Security Notes](#security-notes)

---

## Monorepo Structure

```
SpringShop-Project/
├── backend/
│   └── SpringShop-Backend/      # Spring Boot 4 REST API (Maven)
└── FrontendOC/                  # React 19 storefront + admin dashboard (Vite)
```

> `JustTesting/` contains prototype/scaffolding copies and is **not** part of the production app.

---

## Tech Stack

### Backend (`backend/SpringShop-Backend`)
- **Java 17**, **Spring Boot 4.1.0** (Maven, Spring Boot starter parent)
- Spring Data JPA + Hibernate, **PostgreSQL**
- Spring Security + **JWT (jjwt 0.12.7, HS256)**
- Spring Validation, Spring Mail (Gmail SMTP / OTP emails)
- **Bakong KHQR SDK** (`kh.gov.nbc.bakong_khqr:sdk-java:1.0.0.17`) for QR-code payment
- Lombok
- Maven wrapper 3.9.16

### Frontend (`FrontendOC`)
- **React 19** (React Compiler enabled), **TypeScript ~6**, **Vite 8**
- **Tailwind CSS v4** (CSS-first theming, dark mode)
- **react-router-dom v7**, React Hook Form + **Zod** validation
- **axios** (with single-flight automatic token refresh)
- **qrcode.react** (renders KHQR codes), framer-motion, GSAP, swiper, lottie-react
- 3D/visual: three, @react-three/fiber, @react-three/drei, @react-three/rapier, **ogl**, meshline, recharts
- State: React Context (Auth, Cart, Wishlist, Theme, Drawer)

---

## Key Features

### Authentication & Accounts
- **Email OTP two-step login**: register or login sends a 6-digit OTP to your email; `/verify-otp` exchanges it for a JWT **access token (15 min)** + **refresh token (7 days)**.
- Password policy (8–128 chars, upper/lower/digit/special) enforced.
- Forgot / reset password via OTP.
- Profile management, **avatar upload**, change password, "My Coupons".
- Roles: `USER` and `ADMIN`.

### Storefront (Customer-facing)
- **Home page** — hero carousel + search, featured products, categories, testimonials, newsletter signup, animated promotional bands.
- **Category browsing** — hierarchical categories with subcategories, filters (color/size), sorting (price, name, featured), product search.
- **Product catalog** — product detail pages with gallery, size/color, quantity, discount pricing (`salePrice`), related products, **ratings & reviews**.
- **Shopping cart** — drawer + full cart page, quantity steppers, shipping ($10, free ≥ $100) & tax (10%) calculation.
- **Wishlist** — save-for-later, one-click "Add to Bag".
- **Checkout** — shipping/billing form (Zod-validated), coupon validation, optional GPS coordinates, then **Bakong KHQR payment**.
- **Orders** — order history grouped by date, filter tabs (Unpaid/Processing/Completed/Cancelled), order detail + shipping tracker, **Pay Now**, **Cancel**, and **Reorder**.
- **Newsletter subscription** → instantly earns a **10% coupon**.

### Admin Dashboard (`/dashboard`, ADMIN only)
- Dashboard stats & revenue chart (products/categories/orders/users).
- **Product management** — CRUD with **image upload**, bulk **category-wide discounts**, stock badges.
- **Category management** — tree view with parent/subcategories.
- **Order management** — list, filter by status, update status, detail modal with recipient info.
- **Customer management** — search, promote/demote roles (USER ↔ ADMIN).
- **Review moderation**, newsletter/coupon visibility, and store settings (localStorage).

### Coupons & Discounts
- User earns `SAVE10-XXXXXXXX` coupons via newsletter subscription (10% off, 30-day validity, max 5 usages, covers up to N product units).
- Coupons are validated at checkout, applied across ordered products, and their usage is **restored on order cancellation**.
- Admin can set discounts per product (`/api/products/{id}/discount`) or across an entire category subtree.

### Trending / UX
- Dark/light theme toggle, skeleton loaders, animated drawers, toasts, Lottie 404 page, WebGL gradient waves & 3D backgrounds, GSAP image trails, React Compiler memoization.

---

## Bakong (KHQR) Payment Integration

Integrated with the **National Bank of Cambodia's Bakong API** for instant QR payments in **USD and KHR**.

### How it works
1. **Initiate** — `POST /api/payments/initiate` generates a KHQR code for an order using the official **Bakong KHQR SDK** (`BakongKHQR.generateMerchant` tag-30 corporate QR, or `generateIndividual` tag-29 when no merchant id is configured). The QR string + `md5` lookup key + expiry are stored on the `Order`/`PaymentAttempt`.
2. **Customer scans** the QR with the Bakong (or any KHQR) mobile app and pays.
3. **Poll status** — `POST /api/payments/status` checks settlement server-side via `POST /v1/check_transaction_by_md5` on `https://api-bakong.nbc.gov.kh`. Repeat polls within 60s are served from a memory cache (no API cost).
4. **Frontend auto-polls** the Payment page (fast every 8s for 45s, then every 45s) and routes to the order page on success.

### Settlement & validation
- Compares the paid amount vs. expected amount (currency-normalized via `bakong.usd-to-khr-rate`, default 4000) with absolute + relative tolerance (0.01 each). **Underpayments are flagged `UNDERPAID`; overpayments settle.**
- Settled transactions store payer id/name, paid currency/amount, and the Bakong transaction hash.
- A nightly/scheduled **reconciliation job** (`BakongReconciliationJob`) re-checks unsettled attempts (off by default to protect the API budget).

### Bakong API endpoints used
| Endpoint | Purpose |
|---|---|
| `POST /v1/check_transaction_by_md5` | Single settlement lookup (primary) |
| `POST /v1/check_transaction_by_md5_list` | Batched lookup (auto-disabled when the account is rejected) |
| `POST /v1/check_bakong_account` | Advisory receiver check (never blocks checkout, cached) |
| `POST /v1/renew_token` | Automatic Bakong API token renewal |

### Operating modes
- **Mock mode** (`bakong.mock=true`) — offline simulation; md5 is `mock-<orderId>-<id>`, first status poll simulates settlement.
- **Demo merchant** (`bakong.demo-merchant=true`) — offline corporate merchant QR from sandbox values.
- **Real mode** (default) — live QR generation + NBC API lookups. **No inbound webhook**: settlement is discovered by polling and/or the optional reconciler.

### API budget protection
Real Bakong accounts are rate-limited (~100 requests/day). SpringShop enforces an in-memory **daily budget (default 90)**, logs warnings from 25% / 80% thresholds, suspends when exhausted, caches lookups, and keeps reconciliation disabled by default.

---

## Newsletter Subscription

The "Subscribe" feature converts site visitors into email subscribers and rewards them immediately:

- `POST /api/newsletter/subscribe` (public) records an email and **returns a generated 10% coupon** (`SAVE10-XXXXXXXX`).
- The storefront **home page** subscribes through the real API (`newsletterApi.subscribe`); the footer form is client-side only.
- Subscribers can see their earned coupons under **My Coupons** (`GET /api/users/me/coupons`) and validate/applied them at checkout (`POST /api/coupons/validate`).
- Coupons are per-email/user with max-usages tracking; usage counts are restored when an order is cancelled.

---

## Authentication & Security

- **Stateless JWT**: access (15 min) + refresh (7 days, rotated; reuse detection revokes all sessions).
- **Refresh tokens stored SHA-256-hashed**; OTPs stored hashed and expire in 5 minutes (max 5 attempts).
- **Login lockout**: 5 failed attempts → 15-minute lockout.
- **Rate limiting** on `/api/auth/**` — 10 req/60s per client (sliding window, 429 response).
- **BCrypt password hashing** (strength 12).
- **Input sanitization** (HTML-encoding, null/CR/LF stripping) and **file-upload validation** (≤2 MB, JPEG/PNG/GIF/WebP, magic-byte check, no path traversal).
- **Security headers**: strict CSP, `frame-ancestors 'none'`, HSTS, restrictive referrer & permission policies.
- **Protected routes** both server-side (role rules in `SecurityConfig`) and client-side (`ProtectedRoute` / `ProtectedAdminRoute`).

---

## Backend API Overview

Base path: `/api` · Port: `8080`

| Area | Base | Notable endpoints |
|---|---|---|
| Auth | `/api/auth` | `POST register`, `login`, `send-otp`, `verify-otp`, `refresh`, `logout` |
| Users | `/api/users` | `GET me`, `PUT me`, `POST me/avatar`, `PUT me/password`, `GET me/coupons`; ADMIN: `GET`, `GET {id}`, `PATCH {id}/role` |
| Products | `/api/products` | CRUD, `PUT {id}/discount`, `PUT category/{categoryId}/discount`, `GET search?keyword=` (ADMIN for POST/PUT/DELETE) |
| Categories | `/api/categories` | CRUD (ADMIN), `GET top-level`, `GET {id}/subcategories` (public) |
| Cart | `/api/cart` | `GET`, `POST items`, `PUT items/{id}?quantity=`, `DELETE items/{id}`, `DELETE` (authenticated) |
| Orders | `/api/orders` | `POST` (from cart), `GET me`, `GET {id}`, `PUT {id}/status` (ADMIN), `PUT {id}/cancel` |
| Payments | `/api/payments` | `POST initiate` `{orderId, currency: USD\|KHR}`, `POST status` `{orderId}` |
| Reviews | `/api/reviews` | CRUD, `GET product/{productId}`, `GET product/{productId}/average` |
| Wishlist | `/api/wishlist` | `GET`, `POST {productId}`, `DELETE {productId}` (authenticated) |
| Coupons | `/api/coupons` | `POST validate` (authenticated) |
| Newsletter | `/api/newsletter` | `POST subscribe` (public) |

### Core entities
`User`, `Product` (optimistic locking via `@Version`), `Category` (self-referencing tree), `Cart`/`CartItem`, `Order`/`OrderItem`, `PaymentAttempt` (per-KHQR record), `RefreshToken`, `Coupon`, `Review`, `WishlistItem`.

### Data & seeding
- PostgreSQL database `db_spring_shop_e-commerce-project`, schema auto-managed (`ddl-auto=update`).
- `DataInitializer` bootstraps a default **ADMIN** account (`app.admin.email` / `app.admin.password`) on startup.
- Uploaded images are stored under `uploads/avatars` and `uploads/products` and served at `/uploads/**`.

---

## Frontend Overview

### Routes (storefront)
```
/                    Home
/category            Browse categories
/category/:id        Category page (?sub=subcategory, ?q=search)
/product/:id         Product detail
/cart                Cart (protected)
/wishlist            Wishlist
/checkout            Checkout (protected)
/payment/:orderId    Bakong KHQR payment (protected)
/orders              My orders (protected)
/orders/:id          Order detail (protected)
/account             Profile / Password / My Coupons (protected)
/about               About us
/sign-in, /verify-email, /forgot-password, /reset-password
```

### Routes (admin dashboard, ADMIN only)
`/dashboard`, `/dashboard/products`, `/dashboard/categories`, `/dashboard/orders`, `/dashboard/reviews`, `/dashboard/customers`, `/dashboard/settings`, `/dashboard/account`.

### Dev proxy
`vite.config.ts` proxies `/api` and `/uploads` → `http://localhost:8080`, so the frontend calls relative `/api/...` paths in development.

---

## Getting Started

### Prerequisites
- JDK 17+, Maven (or use `mvnw`)
- Node.js 18+ and npm
- PostgreSQL running locally (or a `DB_URL` you control)

### 1. Backend

```bash
cd backend/SpringShop-Backend

# create application-local.properties from the sample keys in Configuration below
# (gitignored — holds real DB / mail / Bakong credentials)

.\mvnw.cmd spring-boot:run        # Windows
./mvnw spring-boot:run            # macOS/Linux
```

The API starts on **http://localhost:8080**.

### 2. Frontend

```bash
cd FrontendOC
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies API calls to the backend. A default admin is created on backend startup with the credentials in `app.admin.*`.

### Tests
```bash
cd backend/SpringShop-Backend
.\mvnw.cmd test
```

---

## Configuration & Environment Variables

Secrets live in `backend/SpringShop-Backend/src/main/resources/application-local.properties` (gitignored), merged via `spring.config.import=optional:application-local.properties`. Production-ready keys use `${ENV_VAR:default}` placeholders.

| Key | Example / default | Notes |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/db_spring_shop_e-commerce-project` | PostgreSQL |
| `DB_USERNAME` / `DB_PASSWORD` | `postgres` | Real password in local file |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | Gmail + App Password | SMTP `smtp.gmail.com:465` SSL |
| `JWT_SECRET` / `jwt.secret` | Base64 (≥ 256-bit) | HS256 signing key |
| `jwt.expiration` | `900000` (15 min) | Access token TTL |
| `jwt.refresh-expiration` | `604800000` (7 days) | Refresh token TTL |
| `bakong.base-url` | `https://api-bakong.nbc.gov.kh` | NBC production |
| `bakong.token` | live Bakong access JWT (~179 day expiry) | Auto-renewed via email if empty |
| `bakong.account-id` | wallet id (`name@bank`) | Receiver account |
| `bakong.merchant-id` | merchant id | Switches to tag-30 merchant QR; otherwise tag-29 individual QR |
| `bakong.email` | Bakong account email | Only needed for `renew_token` |
| `bakong.mock` / `bakong.demo-merchant` | `false` / `false` | Modes (see Bakong section) |
| `bakong.qr-expiry-minutes` | `15` | QR validity |
| `bakong.usd-to-khr-rate` | `4000` | Currency-normalized amount check |
| `bakong.daily-request-budget` | `90` | NBC API budget guard |
| `bakong.reconciliation-enabled` | `false` | Scheduled re-check job |
| `app.admin.email` / `app.admin.password` | `admin@springshop.com` / `Admin@1234!` | Bootstrapped admin |
| `app.otp.expiry-minutes` | `5` | OTP TTL |
| `app.otp.log-to-console` | `true` | Logs OTP in dev |
| `app.cors.allowed-origins` | `http://localhost:5173,...` | Allowed CORS origins |

Full reference: `backend/SpringShop-Backend/src/main/resources/application.properties`.

---

## Security Notes

> **Before publishing/forks, rotate/secrets-review:**
> - `jwt.secret` and `app.admin.password` are currently **hardcoded** in `application.properties` — move to env vars and rotate.
> - `application-local.properties` contains live PostgreSQL, Gmail, and Bakong credentials — it is `.gitignore`d and must **never** be committed.
> - Bakong production token access should be treated as a secret; the app supports auto-renewal via `bakong.email` if you prefer not to store it.

---

## License

Free to use for learning and portfolio purposes. Bakong integration requires an account accredited by the National Bank of Cambodia. Always test with sandbox (`demo-merchant`) credentials before enabling real payments.# SpringShop-Ecommerce-FullStack-FinalProject-ETEC
