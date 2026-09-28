# E-Commerce Frontend

Two separate React apps sharing one backend API:

| App               | Who it's for      | Dev port |
|--------------------|-------------------|----------|
| `storefront/`      | Customers          | 5173     |
| `admin-dashboard/`  | Admins/staff       | 5174     |

Both are independent Vite + React projects (own `package.json`, own
`node_modules`, deployed separately). They share only the visual
language (`shared/constants/colors.js` — copy into each app's
`tailwind.config.js`) and, indirectly, the backend REST API.

## Why two apps instead of one?

- Customers never download admin code (smaller bundle, better security —
  no admin routes/strings sitting in the public bundle).
- Independent deploys: ship a dashboard fix without touching the
  storefront, or vice versa.
- Matches how the auth flow already forks: after OTP verification, a
  `role: "customer"` account lands in the storefront, a
  `role: "admin"` account is redirected to the dashboard's own domain
  (see `VITE_STOREFRONT_URL` / dashboard login in
  `admin-dashboard/.env.example`).

## Getting started

```bash
cd storefront && cp .env.example .env && npm install && npm run dev
cd admin-dashboard && cp .env.example .env && npm install && npm run dev
```

Both expect a backend REST API at `VITE_API_BASE_URL` (default
`http://localhost:8080/api`) — see `SPEC.md` for the suggested
endpoint list.

## Design tokens

- Khmer copy: `font-kh` (Kantumruy Pro) · English copy: `font-en` (Lexend, default)
- Brand palette: `brand.limeGreen #4ce600`, `brand.glowGreen #00e000`,
  `brand.aqua #00e1ff`, `brand.blue #009dff`, `brand.skyBlue #2eaeff` —
  reads best as a gradient (`bg-lagoon-gradient` in the storefront
  config), not as flat single-color fills everywhere.

## Full feature spec

See **SPEC.md** for the deep-detail breakdown of every storefront and
admin-dashboard feature (navbar behavior, auth/OTP flow, product
detail page, dashboard analytics, etc.) and the suggested API contract.
