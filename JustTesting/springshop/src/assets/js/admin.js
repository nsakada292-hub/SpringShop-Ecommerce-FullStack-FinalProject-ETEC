/**
 * SpringShop - Administrator Dashboard Controller
 * Full management system for Products, Categories, Orders, Customers, Reviews & Settings
 */
import { CONFIG } from './config.js';
import { storage } from './utils/storage.js';
import { formatter } from './utils/formatter.js';
import { authGuard } from './utils/auth-guard.js';
import { errorHandler } from './utils/error-handler.js';
import { debounce } from './utils/debounce.js';

import { authApi } from './api/auth.js';
import { productsApi } from './api/products.js';
import { categoriesApi } from './api/categories.js';
import { ordersApi } from './api/orders.js';
import { reviewsApi } from './api/reviews.js';
import { usersApi } from './api/users.js';

import { toast } from './components/toast.js';
import { loader } from './components/loader.js';
import { emptyState } from './components/empty-state.js';
import { confirmDialog } from './components/confirmation.js';
import { Modal } from './components/modal.js';
import { Drawer } from './components/drawer.js';

class AdminApp {
  constructor() {
    this.currentTab = 'dashboard';
    this.products = [];
    this.categories = [];
    this.orders = [];
    this.users = [];
    this.theme = storage.getTheme();

    this.productModal = null;
    this.categoryModal = null;
    this.orderDetailModal = null;
    this.userDetailModal = null;
    this.editingProductId = null;
    this.editingCategoryId = null;
  }

  async init() {
    this.applyTheme(this.theme);
    this.checkAdminAccess();
    this.initModals();
    this.bindNavigation();
    this.bindEvents();

    await this.loadAllAdminData();
  }

  applyTheme(theme) {
    this.theme = theme;
    storage.setTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleTheme() {
    const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
    toast.info(`Switched to ${nextTheme} mode`);
  }

  checkAdminAccess() {
    const user = storage.getUser();
    const token = storage.getToken();

    if (!token || !user) {
      this.showAccessDenied('Authentication Required', 'You must be signed in to access the Administrator Dashboard.');
      return false;
    }

    if (user.role !== 'ADMIN' && user.role !== 'ROLE_ADMIN') {
      this.showAccessDenied('Access Denied', 'Your account does not have administrator permissions.');
      return false;
    }

    const adminNameEl = document.getElementById('admin-profile-name');
    const adminEmailEl = document.getElementById('admin-profile-email');
    if (adminNameEl) adminNameEl.textContent = user.name || 'Administrator';
    if (adminEmailEl) adminEmailEl.textContent = user.email || 'admin@springshop.com';

    return true;
  }

  showAccessDenied(title, message) {
    const content = document.getElementById('admin-main-content');
    if (content) {
      content.innerHTML = `
        <div class="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
          <div class="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">${title}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">${message}</p>
          <div class="flex items-center gap-3">
            <a href="index.html" class="px-5 py-2.5 bg-spring-dark-green text-white text-sm font-medium rounded-xl shadow-xs hover:bg-emerald-800 transition">
              Return to Storefront
            </a>
          </div>
        </div>
      `;
    }
  }

  initModals() {
    this.productModal = new Modal('admin-product-modal');
    this.categoryModal = new Modal('admin-category-modal');
    this.orderDetailModal = new Modal('admin-order-detail-modal');
    this.userDetailModal = new Modal('admin-user-detail-modal');
  }

  bindNavigation() {
    const navLinks = document.querySelectorAll('[data-admin-tab]');
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.dataset.adminTab;
        this.switchTab(tab);

        // Mobile drawer close if open
        const sidebarDrawer = document.getElementById('admin-sidebar-drawer');
        if (sidebarDrawer && !sidebarDrawer.classList.contains('hidden')) {
          sidebarDrawer.classList.add('hidden');
        }
      });
    });

    // Mobile sidebar toggle
    const toggleSidebarBtn = document.getElementById('admin-toggle-sidebar');
    const sidebarDrawer = document.getElementById('admin-sidebar-drawer');
    if (toggleSidebarBtn && sidebarDrawer) {
      toggleSidebarBtn.addEventListener('click', () => {
        sidebarDrawer.classList.toggle('hidden');
      });
    }

    const closeSidebarBtn = document.getElementById('admin-close-sidebar');
    if (closeSidebarBtn && sidebarDrawer) {
      closeSidebarBtn.addEventListener('click', () => {
        sidebarDrawer.classList.add('hidden');
      });
    }
  }

  switchTab(tab) {
    this.currentTab = tab;

    // Update active link styles
    document.querySelectorAll('[data-admin-tab]').forEach((el) => {
      if (el.dataset.adminTab === tab) {
        el.classList.add('bg-spring-light-green/40', 'dark:bg-slate-800', 'text-spring-dark-green', 'font-semibold');
        el.classList.remove('text-slate-600', 'dark:text-slate-400');
      } else {
        el.classList.remove('bg-spring-light-green/40', 'dark:bg-slate-800', 'text-spring-dark-green', 'font-semibold');
        el.classList.add('text-slate-600', 'dark:text-slate-400');
      }
    });

    // Show/hide tab sections
    document.querySelectorAll('[data-tab-section]').forEach((sec) => {
      if (sec.dataset.tabSection === tab) {
        sec.classList.remove('hidden');
      } else {
        sec.classList.add('hidden');
      }
    });

    // Page title update
    const titleMap = {
      dashboard: 'Overview & Analytics',
      products: 'Products Management',
      categories: 'Categories & Subcategories',
      orders: 'Customer Orders',
      customers: 'Customers & Users',
      reviews: 'Customer Reviews',
      settings: 'Store & API Configuration',
    };
    const titleEl = document.getElementById('admin-page-title');
    if (titleEl) titleEl.textContent = titleMap[tab] || 'Admin Dashboard';
  }

  bindEvents() {
    // Theme toggle
    document.querySelectorAll('[data-action="admin-toggle-theme"]').forEach((btn) => {
      btn.addEventListener('click', () => this.toggleTheme());
    });

    // Admin Logout
    document.querySelectorAll('[data-action="admin-logout"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        storage.clearAuth();
        toast.info('Logged out from Admin Dashboard');
        setTimeout(() => (window.location.href = 'index.html'), 500);
      });
    });

    // Product search in admin
    const prodSearch = document.getElementById('admin-product-search');
    if (prodSearch) {
      prodSearch.addEventListener(
        'input',
        debounce((e) => {
          const keyword = e.target.value.toLowerCase().trim();
          this.renderProductsTable(keyword);
        }, 300)
      );
    }

    // Category filter in admin products
    const prodCatFilter = document.getElementById('admin-product-category-filter');
    if (prodCatFilter) {
      prodCatFilter.addEventListener('change', (e) => {
        const catId = e.target.value;
        this.renderProductsTable('', catId);
      });
    }

    // Add Product button
    const addProdBtn = document.getElementById('btn-add-product');
    if (addProdBtn) {
      addProdBtn.addEventListener('click', () => this.openAddProductModal());
    }

    // Product Form Submit (Multipart form)
    const productForm = document.getElementById('admin-product-form');
    if (productForm) {
      productForm.addEventListener('submit', (e) => this.handleProductFormSubmit(e));
    }

    // Add Category button
    const addCatBtn = document.getElementById('btn-add-category');
    if (addCatBtn) {
      addCatBtn.addEventListener('click', () => this.openAddCategoryModal());
    }

    // Category Form Submit
    const categoryForm = document.getElementById('admin-category-form');
    if (categoryForm) {
      categoryForm.addEventListener('submit', (e) => this.handleCategoryFormSubmit(e));
    }

    // Settings API Base URL form
    const settingsApiForm = document.getElementById('admin-settings-api-form');
    if (settingsApiForm) {
      const urlInput = document.getElementById('admin-settings-api-url');
      if (urlInput) urlInput.value = CONFIG.API_BASE_URL;

      settingsApiForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newUrl = urlInput.value.trim();
        CONFIG.API_BASE_URL = newUrl;
        toast.success(`Spring Boot API Base URL set to: ${CONFIG.API_BASE_URL}`);
        this.loadAllAdminData();
      });
    }

    const resetSettingsApiBtn = document.getElementById('btn-admin-reset-api');
    if (resetSettingsApiBtn) {
      resetSettingsApiBtn.addEventListener('click', () => {
        CONFIG.API_BASE_URL = '';
        const urlInput = document.getElementById('admin-settings-api-url');
        if (urlInput) urlInput.value = CONFIG.API_BASE_URL;
        toast.info('Reset API URL to default.');
        this.loadAllAdminData();
      });
    }
  }

  async loadAllAdminData() {
    await Promise.allSettled([
      this.loadProducts(),
      this.loadCategories(),
      this.loadOrders(),
      this.loadUsers(),
    ]);

    this.updateDashboardKPIs();
  }

  // =================== PRODUCTS =================== //

  async loadProducts() {
    const tableBody = document.getElementById('admin-products-table-body');
    if (tableBody) tableBody.innerHTML = loader.renderTableSkeletons(5, 6);

    try {
      this.products = (await productsApi.getAll()) || [];
      this.renderProductsTable();
      this.populateCategorySelects();
    } catch (err) {
      if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-rose-500">${errorHandler.parse(err)}</td></tr>`;
      }
    }
  }

  renderProductsTable(searchKeyword = '', categoryIdFilter = '') {
    const tableBody = document.getElementById('admin-products-table-body');
    if (!tableBody) return;

    let list = [...this.products];
    if (searchKeyword) {
      list = list.filter((p) => (p.productName || '').toLowerCase().includes(searchKeyword));
    }
    if (categoryIdFilter) {
      list = list.filter((p) => p.category?.id == categoryIdFilter);
    }

    if (list.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="py-12 text-center text-slate-400">
            No products found matching the criteria.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = list
      .map((p) => {
        const stock = p.stockQuantity !== undefined ? p.stockQuantity : 0;
        const stockColor = stock <= 0 ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/50' : stock <= 5 ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/50' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50';

        return `
        <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <img 
                src="${p.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=150&q=80'}" 
                alt="${p.productName}" 
                class="w-11 h-14 object-cover rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=150&q=80';"
              />
              <div class="min-w-0">
                <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[180px]">${p.productName}</h4>
                <span class="text-xs text-slate-400">ID: #${p.id}</span>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-300">
            ${p.category?.categoryName || 'Unassigned'}
          </td>
          <td class="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">
            ${formatter.currency(p.price)}
          </td>
          <td class="px-6 py-4">
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${stockColor}">
              ${stock} in stock
            </span>
          </td>
          <td class="px-6 py-4 text-xs text-slate-500">
            ${p.size || 'M'} / ${p.color || 'Default'}
          </td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <button 
                type="button" 
                class="p-1.5 text-slate-500 hover:text-spring-dark-green hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                title="Edit Product"
                onclick="window.adminApp.openEditProductModal(${p.id})"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>
              <button 
                type="button" 
                class="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                title="Delete Product"
                onclick="window.adminApp.handleDeleteProduct(${p.id})"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join('');
  }

  populateCategorySelects() {
    const filterSelect = document.getElementById('admin-product-category-filter');
    const formCatSelect = document.getElementById('prod-form-category');

    const optionsHtml = this.categories
      .map((c) => `<option value="${c.id}">${c.categoryName}</option>`)
      .join('');

    if (filterSelect) {
      filterSelect.innerHTML = '<option value="">All Categories</option>' + optionsHtml;
    }
    if (formCatSelect) {
      formCatSelect.innerHTML = '<option value="" disabled selected>Select Category</option>' + optionsHtml;
    }

    const parentCatSelect = document.getElementById('cat-form-parent');
    if (parentCatSelect) {
      parentCatSelect.innerHTML = '<option value="">None (Top-Level Category)</option>' + optionsHtml;
    }
  }

  openAddProductModal() {
    this.editingProductId = null;
    document.getElementById('admin-product-modal-title').textContent = 'Add New Product';
    document.getElementById('admin-product-form').reset();
    document.getElementById('prod-form-image-preview')?.classList.add('hidden');
    this.productModal.open();
  }

  openEditProductModal(productId) {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return;

    this.editingProductId = productId;
    document.getElementById('admin-product-modal-title').textContent = `Edit Product #${productId}`;

    document.getElementById('prod-form-name').value = product.productName || '';
    document.getElementById('prod-form-price').value = product.price || '';
    document.getElementById('prod-form-stock').value = product.stockQuantity || '';
    document.getElementById('prod-form-category').value = product.category?.id || '';
    document.getElementById('prod-form-size').value = product.size || '';
    document.getElementById('prod-form-color').value = product.color || '';
    document.getElementById('prod-form-material').value = product.material || '';
    document.getElementById('prod-form-desc').value = product.description || '';

    const preview = document.getElementById('prod-form-image-preview');
    if (preview && product.image) {
      preview.src = product.image;
      preview.classList.remove('hidden');
    }

    this.productModal.open();
  }

  async handleProductFormSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-save-product');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `${loader.spinner('w-4 h-4')} <span>Saving...</span>`;
    }

    const name = document.getElementById('prod-form-name')?.value.trim();
    const price = document.getElementById('prod-form-price')?.value;
    const stock = document.getElementById('prod-form-stock')?.value;
    const categoryId = document.getElementById('prod-form-category')?.value;
    const size = document.getElementById('prod-form-size')?.value.trim();
    const color = document.getElementById('prod-form-color')?.value.trim();
    const material = document.getElementById('prod-form-material')?.value.trim();
    const description = document.getElementById('prod-form-desc')?.value.trim();
    const fileInput = document.getElementById('prod-form-file');

    const formData = new FormData();
    formData.append('productName', name);
    formData.append('price', price);
    formData.append('stockQuantity', stock);
    formData.append('categoryId', categoryId);
    if (size) formData.append('size', size);
    if (color) formData.append('color', color);
    if (material) formData.append('material', material);
    if (description) formData.append('description', description);

    if (fileInput && fileInput.files[0]) {
      formData.append('file', fileInput.files[0]);
    }

    try {
      if (this.editingProductId) {
        await productsApi.update(this.editingProductId, formData);
        toast.success('Product updated successfully');
      } else {
        if (!fileInput || !fileInput.files[0]) {
          // If no file uploaded for create, create a placeholder blob
          const blob = new Blob([''], { type: 'image/png' });
          formData.append('file', blob, 'product.png');
        }
        await productsApi.create(formData);
        toast.success('Product created successfully');
      }

      this.productModal.close();
      await this.loadProducts();
      this.updateDashboardKPIs();
    } catch (err) {
      toast.error(errorHandler.parse(err), 'Product Save Failed');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>Save Product</span>';
      }
    }
  }

  async handleDeleteProduct(productId) {
    const confirmed = await confirmDialog.show({
      title: 'Delete Product',
      message: `Are you sure you want to permanently delete product #${productId}?`,
      confirmText: 'Delete',
      isDanger: true,
    });

    if (confirmed) {
      try {
        await productsApi.delete(productId);
        toast.success('Product deleted');
        await this.loadProducts();
        this.updateDashboardKPIs();
      } catch (err) {
        toast.error(errorHandler.parse(err));
      }
    }
  }

  // =================== CATEGORIES =================== //

  async loadCategories() {
    const tableBody = document.getElementById('admin-categories-table-body');
    if (tableBody) tableBody.innerHTML = loader.renderTableSkeletons(4, 4);

    try {
      this.categories = (await categoriesApi.getAll()) || [];
      this.renderCategoriesTable();
      this.populateCategorySelects();
    } catch (err) {
      if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-rose-500">${errorHandler.parse(err)}</td></tr>`;
      }
    }
  }

  renderCategoriesTable() {
    const tableBody = document.getElementById('admin-categories-table-body');
    if (!tableBody) return;

    if (this.categories.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="py-8 text-center text-slate-400">No categories found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = this.categories
      .map((cat) => {
        const parent = this.categories.find((c) => c.id === cat.parentCategoryId);
        const parentName = parent ? parent.categoryName : 'None (Top-Level)';

        return `
        <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
          <td class="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 text-sm">
            ${cat.categoryName}
          </td>
          <td class="px-6 py-4 text-xs text-slate-500">
            <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">${parentName}</span>
          </td>
          <td class="px-6 py-4 text-xs text-slate-500 truncate max-w-[240px]">
            ${cat.description || '—'}
          </td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <button 
                type="button" 
                class="p-1.5 text-slate-500 hover:text-spring-dark-green hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                title="Edit Category"
                onclick="window.adminApp.openEditCategoryModal(${cat.id})"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>
              <button 
                type="button" 
                class="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                title="Delete Category"
                onclick="window.adminApp.handleDeleteCategory(${cat.id})"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join('');
  }

  openAddCategoryModal() {
    this.editingCategoryId = null;
    document.getElementById('admin-category-modal-title').textContent = 'Create Category';
    document.getElementById('admin-category-form').reset();
    this.categoryModal.open();
  }

  openEditCategoryModal(categoryId) {
    const cat = this.categories.find((c) => c.id === categoryId);
    if (!cat) return;

    this.editingCategoryId = categoryId;
    document.getElementById('admin-category-modal-title').textContent = `Edit Category #${categoryId}`;
    document.getElementById('cat-form-name').value = cat.categoryName || '';
    document.getElementById('cat-form-parent').value = cat.parentCategoryId || '';
    document.getElementById('cat-form-desc').value = cat.description || '';
    this.categoryModal.open();
  }

  async handleCategoryFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('cat-form-name')?.value.trim();
    const parentId = document.getElementById('cat-form-parent')?.value || null;
    const desc = document.getElementById('cat-form-desc')?.value.trim();

    const data = {
      categoryName: name,
      parentCategoryId: parentId ? Number(parentId) : null,
      description: desc,
    };

    try {
      if (this.editingCategoryId) {
        await categoriesApi.update(this.editingCategoryId, data);
        toast.success('Category updated');
      } else {
        await categoriesApi.create(data);
        toast.success('Category created');
      }

      this.categoryModal.close();
      await this.loadCategories();
    } catch (err) {
      toast.error(errorHandler.parse(err));
    }
  }

  async handleDeleteCategory(categoryId) {
    const confirmed = await confirmDialog.show({
      title: 'Delete Category',
      message: `Are you sure you want to delete category #${categoryId}?`,
      confirmText: 'Delete',
      isDanger: true,
    });

    if (confirmed) {
      try {
        await categoriesApi.delete(categoryId);
        toast.success('Category deleted');
        await this.loadCategories();
      } catch (err) {
        toast.error(errorHandler.parse(err));
      }
    }
  }

  // =================== ORDERS =================== //

  async loadOrders() {
    const tableBody = document.getElementById('admin-orders-table-body');
    if (tableBody) tableBody.innerHTML = loader.renderTableSkeletons(5, 6);

    try {
      this.orders = (await ordersApi.getAll()) || [];
      this.renderOrdersTable();
      this.renderRecentOrdersOverview();
    } catch (err) {
      if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-rose-500">${errorHandler.parse(err)}</td></tr>`;
      }
    }
  }

  renderOrdersTable() {
    const tableBody = document.getElementById('admin-orders-table-body');
    if (!tableBody) return;

    if (this.orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">No customer orders recorded yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = this.orders
      .map((o) => {
        const statusClass = CONFIG.STATUS_COLORS[o.status] || 'bg-slate-100 text-slate-800';

        return `
        <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
          <td class="px-6 py-4 font-mono font-semibold text-xs text-slate-900 dark:text-slate-100">
            #ORD-${o.id}
          </td>
          <td class="px-6 py-4 text-xs text-slate-500">
            ${formatter.dateTime(o.orderDate)}
          </td>
          <td class="px-6 py-4 text-xs text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
            User #${o.userId}
          </td>
          <td class="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">
            ${formatter.currency(o.totalAmount)}
          </td>
          <td class="px-6 py-4">
            <select 
              class="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-white dark:bg-slate-900 cursor-pointer ${statusClass}"
              onchange="window.adminApp.handleOrderStatusChange(${o.id}, this.value)"
            >
              <option value="PENDING" ${o.status === 'PENDING' ? 'selected' : ''}>PENDING</option>
              <option value="PROCESSING" ${o.status === 'PROCESSING' ? 'selected' : ''}>PROCESSING</option>
              <option value="SHIPPED" ${o.status === 'SHIPPED' ? 'selected' : ''}>SHIPPED</option>
              <option value="DELIVERED" ${o.status === 'DELIVERED' ? 'selected' : ''}>DELIVERED</option>
              <option value="CANCELLED" ${o.status === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
            </select>
          </td>
          <td class="px-6 py-4 text-right">
            <button 
              type="button" 
              class="px-3 py-1 text-xs font-medium text-spring-dark-green hover:bg-spring-light-green/40 dark:hover:bg-slate-800 rounded-lg transition"
              onclick="window.adminApp.openOrderDetailModal(${o.id})"
            >
              Details
            </button>
          </td>
        </tr>
      `;
      })
      .join('');
  }

  async handleOrderStatusChange(orderId, newStatus) {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      toast.success(`Order #ORD-${orderId} status updated to ${newStatus}`);
      await this.loadOrders();
      this.updateDashboardKPIs();
    } catch (err) {
      toast.error(errorHandler.parse(err));
      await this.loadOrders();
    }
  }

  openOrderDetailModal(orderId) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    document.getElementById('admin-order-modal-id').textContent = `#ORD-${order.id}`;
    document.getElementById('admin-order-modal-date').textContent = formatter.dateTime(order.orderDate);
    document.getElementById('admin-order-modal-status').textContent = order.status;
    document.getElementById('admin-order-modal-status').className = `px-2.5 py-0.5 rounded-full text-xs font-semibold border ${CONFIG.STATUS_COLORS[order.status] || ''}`;
    document.getElementById('admin-order-modal-address').textContent = order.shippingAddress || 'Not provided';
    document.getElementById('admin-order-modal-total').textContent = formatter.currency(order.totalAmount);

    const itemsContainer = document.getElementById('admin-order-modal-items');
    if (itemsContainer) {
      itemsContainer.innerHTML = (order.items || [])
        .map(
          (i) => `
        <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 text-xs">
          <div>
            <span class="font-semibold text-slate-800 dark:text-slate-200">${i.productName}</span>
            <span class="text-slate-400 block">${formatter.currency(i.unitPrice)} × ${i.quantity}</span>
          </div>
          <span class="font-bold text-slate-900 dark:text-slate-100">${formatter.currency(i.subtotal)}</span>
        </div>
      `
        )
        .join('');
    }

    this.orderDetailModal.open();
  }

  // =================== USERS =================== //

  async loadUsers() {
    const tableBody = document.getElementById('admin-users-table-body');
    if (tableBody) tableBody.innerHTML = loader.renderTableSkeletons(4, 4);

    try {
      this.users = (await usersApi.getAll()) || [];
      this.renderUsersTable();
    } catch (err) {
      if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-rose-500">${errorHandler.parse(err)}</td></tr>`;
      }
    }
  }

  renderUsersTable() {
    const tableBody = document.getElementById('admin-users-table-body');
    if (!tableBody) return;

    if (this.users.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="py-8 text-center text-slate-400">No users found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = this.users
      .map((u) => {
        const isAdmin = u.role === 'ADMIN' || u.role === 'ROLE_ADMIN';
        const badgeClass = isAdmin ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

        return `
        <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-spring-light-green dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-spring-dark-green">
                ${(u.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div class="min-w-0">
                <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">${u.name}</h4>
                <span class="text-xs text-slate-400">User ID #${u.id}</span>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
            ${u.email}
          </td>
          <td class="px-6 py-4">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}">
              ${u.role}
            </span>
          </td>
          <td class="px-6 py-4 text-right">
            <button 
              type="button" 
              class="px-3 py-1 text-xs font-medium text-spring-dark-green hover:bg-spring-light-green/40 dark:hover:bg-slate-800 rounded-lg transition"
              onclick="window.adminApp.openUserDetailModal(${u.id})"
            >
              View Info
            </button>
          </td>
        </tr>
      `;
      })
      .join('');
  }

  openUserDetailModal(userId) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;

    document.getElementById('admin-user-modal-name').textContent = user.name || 'User';
    document.getElementById('admin-user-modal-email').textContent = user.email || 'N/A';
    document.getElementById('admin-user-modal-role').textContent = user.role || 'USER';
    document.getElementById('admin-user-modal-id').textContent = `#${user.id}`;

    // User's order history in modal
    const userOrders = this.orders.filter((o) => o.userId === userId);
    const ordersList = document.getElementById('admin-user-modal-orders');
    if (ordersList) {
      if (userOrders.length === 0) {
        ordersList.innerHTML = '<p class="text-xs text-slate-400 py-2">No orders placed yet.</p>';
      } else {
        ordersList.innerHTML = userOrders
          .map(
            (o) => `
          <div class="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
            <span>#ORD-${o.id} (${formatter.date(o.orderDate)})</span>
            <span class="font-bold">${formatter.currency(o.totalAmount)}</span>
          </div>
        `
          )
          .join('');
      }
    }

    this.userDetailModal.open();
  }

  // =================== DASHBOARD OVERVIEW =================== //

  updateDashboardKPIs() {
    const kpiProducts = document.getElementById('kpi-total-products');
    const kpiOrders = document.getElementById('kpi-total-orders');
    const kpiUsers = document.getElementById('kpi-total-users');
    const kpiPending = document.getElementById('kpi-pending-orders');

    if (kpiProducts) kpiProducts.textContent = String(this.products.length);
    if (kpiOrders) kpiOrders.textContent = String(this.orders.length);
    if (kpiUsers) kpiUsers.textContent = String(this.users.length);

    const pendingCount = this.orders.filter((o) => o.status === 'PENDING').length;
    if (kpiPending) kpiPending.textContent = String(pendingCount);

    this.renderRecentOrdersOverview();
  }

  renderRecentOrdersOverview() {
    const container = document.getElementById('overview-recent-orders-list');
    if (!container) return;

    const recent = this.orders.slice(0, 5);
    if (recent.length === 0) {
      container.innerHTML = '<p class="text-xs text-slate-400 py-4 text-center">No orders recorded yet.</p>';
      return;
    }

    container.innerHTML = recent
      .map((o) => {
        const statusClass = CONFIG.STATUS_COLORS[o.status] || 'bg-slate-100 text-slate-800';
        return `
        <div class="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
          <div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100">#ORD-${o.id}</h4>
            <span class="text-[11px] text-slate-400">${formatter.dateTime(o.orderDate)}</span>
          </div>
          <div class="text-right">
            <span class="text-xs font-bold text-slate-900 dark:text-slate-100 block">${formatter.currency(o.totalAmount)}</span>
            <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusClass}">${o.status}</span>
          </div>
        </div>
      `;
      })
      .join('');
  }
}

// Global initialization
window.adminApp = new AdminApp();
document.addEventListener('DOMContentLoaded', () => {
  window.adminApp.init();
});
