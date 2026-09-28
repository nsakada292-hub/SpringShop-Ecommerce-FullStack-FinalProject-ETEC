/**
 * reviewApi.js — maps to ReviewController (/api/reviews)
 *
 *   POST   /api/reviews                              create(reviewRequest)
 *   PUT    /api/reviews/{id}                          update(id, reviewRequest)
 *   DELETE /api/reviews/{id}                          remove(id)
 *   GET    /api/reviews/product/{productId}           getByProduct(productId)
 *   GET    /api/reviews/product/{productId}/average   getAverageRating(productId)
 */
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient.js';

/** @param {{productId:number, rating:number, comment:string}} reviewRequest */
export const create = (reviewRequest) => apiPost('/reviews', reviewRequest);

export const update = (id, reviewRequest) => apiPut(`/reviews/${id}`, reviewRequest);

export const remove = (id) => apiDelete(`/reviews/${id}`);

export const getByProduct = (productId) => apiGet(`/reviews/product/${productId}`);

export const getAverageRating = (productId) => apiGet(`/reviews/product/${productId}/average`);