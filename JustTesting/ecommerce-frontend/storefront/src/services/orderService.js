import api from "./api";

// OrderController contract (all authenticated):
//   POST /orders {shippingAddress}              → OrderResponse (from cart)
//   GET  /orders/me                             → OrderResponse[]
//   GET  /orders/{id}                           → OrderResponse
//   PUT  /orders/{id}/cancel                    → 204 (restores stock)
//   PUT  /orders/{id}/status?status=            → OrderResponse (ADMIN)
export const placeOrder = (shippingAddress) => api.post("/orders", { shippingAddress });

export const getMyOrders = () => api.get("/orders/me");

export const getOrderById = (id) => api.get(`/orders/${id}`);

export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`);

export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, null, { params: { status } });