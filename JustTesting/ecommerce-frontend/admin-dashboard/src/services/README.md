# services/

- `api.js`              axios instance, admin auth header, 401 → /login
- `authService.js`      login, verifyOtp
- `dashboardService.js` getStats() → { productCount, orderCount, reviewCount, customerCount, ... }
- `productService.js`   list/search, create, update, delete
- `categoryService.js`  list/search, create, update, delete
- `orderService.js`     list/search, getOrderDetail, updateStatus
- `reviewService.js`    list reviews
- `customerService.js`  list/search customers, promoteToAdmin(id)
- `settingsService.js`  getSettings, updateSettings
- `accountService.js`   getProfile, updateProfile, changePassword
