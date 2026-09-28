## Structure Our Project ##


springshop-frontend/
├── index.html               (Customer Storefront & Single Page Interface)
├── admin.html               (Administrator Dashboard & Management Control Center)
├── assets/
│   ├── css/
│   │   └── styles.css       (Custom polish, transitions, scrollbars)
│   └── js/
│       ├── config.js        (Base API URL configuration and storage keys)
│       ├── api/
│       │   ├── client.js    (Central Fetch HTTP client with JWT interceptors & error handlers)
│       │   ├── auth.js      (Auth API: login, register, token management)
│       │   ├── products.js  (Product API: CRUD, search, category filters, multipart upload)
│       │   ├── categories.js(Category API: CRUD, subcategories, top-level)
│       │   ├── cart.js      (Cart API: item add/update/remove/clear)
│       │   ├── orders.js    (Order API: checkout, user orders, admin orders, status change)
│       │   ├── reviews.js   (Review API: list, average rating, post, update, delete)
│       │   └── users.js     (User API: profile, password change, admin user list)
│       ├── components/
│       │   ├── toast.js     (Toast notification engine: success, error, warning, info)
│       │   ├── modal.js     (Accessible dynamic Modal and Confirmation Dialogs)
│       │   └── loader.js    (Interactive Skeleton and Spinner state helpers)
│       ├── store.js         (Storefront Application Logic)
│       └── admin.js         (Admin Dashboard Application Logic)


