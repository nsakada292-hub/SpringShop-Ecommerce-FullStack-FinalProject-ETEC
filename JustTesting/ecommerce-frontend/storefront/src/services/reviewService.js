import api from "./api";

// ReviewController contract:
//   GET  /reviews/product/{productId}           (authenticated) → ReviewResponse[]
//   GET  /reviews/product/{productId}/average   (authenticated) → number
//   POST /reviews {productId, rating, comment}  (authenticated)
//   PUT  /reviews/{id}                          (author only)
//   DELETE /reviews/{id}                        (author only)
export const getReviewsForProduct = (productId) =>
  api.get(`/reviews/product/${productId}`);

export const getProductAverageRating = (productId) =>
  api.get(`/reviews/product/${productId}/average`);

export const createReview = (data) => api.post("/reviews", data);

export const updateReview = (reviewId, data) => api.put(`/reviews/${reviewId}`, data);

export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);