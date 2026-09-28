/**
 * Products API Service
 * Maps to com.example.SpringShop_Backend.controller.ProductController
 */
const ProductsAPI = {
  /**
   * Get all products
   * GET /api/products
   */
  async getAll() {
    return await ApiClient.get('/api/products');
  },

  /**
   * Get product by ID
   * GET /api/products/{id}
   */
  async getById(id) {
    return await ApiClient.get(`/api/products/${id}`);
  },

  /**
   * Get products by Category ID
   * GET /api/products/category/{categoryId}
   */
  async getByCategory(categoryId) {
    return await ApiClient.get(`/api/products/category/${categoryId}`);
  },

  /**
   * Search products by keyword
   * GET /api/products/search?keyword=...
   */
  async search(keyword) {
    return await ApiClient.get(`/api/products/search?keyword=${encodeURIComponent(keyword)}`);
  },

  /**
   * Create new product (Multipart/form-data)
   * POST /api/products
   * @param {Object} productRequest 
   * @param {File} file 
   */
  async create(productRequest, file) {
    let formData;
    if (productRequest instanceof FormData) {
      formData = productRequest;
    } else {
      formData = new FormData();
      formData.append('productName', productRequest.productName || '');
      formData.append('description', productRequest.description || '');
      formData.append('price', productRequest.price || '0');
      formData.append('stockQuantity', productRequest.stockQuantity || '0');
      formData.append('categoryId', productRequest.categoryId || '');
      if (productRequest.size) formData.append('size', productRequest.size);
      if (productRequest.color) formData.append('color', productRequest.color);
      if (productRequest.material) formData.append('material', productRequest.material);
      if (file) formData.append('file', file);
    }

    return await ApiClient.post('/api/products', formData);
  },

  /**
   * Update product (Multipart/form-data)
   * PUT /api/products/{id}
   */
  async update(id, productRequest, file = null) {
    let formData;
    if (productRequest instanceof FormData) {
      formData = productRequest;
    } else {
      formData = new FormData();
      formData.append('productName', productRequest.productName || '');
      formData.append('description', productRequest.description || '');
      formData.append('price', productRequest.price || '0');
      formData.append('stockQuantity', productRequest.stockQuantity || '0');
      formData.append('categoryId', productRequest.categoryId || '');
      if (productRequest.size) formData.append('size', productRequest.size);
      if (productRequest.color) formData.append('color', productRequest.color);
      if (productRequest.material) formData.append('material', productRequest.material);
      if (file) formData.append('file', file);
    }

    return await ApiClient.put(`/api/products/${id}`, formData);
  },

  /**
   * Delete product
   * DELETE /api/products/{id}
   */
  async delete(id) {
    return await ApiClient.delete(`/api/products/${id}`);
  }
};

window.ProductsAPI = ProductsAPI;
