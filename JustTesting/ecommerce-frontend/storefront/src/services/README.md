# services/

One file per backend resource. Each wraps `api.js` (the shared axios
instance) and exposes plain async functions — pages/components never
call axios directly.

- `api.js`              axios instance: baseURL from VITE_API_BASE_URL, auth
                         header interceptor, 401 → redirect to /sign-in
- `authService.js`      register, login, verifyOtp, forgotPassword, resetPassword
- `productService.js`   getProducts(filters), getProductById, getRelatedProducts
- `categoryService.js`  getCategories, getSubcategories(categoryType)
- `cartService.js`      getCart, addItem, updateItem, removeItem
- `wishlistService.js`  getWishlist, addToWishlist, removeFromWishlist
- `reviewService.js`    getReviewsForProduct
