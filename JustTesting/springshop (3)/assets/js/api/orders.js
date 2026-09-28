/**
 * Orders API Service
 * Maps to /api/orders endpoints
 * Supports live Spring Boot backend and local persistent fallback
 */
const OrdersAPI = {
  STORAGE_KEY: 'springshop_orders_db',

  getInitialOrders() {
    return [
      {
        id: 1001,
        user: { id: 2, name: 'Eleanor Vance', email: 'eleanor.vance@example.com' },
        items: [
          { id: 1, productId: 1, productName: 'Classic Linen Camp Shirt', productPrice: 68.00, quantity: 2, subtotal: 136.00 },
          { id: 2, productId: 4, productName: 'Heavyweight Organic Cotton Hoodie', productPrice: 85.00, quantity: 1, subtotal: 85.00 }
        ],
        totalAmount: 221.00,
        status: 'PROCESSING',
        shippingAddress: '742 Evergreen Terrace, Springfield, OR',
        paymentMethod: 'Credit Card (Stripe)',
        createdAt: '2026-02-20T10:14:00.000Z'
      },
      {
        id: 1002,
        user: { id: 3, name: 'Marcus Thorne', email: 'marcus.thorne@example.com' },
        items: [
          { id: 3, productId: 3, productName: 'Hand-Welted Chelsea Boots', productPrice: 185.00, quantity: 1, subtotal: 185.00 },
          { id: 4, productId: 5, productName: 'Heritage Waxed Canvas Duffel', productPrice: 145.00, quantity: 1, subtotal: 145.00 }
        ],
        totalAmount: 330.00,
        status: 'SHIPPED',
        shippingAddress: '1048 Ocean Avenue, Santa Monica, CA',
        paymentMethod: 'PayPal Express',
        createdAt: '2026-02-22T14:35:00.000Z'
      },
      {
        id: 1003,
        user: { id: 4, name: 'Clara Oswald', email: 'clara.oswald@example.com' },
        items: [
          { id: 5, productId: 2, productName: 'Artisanal Knit Wool Cardigan', productPrice: 135.00, quantity: 1, subtotal: 135.00 }
        ],
        totalAmount: 135.00,
        status: 'DELIVERED',
        shippingAddress: '42 Baker Street, London, UK',
        paymentMethod: 'Apple Pay',
        createdAt: '2026-02-18T09:00:00.000Z'
      },
      {
        id: 1004,
        user: { id: 5, name: 'Liam Chen', email: 'liam.chen@example.com' },
        items: [
          { id: 6, productId: 6, productName: 'Structured Wool Overcoat', productPrice: 240.00, quantity: 1, subtotal: 240.00 }
        ],
        totalAmount: 240.00,
        status: 'PENDING',
        shippingAddress: '88 King Street East, Toronto, ON',
        paymentMethod: 'Credit Card',
        createdAt: '2026-02-24T16:20:00.000Z'
      }
    ];
  },

  getLocalOrders() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('[OrdersAPI] Error reading local orders:', e);
    }
    const initial = this.getInitialOrders();
    this.saveLocalOrders(initial);
    return initial;
  },

  saveLocalOrders(list) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('[OrdersAPI] Error saving local orders:', e);
    }
  },

  /**
   * Place an order from active cart
   * @param {Object} data { shippingAddress: string }
   */
  async placeOrder(data) {
    try {
      const res = await ApiClient.post('/api/orders', data);
      if (res) return res;
    } catch (err) {
      console.warn('[OrdersAPI] Live backend unavailable, placing order in local storage:', err);
    }

    const orders = this.getLocalOrders();
    const nextId = orders.length > 0 ? Math.max(...orders.map(o => Number(o.id) || 0)) + 1 : 1001;
    const currentUser = (window.AuthGuard && AuthGuard.getUser()) || { id: 1, name: 'Customer', email: 'customer@example.com' };

    let cartItems = [];
    let total = 0;
    if (window.CartAPI && typeof CartAPI.getLocalCart === 'function') {
      const cart = CartAPI.getLocalCart();
      cartItems = (cart.items || []).map((item, idx) => ({
        id: idx + 1,
        productId: item.productId,
        productName: item.productName || 'Product',
        productPrice: item.productPrice || 0,
        quantity: item.quantity || 1,
        subtotal: (item.productPrice || 0) * (item.quantity || 1)
      }));
      total = cart.totalAmount || cartItems.reduce((s, i) => s + i.subtotal, 0);
    }

    const newOrder = {
      id: nextId,
      user: currentUser,
      items: cartItems.length > 0 ? cartItems : [{ id: 1, productId: 1, productName: 'Store Item', productPrice: 85, quantity: 1, subtotal: 85 }],
      totalAmount: total || 85.00,
      status: 'PENDING',
      shippingAddress: data.shippingAddress || 'Standard Delivery Address',
      paymentMethod: 'Credit Card',
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    this.saveLocalOrders(orders);
    
    if (window.CartAPI && typeof CartAPI.clearMyCart === 'function') {
      await CartAPI.clearMyCart().catch(() => {});
    }

    return newOrder;
  },

  /**
   * Get single order by ID
   * @param {number|string} id
   */
  async getById(id) {
    const orderId = Number(id);
    try {
      const data = await ApiClient.get(`/api/orders/${orderId}`);
      if (data) return data;
    } catch (err) {}
    return this.getLocalOrders().find(o => o.id === orderId) || null;
  },

  /**
   * Get orders for the authenticated user
   */
  async getMyOrders() {
    try {
      const data = await ApiClient.get('/api/orders/me');
      if (Array.isArray(data)) return data;
    } catch (err) {}
    const currentUser = window.AuthGuard ? AuthGuard.getUser() : null;
    const orders = this.getLocalOrders();
    if (currentUser && currentUser.email) {
      return orders.filter(o => o.user && o.user.email === currentUser.email);
    }
    return orders;
  },

  /**
   * Cancel an order
   * @param {number|string} id
   */
  async cancelOrder(id) {
    const orderId = Number(id);
    try {
      const res = await ApiClient.put(`/api/orders/${orderId}/cancel`, null);
      if (res) return res;
    } catch (err) {}
    return this.updateStatus(orderId, 'CANCELLED');
  },

  /**
   * Get all orders (Admin only)
   */
  async getAll() {
    try {
      const data = await ApiClient.get('/api/orders/all');
      if (Array.isArray(data) && data.length > 0) {
        this.saveLocalOrders(data);
        return data;
      }
    } catch (err) {}
    return this.getLocalOrders();
  },

  /**
   * Update order status (Admin only)
   * @param {number|string} id
   * @param {string} status
   */
  async updateStatus(id, status) {
    const orderId = Number(id);
    let updated = null;
    try {
      updated = await ApiClient.put(`/api/orders/${orderId}/status?status=${encodeURIComponent(status)}`, null);
    } catch (err) {
      console.warn('[OrdersAPI] Backend offline, updating status locally:', err);
    }

    const orders = this.getLocalOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      orders[index].updatedAt = new Date().toISOString();
      this.saveLocalOrders(orders);
      return updated || orders[index];
    }
    return updated || { id: orderId, status };
  }
};

window.OrdersAPI = OrdersAPI;