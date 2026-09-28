/**
 * cartApi.js — maps to CartController (/api/cart)
 *
 *   GET    /api/cart                          getMyCart()
 *   POST   /api/cart/items                    addItem(productId, quantity)
 *   PUT    /api/cart/items/{cartItemId}?quantity=  updateItemQuantity(cartItemId, quantity)
 *   DELETE /api/cart/items/{cartItemId}       removeItem(cartItemId)
 *   DELETE /api/cart                          clearMyCart()
 *
 * All cart endpoints require the shopper to be logged in — the JWT is
 * attached automatically by apiClient when present.
 */
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient.js';

export const getMyCart = () => apiGet('/cart');

/** @param {number} productId @param {number} [quantity=1] */
export const addItem = (productId, quantity = 1) => apiPost('/cart/items', { productId, quantity });

export const updateItemQuantity = (cartItemId, quantity) =>
  apiPut(`/cart/items/${cartItemId}?quantity=${encodeURIComponent(quantity)}`);

export const removeItem = (cartItemId) => apiDelete(`/cart/items/${cartItemId}`);

export const clearMyCart = () => apiDelete('/cart');