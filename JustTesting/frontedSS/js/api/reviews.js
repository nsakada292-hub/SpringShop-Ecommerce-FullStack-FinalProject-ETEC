import { ApiClient } from './client.js';

export const reviewsApi = {
  getByProduct(productId) {
    return ApiClient.get(`/products/${productId}/reviews`);
  },
  create(productId, reviewData) {
    return ApiClient.post(`/products/${productId}/reviews`, reviewData);
  }
};