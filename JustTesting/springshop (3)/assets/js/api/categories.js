/**
 * Categories API Service
 * Maps to com.example.SpringShop_Backend.controller.CategoryController
 * Supports both live Spring Boot backend and instant local persistent fallback
 */
const CategoriesAPI = {
  STORAGE_KEY: 'springshop_categories_db',

  getInitialCategories() {
    return [
      {
        id: 1,
        categoryName: "Men's Apparel",
        parentCategoryId: null,
        description: "Sustainable shirts, jackets, chinos, and tailored essentials.",
        createdAt: "2026-01-10T08:00:00.000Z"
      },
      {
        id: 2,
        categoryName: "Women's Collection",
        parentCategoryId: null,
        description: "Eco-friendly dresses, knitwear, blouses, and artisan skirts.",
        createdAt: "2026-01-12T09:30:00.000Z"
      },
      {
        id: 3,
        categoryName: "Footwear & Boots",
        parentCategoryId: null,
        description: "Handcrafted sustainable leather boots, loafers, and vegan sneakers.",
        createdAt: "2026-01-15T11:00:00.000Z"
      },
      {
        id: 4,
        categoryName: "Accessories & Bags",
        parentCategoryId: null,
        description: "Recycled canvas totes, full-grain belts, caps, and wallets.",
        createdAt: "2026-01-18T14:20:00.000Z"
      },
      {
        id: 5,
        categoryName: "Outerwear & Coats",
        parentCategoryId: 1,
        description: "Insulated parkas, heavy denim overshirts, and recycled wool coats.",
        createdAt: "2026-01-20T16:45:00.000Z"
      },
      {
        id: 6,
        categoryName: "Organic Essentials",
        parentCategoryId: 2,
        description: "100% GOTS-certified organic cotton tees, sweaters, and loungewear.",
        createdAt: "2026-01-22T10:15:00.000Z"
      }
    ];
  },

  getLocalCategories() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('[CategoriesAPI] Error reading local categories:', e);
    }
    const initial = this.getInitialCategories();
    this.saveLocalCategories(initial);
    return initial;
  },

  saveLocalCategories(list) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('[CategoriesAPI] Error saving local categories:', e);
    }
  },

  async getAll() {
    try {
      const data = await ApiClient.get('/api/categories');
      if (Array.isArray(data) && data.length > 0) {
        this.saveLocalCategories(data);
        return data;
      }
    } catch (err) {
      // Backend not available; fallback to local storage
    }
    return this.getLocalCategories();
  },

  async getTopLevel() {
    try {
      const data = await ApiClient.get('/api/categories/top-level');
      if (Array.isArray(data)) return data;
    } catch (err) {}
    return this.getLocalCategories().filter(c => !c.parentCategoryId);
  },

  async getSubCategories(id) {
    const parentId = Number(id);
    try {
      const data = await ApiClient.get(`/api/categories/${parentId}/subcategories`);
      if (Array.isArray(data)) return data;
    } catch (err) {}
    return this.getLocalCategories().filter(c => c.parentCategoryId === parentId);
  },

  async getById(id) {
    const catId = Number(id);
    try {
      const data = await ApiClient.get(`/api/categories/${catId}`);
      if (data) return data;
    } catch (err) {}
    return this.getLocalCategories().find(c => c.id === catId) || null;
  },

  async create(data) {
    let createdCategory = null;
    try {
      createdCategory = await ApiClient.post('/api/categories', data);
    } catch (err) {
      console.warn('[CategoriesAPI] Backend offline, saving category locally:', err);
    }

    const categories = this.getLocalCategories();
    const nextId = categories.length > 0 ? Math.max(...categories.map(c => Number(c.id) || 0)) + 1 : 1;
    
    const newCategory = createdCategory || {
      id: nextId,
      categoryName: data.categoryName,
      parentCategoryId: data.parentCategoryId ? Number(data.parentCategoryId) : null,
      description: data.description || '',
      createdAt: new Date().toISOString()
    };

    const existingIdx = categories.findIndex(c => c.id === newCategory.id);
    if (existingIdx >= 0) {
      categories[existingIdx] = newCategory;
    } else {
      categories.push(newCategory);
    }

    this.saveLocalCategories(categories);
    return newCategory;
  },

  async update(id, data) {
    const catId = Number(id);
    let updatedCategory = null;

    try {
      updatedCategory = await ApiClient.put(`/api/categories/${catId}`, data);
    } catch (err) {
      console.warn('[CategoriesAPI] Backend offline, updating category locally:', err);
    }

    const categories = this.getLocalCategories();
    const index = categories.findIndex(c => c.id === catId);
    
    if (index !== -1) {
      categories[index] = {
        ...categories[index],
        categoryName: data.categoryName !== undefined ? data.categoryName : categories[index].categoryName,
        parentCategoryId: data.parentCategoryId !== undefined ? (data.parentCategoryId ? Number(data.parentCategoryId) : null) : categories[index].parentCategoryId,
        description: data.description !== undefined ? data.description : categories[index].description,
        updatedAt: new Date().toISOString()
      };
      this.saveLocalCategories(categories);
      return updatedCategory || categories[index];
    }

    return updatedCategory || { id: catId, ...data };
  },

  async delete(id) {
    const catId = Number(id);
    try {
      await ApiClient.delete(`/api/categories/${catId}`);
    } catch (err) {
      console.warn('[CategoriesAPI] Backend offline, deleting category locally:', err);
    }

    const categories = this.getLocalCategories().filter(c => c.id !== catId);
    this.saveLocalCategories(categories);
    return true;
  }
};

window.CategoriesAPI = CategoriesAPI;