/**
 * orderApi.js — maps to OrderController (/api/orders)
 *
 *   POST /api/orders                          placeOrder(orderRequest)
 *   GET  /api/orders/{id}                     getById(id)
 *   GET  /api/orders/me                       getMyOrders()
 *   GET  /api/orders/all                      getAll()            (admin)
 *   PUT  /api/orders/{id}/status?status=      updateStatus(id, status)  (admin)
 *   PUT  /api/orders/{id}/cancel              cancelOrder(id)
 */
import { apiGet, apiPost, apiPut, request } from './apiClient.js';

/** @param {{receiverName:string, receiverEmail:string, shippingAddress:string, items:Array<{productId:number, quantity:number}>}} orderRequest */
export const placeOrder = (orderRequest) => apiPost('/orders', orderRequest);

export const getById = (id) => apiGet(`/orders/${id}`);
export const getMyOrders = () => apiGet('/orders/me');
export const getAll = () => apiGet('/orders/all');

export const updateStatus = (id, status) => apiPut(`/orders/${id}/status?status=${encodeURIComponent(status)}`);

// PUT /api/orders/{id}/cancel responds 204 No Content, so we skip JSON parsing.
export const cancelOrder = (id) => request(`/orders/${id}/cancel`, { method: 'PUT', parseJson: false });