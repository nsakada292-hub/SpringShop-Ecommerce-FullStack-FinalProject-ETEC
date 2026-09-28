/**
 * Reviews API Service
 * Maps to /api/reviews endpoints
 */
const ReviewsAPI = {
  /**
   * Get reviews for a specific product
   * @param {number|string} productId
   */
  async getByProduct(productId) {
    return await ApiClient.get(`/api/reviews/product/${productId}`, { timeout: 8000 });
  },

  /**
   * Get average rating (Double) for a specific product
   * @param {number|string} productId
   */
  async getAverageRating(productId) {
    return await ApiClient.get(`/api/reviews/product/${productId}/average`, { timeout: 8000 });
  },

  /**
   * Create a new review for a product
   * @param {Object} data { productId: number, rating: number (1-5), comment: string }
   */
  async create(data) {
    return await ApiClient.post('/api/reviews', data);
  },

  /**
   * Update an existing review
   * @param {number|string} id
   * @param {Object} data { productId: number, rating: number (1-5), comment: string }
   */
  async update(id, data) {
    return await ApiClient.put(`/api/reviews/${id}`, data);
  },

  /**
   * Delete a review
   * @param {number|string} id
   */
  async delete(id) {
    return await ApiClient.delete(`/api/reviews/${id}`);
  }
};

window.ReviewsAPI = ReviewsAPI;
