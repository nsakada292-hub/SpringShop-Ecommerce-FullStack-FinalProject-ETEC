/**
 * Cart API Service
 * Maps to com.example.SpringShop_Backend.controller.CartController
 */
const CartAPI = {
  /**
   * Get authenticated user's cart
   * GET /api/cart
   * @returns {Promise<{ id: number, userId: number, items: Array<{ id: number, productId: number, productName: string, productPrice: number, quantity: number, subtotal: number }>, totalAmount: number }>}
   */
  async getMyCart() {
    return await ApiClient.get('/api/cart');
  },

  /**
   * Add item to cart
   * POST /api/cart/items
   * @param {{ productId: number, quantity: number }} itemRequest 
   */
  async addItem(itemRequest) {
    return await ApiClient.post('/api/cart/items', itemRequest);
  },

  /**
   * Update quantity of cart item
   * PUT /api/cart/items/{cartItemId}?quantity=...
   */
  async updateItemQuantity(cartItemId, quantity) {
    return await ApiClient.put(`/api/cart/items/${cartItemId}?quantity=${encodeURIComponent(quantity)}`);
  },

  /**
   * Remove item from cart
   * DELETE /api/cart/items/{cartItemId}
   */
  async removeItem(cartItemId) {
    return await ApiClient.delete(`/api/cart/items/${cartItemId}`);
  },

  /**
   * Clear all items from cart
   * DELETE /api/cart
   */
  async clearMyCart() {
    return await ApiClient.delete('/api/cart');
  }
};

window.CartAPI = CartAPI;
