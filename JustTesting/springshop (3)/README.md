# SpringShop — Frontend Application

Production-ready Fashion E-Commerce Frontend built with clean **HTML5 + TailwindCSS + Vanilla JavaScript** connecting to a Spring Boot REST API backend.

## 🌿 Brand Color Palette
- **Primary Green**: `#C1E899` (Soft accents)
- **Dark Green**: `#55883B` (Primary action buttons, active states, brand highlights)
- **Light Green**: `#E6F0DC` (Section backgrounds, badges)
- **Dark Brown**: `#9A6735` (Secondary accents, urgent badges)

## 📁 Architecture

```
springshop-frontend/
│
├── index.html                  # Customer Fashion Storefront
├── admin.html                  # Administrator Management Dashboard
│
├── assets/
│   ├── css/
│   │   ├── styles.css          # Global Tailwind and brand root theme variables
│   │   ├── storefront.css      # Product cards, hero banner, badges
│   │   └── admin.css           # Admin sidebar, tables, status badges
│   │
│   └── js/
│       ├── config.js           # Centralized API Base URL & storage keys
│       │
│       ├── api/
│       │   ├── client.js       # Centralized Fetch API client with Bearer JWT injection
│       │   ├── auth.js         # /api/auth/register & /api/auth/login
│       │   ├── products.js     # /api/products CRUD & search
│       │   ├── categories.js   # /api/categories CRUD & subcategories
│       │   ├── cart.js         # /api/cart CRUD & item management
│       │   ├── orders.js       # /api/orders CRUD & status updates
│       │   ├── reviews.js      # /api/reviews CRUD & average ratings
│       │   └── users.js        # /api/users profile & password management
│       │
│       ├── components/
│       │   ├── navbar.js       # Responsive navigation with category dropdown & search
│       │   ├── footer.js       # Store footer with customer care & trust badges
│       │   ├── modal.js        # Product details, auth, checkout, orders, profile modals
│       │   ├── drawer.js       # Slide-over cart drawer & mobile navigation drawer
│       │   ├── toast.js        # Accessible non-blocking toast notifications
│       │   ├── loader.js       # Spinners and skeleton cards
│       │   ├── pagination.js   # Grid and table pagination
│       │   ├── product-card.js # Reusable product card with wishlist & quick add
│       │   ├── empty-state.js  # Empty and error state components
│       │   └── confirmation.js # Action confirmation dialogs
│       │
│       ├── utils/
│       │   ├── storage.js      # Safe localStorage wrapper
│       │   ├── formatter.js    # Currency, date, status formatters
│       │   ├── validator.js    # Email, password, form validators
│       │   ├── debounce.js     # Search input debounce
│       │   ├── auth-guard.js   # Role-based and auth protection guards
│       │   └── error-handler.js# Centralized API error message parser
│       │
│       ├── store.js            # Storefront state engine & event orchestrator
│       └── admin.js            # Admin portal dashboard controller
│
└── README.md
```

## 🔌 API Endpoint Mapping

| Controller | HTTP Method | Endpoint | Frontend Usage |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | User account registration modal |
| **Auth** | `POST` | `/api/auth/login` | User & Admin sign in modal |
| **Products** | `GET` | `/api/products` | Storefront catalog & Admin product table |
| **Products** | `GET` | `/api/products/{id}` | Product Details view & review loader |
| **Products** | `GET` | `/api/products/category/{categoryId}` | Category collection filter |
| **Products** | `GET` | `/api/products/search?keyword=...` | Debounced search in navigation bar |
| **Products** | `POST` | `/api/products` | Multipart/form-data product creation |
| **Products** | `PUT` | `/api/products/{id}` | Multipart/form-data product update |
| **Products** | `DELETE`| `/api/products/{id}` | Product deletion with confirmation |
| **Categories** | `GET` | `/api/categories` | Categories table & selector dropdowns |
| **Categories** | `GET` | `/api/categories/top-level` | Top category filter pills & nav menu |
| **Categories** | `GET` | `/api/categories/{id}/subcategories` | Category hierarchy |
| **Categories** | `POST` | `/api/categories` | Admin category creation |
| **Categories** | `PUT` | `/api/categories/{id}` | Admin category update |
| **Categories** | `DELETE`| `/api/categories/{id}` | Admin category deletion |
| **Cart** | `GET` | `/api/cart` | Slide-over cart drawer & badge |
| **Cart** | `POST` | `/api/cart/items` | Add product to shopping bag |
| **Cart** | `PUT` | `/api/cart/items/{id}?quantity=...` | Update item quantity in drawer |
| **Cart** | `DELETE`| `/api/cart/items/{id}` | Remove item from cart |
| **Cart** | `DELETE`| `/api/cart` | Clear active cart |
| **Orders** | `POST` | `/api/orders` | Place order from active cart |
| **Orders** | `GET` | `/api/orders/me` | Customer My Orders history modal |
| **Orders** | `GET` | `/api/orders/{id}` | Order details view |
| **Orders** | `PUT` | `/api/orders/{id}/cancel` | Order cancellation |
| **Orders** | `GET` | `/api/orders/all` | Admin order management table |
| **Orders** | `PUT` | `/api/orders/{id}/status?status=...`| Admin order status updater |
| **Reviews** | `GET` | `/api/reviews/product/{productId}` | Product reviews list |
| **Reviews** | `GET` | `/api/reviews/product/{productId}/average` | Product star rating calculation |
| **Reviews** | `POST` | `/api/reviews` | Submit product review |
| **Reviews** | `PUT` | `/api/reviews/{id}` | Update own review |
| **Reviews** | `DELETE`| `/api/reviews/{id}` | Delete review |
| **Users** | `GET` | `/api/users/me` | User profile modal |
| **Users** | `PUT` | `/api/users/me` | Profile name & email update |
| **Users** | `PUT` | `/api/users/me/password` | Password change form |
| **Users** | `GET` | `/api/users` | Admin customer/user management |
| **Users** | `GET` | `/api/users/{id}` | Admin user details modal |

## 🚀 Running the Project
1. Ensure your Spring Boot backend is running on `http://localhost:8080` (or update `assets/js/config.js` or via Admin > Store Settings).
2. Open `index.html` in any modern web browser or serve with your local web server.
3. Access the Admin Dashboard via `admin.html` (requires account with `ADMIN` role).
