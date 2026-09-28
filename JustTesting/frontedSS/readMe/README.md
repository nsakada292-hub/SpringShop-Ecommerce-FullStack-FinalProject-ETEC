### Instructions for Running the Frontend

1. **Verify Backend CORS & Base URL**:
   * Open `assets/js/config.js` and ensure `BASE_URL` points to your Spring Boot API (e.g. `http://localhost:8080/api`).
   * Ensure your Spring Boot backend has CORS enabled for the frontend host/port (e.g. via `@CrossOrigin` or `CorsConfigurationSource`).



2. **Serve the Frontend**:
   * You can serve these static files using any local web server:
     * **VS Code**: Right click `index.html` → *Open with Live Server*.
     * **Python 3**:
       ```bash
       python -m http.server 3000
       ```
     * **Node / `npx serve`**:
       ```bash
       npx serve .
       ```



3. **Navigate & Test**:
   * Open `http://localhost:3000/index.html` for the Storefront (catalog, search, cart, checkout, reviews, profile).
   * Open `http://localhost:3000/admin.html` for the Management Dashboard (overview analytics, product multipart uploads, category hierarchies, order status processing, and user access lists).