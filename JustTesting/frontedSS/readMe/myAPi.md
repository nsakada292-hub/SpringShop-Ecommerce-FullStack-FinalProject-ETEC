### Before building the frontend, every single backend controller endpoint has been mapped out to ensure 100% integration coverage:

| Controller | HTTP Method | Endpoint | Request Payload / Params | Response | Auth / Role | Frontend Feature |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |



| **AuthController** | `POST` | `/api/auth/register` | JSON (`UserRegisterRequest`) | JSON (`AuthResponse` - token, user info) | Public | Register Modal / Page |
| **AuthController** | `POST` | `/api/auth/login` | JSON (`UserLoginRequest`) | JSON (`AuthResponse` - token, user info) | Public | Login Modal / Page |



| **CategoryController** | `GET` | `/api/categories` | None | `List<CategoryResponse>` | Public | Store Filters, Admin Categories Table |
| **CategoryController** | `GET` | `/api/categories/top-level` | None | `List<CategoryResponse>` | Public | Store Header Nav / Main Category Filter |
| **CategoryController** | `GET` | `/api/categories/{id}/subcategories` | Path variable `id` | `List<CategoryResponse>` | Public | Category Sub-filters |
| **CategoryController** | `GET` | `/api/categories/{id}` | Path variable `id` | `CategoryResponse` | Public | Category Breadcrumb / Detail |
| **CategoryController** | `POST` | `/api/categories` | JSON (`CategoryRequest`) | `CategoryResponse` | Admin | Admin Create Category Modal |
| **CategoryController** | `PUT` | `/api/categories/{id}` | JSON (`CategoryRequest`) | `CategoryResponse` | Admin | Admin Update Category Modal |
| **CategoryController** | `DELETE`| `/api/categories/{id}` | Path variable `id` | `Void (204 No Content)` | Admin | Admin Delete Category Action |



| **ProductController** | `GET` | `/api/products` | None | `List<ProductResponse>` | Public | Store Catalog, Admin Product Table |
| **ProductController** | `GET` | `/api/products/{id}` | Path variable `id` | `ProductResponse` | Public | Product Details Modal / View |
| **ProductController** | `GET` | `/api/products/category/{categoryId}`| Path variable `categoryId` | `List<ProductResponse>` | Public | Category Filtered Grid |
| **ProductController** | `GET` | `/api/products/search?keyword=...`| Query param `keyword` | `List<ProductResponse>` | Public | Debounced Live Search Bar |
| **ProductController** | `POST` | `/api/products` | `multipart/form-data` (`productRequest` + `file`) | `ProductResponse` | Admin | Admin Create Product with Image Upload |
| **ProductController** | `PUT` | `/api/products/{id}` | `multipart/form-data` (`productRequest` + optional `file`) | `ProductResponse` | Admin | Admin Edit Product Modal |
| **ProductController** | `DELETE`| `/api/products/{id}` | Path variable `id` | `Void (204 No Content)` | Admin | Admin Delete Product Action |



| **CartController** | `GET` | `/api/cart` | None | `CartResponse` (items, total) | Customer | Slide-over Cart Drawer / Cart Badge |
| **CartController** | `POST` | `/api/cart/items` | JSON (`CartItemRequest`) | `CartResponse` | Customer | Add to Cart Button |
| **CartController** | `PUT` | `/api/cart/items/{cartItemId}?quantity=...` | Query param `quantity` | `CartResponse` | Customer | Increment / Decrement Cart Item |
| **CartController** | `DELETE`| `/api/cart/items/{cartItemId}` | Path variable `cartItemId` | `CartResponse` | Customer | Remove Cart Item Button |
| **CartController** | `DELETE`| `/api/cart` | None | `Void (204 No Content)` | Customer | Clear Cart Button |



| **OrderController** | `POST` | `/api/orders` | JSON (`OrderRequest`) | `OrderResponse` | Customer | Checkout Modal / Place Order |
| **OrderController** | `GET` | `/api/orders/me` | None | `List<OrderResponse>` | Customer | Customer My Orders History |
| **OrderController** | `GET` | `/api/orders/{id}` | Path variable `id` | `OrderResponse` | Customer/Admin | Order Details Modal / Invoice view |
| **OrderController** | `PUT` | `/api/orders/{id}/cancel` | Path variable `id` | `Void (204 No Content)` | Customer/Admin | Cancel Order Action |
| **OrderController** | `GET` | `/api/orders/all` | None | `List<OrderResponse>` | Admin | Admin Orders Management Grid |
| **OrderController** | `PUT` | `/api/orders/{id}/status?status=...` | Query param `status` | `OrderResponse` | Admin | Admin Order Status Dropdown |



| **ReviewController** | `GET` | `/api/reviews/product/{productId}` | Path variable `productId` | `List<ReviewResponse>` | Public | Product Modal Reviews List |
| **ReviewController** | `GET` | `/api/reviews/product/{productId}/average` | Path variable `productId` | `Double` | Public | Product Card & Modal Star Rating |
| **ReviewController** | `POST` | `/api/reviews` | JSON (`ReviewRequest`) | `ReviewResponse` | Customer | Submit Review Form |
| **ReviewController** | `PUT` | `/api/reviews/{id}` | JSON (`ReviewRequest`) | `ReviewResponse` | Customer/Admin | Edit Review Form |
| **ReviewController** | `DELETE`| `/api/reviews/{id}` | Path variable `id` | `Void (204 No Content)` | Customer/Admin | Delete Review Action |



| **UserController** | `GET` | `/api/users/me` | None | `UserResponse` | Customer/Admin | Profile Page / Drawer |
| **UserController** | `PUT` | `/api/users/me` | JSON (`UserUpdateRequest`) | `UserResponse` | Customer/Admin | Update Profile Form |
| **UserController** | `PUT` | `/api/users/me/password` | JSON (`ChangePasswordRequest`) | `Void (204 No Content)` | Customer/Admin | Change Password Modal |
| **UserController** | `GET` | `/api/users` | None | `List<UserResponse>` | Admin | Admin User Management Grid |
| **UserController** | `GET` | `/api/users/{id}` | Path variable `id` | `UserResponse` | Admin | Admin User Details Modal |
