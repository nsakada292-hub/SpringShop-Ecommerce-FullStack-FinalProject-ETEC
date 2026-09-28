import api from "./api";

// Cart endpoints match the Spring Boot CartController:
//   GET  /cart                   → CartResponse
//   POST /cart/items {productId, quantity} → CartResponse (qty adds to existing)
//   PUT  /cart/items/{id}?quantity=N → CartResponse (qty<=0 deletes the row)
//   DELETE /cart/items/{id}      → CartResponse
//   DELETE /cart                 → 204

export const getCart = () => api.get("/cart");

export const addToCart = (data) =>
  api.post("/cart/items", {
    productId: data.productId,
    quantity: data.quantity || 1,
  });

export const updateCartItem = (cartItemId, quantity) =>
  api.put(`/cart/items/${cartItemId}`, null, { params: { quantity } });

export const removeCartItem = (cartItemId) => api.delete(`/cart/items/${cartItemId}`);

export const clearCart = () => api.delete("/cart");