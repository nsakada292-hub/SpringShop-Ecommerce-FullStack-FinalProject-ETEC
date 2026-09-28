/**
 * SpringShop - Storefront Main Application Controller
 */
import { CONFIG } from './config.js';
import { storage } from './utils/storage.js';
import { formatter } from './utils/formatter.js';
import { debounce } from './utils/debounce.js';
import { authGuard } from './utils/auth-guard.js';
import { errorHandler } from './utils/error-handler.js';

import { authApi } from './api/auth.js';
import { categoriesApi } from './api/categories.js';
import { productsApi } from './api/products.js';
import { cartApi } from './api/cart.js';
import { ordersApi } from './api/orders.js';
import { reviewsApi } from './api/reviews.js';
import { usersApi } from './api/users.js';

import { toast } from './components/toast.js';
import { loader } from './components/loader.js';
import { emptyState } from './components/empty-state.js';
import { Modal } from './components/modal.js';
import { Drawer } from './components/drawer.js';
import { confirmDialog } from './components/confirmation.js';
import { productCard } from './components/product-card.js';
import { navbar } from './components/navbar.js';

class StorefrontApp {
  constructor() {
    this.state = {
      categories: [],
      products: [],
      filteredProducts: [],
      activeCategoryId: null,
      activeCategoryName: 'All Products',
      searchKeyword: '',
      sortOption: 'default',
      cart: null,
      wishlist: storage.getWishlist(),
      selectedProduct: null,
      selectedProductReviews: [],
      selectedProductRating: 0,
      selectedQuantity: 1,
      theme: storage.getTheme(),
    };

    // Modals & Drawers
    this.cartDrawer = null;
    this.wishlistDrawer = null;
    this.mobileDrawer = null;
    this.productDetailModal = null;
    this.authModal = null;
    this.checkoutModal = null;
    this.orderSuccessModal = null;
    this.ordersModal = null;
    this.profileModal = null;
    this.apiConfigModal = null;
  }

  async init() {
    this.applyTheme(this.state.theme);
    this.initComponents();
    this.bindEvents();
    navbar.updateAuthState();
    navbar.updateWishlistBadge(this.state.wishlist.length);

    // Initial API loads
    await Promise.allSettled([
      this.loadCategories(),
      this.loadProducts(),
      this.loadCart(),
    ]);
  }

  initComponents() {
    this.cartDrawer = new Drawer('cart-drawer');
    this.wishlistDrawer = new Drawer('wishlist-drawer');
    this.mobileDrawer = new Drawer('mobile-nav-drawer');

    this.productDetailModal = new Modal('product-detail-modal');
    this.authModal = new Modal('auth-modal');
    this.checkoutModal = new Modal('checkout-modal');
    this.orderSuccessModal = new Modal('order-success-modal');
    this.ordersModal = new Modal('orders-modal');
    this.profileModal = new Modal('profile-modal');
    this.apiConfigModal = new Modal('api-config-modal');

    navbar.initCategoriesDropdown('navbar-categories-dropdown');
  }

  applyTheme(theme) {
    this.state.theme = theme;
    storage.setTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleTheme() {
    const nextTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
    toast.info(`Switched to ${nextTheme} mode`);
  }

  bindEvents() {
    // Theme toggle buttons
    document.querySelectorAll('[data-action="toggle-theme"]').forEach((btn) => {
      btn.addEventListener('click', () => this.toggleTheme());
    });

    // Auth expiration listener
    window.addEventListener('springshop:auth-expired', () => {
      navbar.updateAuthState();
      navbar.updateCartBadge(0);
      toast.warning('Session expired. Please sign in again.');
    });

    // Search input (desktop + mobile)
    const searchInput = document.getElementById('store-search-input');
    if (searchInput) {
      const handleSearch = debounce((e) => {
        this.state.searchKeyword = e.target.value.trim();
        this.loadProducts();
      }, 350);
      searchInput.addEventListener('input', handleSearch);

      const clearBtn = document.getElementById('store-search-clear');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          searchInput.value = '';
          this.state.searchKeyword = '';
          this.loadProducts();
        });
      }
    }

    // Sort select
    const sortSelect = document.getElementById('products-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.state.sortOption = e.target.value;
        this.applyFiltersAndSort();
      });
    }

    // Cart Drawer Toggle
    document.querySelectorAll('[data-action="open-cart"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!authGuard.isAuthenticated()) {
          this.openAuthModal('login', 'Please sign in to view your shopping cart');
          return;
        }
        this.loadCart();
        this.cartDrawer.open();
      });
    });

    // Wishlist Drawer Toggle
    document.querySelectorAll('[data-action="open-wishlist"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.renderWishlistDrawer();
        this.wishlistDrawer.open();
      });
    });

    // Mobile nav toggle
    document.querySelectorAll('[data-action="open-mobile-nav"]').forEach((btn) => {
      btn.addEventListener('click', () => this.mobileDrawer.open());
    });

    // Auth buttons
    document.querySelectorAll('[data-action="open-auth"]').forEach((btn) => {
      btn.addEventListener('click', () => this.openAuthModal('login'));
    });

    // User Profile buttons
    document.querySelectorAll('[data-action="open-profile"]').forEach((btn) => {
      btn.addEventListener('click', () => this.openProfileModal());
    });

    // Orders History buttons
    document.querySelectorAll('[data-action="open-orders"]').forEach((btn) => {
      btn.addEventListener('click', () => this.openOrdersModal());
    });

    // Logout
    document.querySelectorAll('[data-action="logout"]').forEach((btn) => {
      btn.addEventListener('click', () => this.handleLogout());
    });

    // Back to top floating button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
          backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
          backToTopBtn.classList.add('opacity-100', 'pointer-events-auto');
        } else {
          backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
          backToTopBtn.classList.remove('opacity-100', 'pointer-events-auto');
        }
      });
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Global event delegation for product cards (add to cart, wishlist, view details)
    document.addEventListener('click', async (e) => {
      // Wishlist toggle
      const wishlistBtn = e.target.closest('[data-wishlist-btn]');
      if (wishlistBtn) {
        e.stopPropagation();
        const productId = Number(wishlistBtn.dataset.wishlistBtn);
        this.toggleWishlist(productId, wishlistBtn);
        return;
      }

      // Add to Cart
      const addCartBtn = e.target.closest('[data-add-cart-btn]');
      if (addCartBtn) {
        e.stopPropagation();
        const productId = Number(addCartBtn.dataset.addCartBtn);
        await this.handleAddToCart(productId, 1, addCartBtn);
        return;
      }

      // Open Product details modal
      const productCardEl = e.target.closest('[data-product-id]');
      if (productCardEl && !e.target.closest('button') && !e.target.closest('a')) {
        const productId = Number(productCardEl.dataset.productId);
        this.openProductModal(productId);
        return;
      }

      // Category Pill / Nav click
      const catBtn = e.target.closest('[data-nav-category-id]');
      if (catBtn) {
        const catId = catBtn.dataset.navCategoryId === 'all' ? null : Number(catBtn.dataset.navCategoryId);
        const catName = catBtn.dataset.navCategoryName || 'All Products';
        this.selectCategory(catId, catName);
        if (this.mobileDrawer.isOpen()) {
          this.mobileDrawer.close();
        }
      }
    });

    // Auth Tabs switcher
    const loginTabBtn = document.getElementById('auth-tab-login');
    const registerTabBtn = document.getElementById('auth-tab-register');
    if (loginTabBtn && registerTabBtn) {
      loginTabBtn.addEventListener('click', () => this.switchAuthTab('login'));
      registerTabBtn.addEventListener('click', () => this.switchAuthTab('register'));
    }

    // Auth Form submissions
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Demo user login buttons
    const demoCustomerBtn = document.getElementById('btn-demo-customer');
    if (demoCustomerBtn) {
      demoCustomerBtn.addEventListener('click', () => {
        document.getElementById('login-email').value = 'customer@springshop.com';
        document.getElementById('login-password').value = 'password123';
      });
    }
    const demoAdminBtn = document.getElementById('btn-demo-admin');
    if (demoAdminBtn) {
      demoAdminBtn.addEventListener('click', () => {
        document.getElementById('login-email').value = 'admin@springshop.com';
        document.getElementById('login-password').value = 'admin123';
      });
    }

    // Checkout flow
    const proceedCheckoutBtn = document.getElementById('btn-proceed-checkout');
    if (proceedCheckoutBtn) {
      proceedCheckoutBtn.addEventListener('click', () => {
        this.cartDrawer.close();
        this.openCheckoutModal();
      });
    }

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => this.handlePlaceOrder(e));
    }

    // Clear Cart button
    const clearCartBtn = document.getElementById('btn-clear-cart');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', async () => {
        const confirmed = await confirmDialog.show({
          title: 'Clear Shopping Cart',
          message: 'Are you sure you want to remove all items from your cart?',
          confirmText: 'Clear Cart',
          isDanger: true,
        });
        if (confirmed) {
          try {
            await cartApi.clearMyCart();
            await this.loadCart();
            toast.info('Your cart has been cleared');
          } catch (err) {
            toast.error(errorHandler.parse(err));
          }
        }
      });
    }

    // Profile form submit
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.handleUpdateProfile(e));
    }

    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
      changePasswordForm.addEventListener('submit', (e) => this.handleChangePassword(e));
    }

    // Product Detail Quantity
    const qtyMinusBtn = document.getElementById('modal-qty-minus');
    const qtyPlusBtn = document.getElementById('modal-qty-plus');
    const qtyInput = document.getElementById('modal-qty-input');
    if (qtyMinusBtn && qtyPlusBtn && qtyInput) {
      qtyMinusBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val > 1) {
          qtyInput.value = val - 1;
          this.state.selectedQuantity = val - 1;
        }
      });
      qtyPlusBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        qtyInput.value = val + 1;
        this.state.selectedQuantity = val + 1;
      });
    }

    // Product Detail Modal "Add to Cart"
    const modalAddCartBtn = document.getElementById('modal-add-cart-btn');
    if (modalAddCartBtn) {
      modalAddCartBtn.addEventListener('click', async () => {
        if (!this.state.selectedProduct) return;
        const qty = parseInt(document.getElementById('modal-qty-input')?.value, 10) || 1;
        await this.handleAddToCart(this.state.selectedProduct.id, qty, modalAddCartBtn);
      });
    }

    // Review Form submit
    const reviewForm = document.getElementById('submit-review-form');
    if (reviewForm) {
      reviewForm.addEventListener('submit', (e) => this.handleReviewSubmit(e));
    }

    // Star rating picker in review form
    const starPicker = document.getElementById('review-rating-picker');
    if (starPicker) {
      const stars = starPicker.querySelectorAll('button');
      stars.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
          const rating = idx + 1;
          document.getElementById('review-rating-value').value = rating;
          stars.forEach((s, sIdx) => {
            if (sIdx < rating) {
              s.classList.add('text-amber-400');
              s.classList.remove('text-slate-300', 'dark:text-slate-600');
            } else {
              s.classList.remove('text-amber-400');
              s.classList.add('text-slate-300', 'dark:text-slate-600');
            }
          });
        });
      });
    }

    // API Config Switcher in footer
    const toggleApiConfigBtn = document.getElementById('btn-toggle-api-config');
    if (toggleApiConfigBtn) {
      toggleApiConfigBtn.addEventListener('click', () => {
        const input = document.getElementById('custom-api-url-input');
        if (input) input.value = CONFIG.API_BASE_URL;
        this.apiConfigModal.open();
      });
    }

    const apiConfigForm = document.getElementById('api-config-form');
    if (apiConfigForm) {
      apiConfigForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('custom-api-url-input')?.value.trim();
        CONFIG.API_BASE_URL = url || '';
        document.getElementById('footer-api-url').textContent = CONFIG.API_BASE_URL;
        toast.success(`API URL updated to: ${CONFIG.API_BASE_URL}`);
        this.apiConfigModal.close();
        this.loadProducts();
        this.loadCategories();
      });
    }

    const resetApiBtn = document.getElementById('btn-reset-api-url');
    if (resetApiBtn) {
      resetApiBtn.addEventListener('click', () => {
        CONFIG.API_BASE_URL = '';
        document.getElementById('footer-api-url').textContent = CONFIG.API_BASE_URL;
        toast.info('Reset API URL to default.');
        this.apiConfigModal.close();
        this.loadProducts();
        this.loadCategories();
      });
    }
  }

  // =================== DATA FETCHING =================== //

  async loadCategories() {
    try {
      const cats = await categoriesApi.getTopLevel();
      this.state.categories = cats || [];
      this.renderCategoryPills();
    } catch (err) {
      console.warn('Categories load error:', err);
    }
  }

  async loadProducts() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    container.innerHTML = loader.renderProductSkeletons(8);

    try {
      let data = [];
      if (this.state.searchKeyword) {
        data = await productsApi.search(this.state.searchKeyword);
      } else if (this.state.activeCategoryId) {
        data = await productsApi.getByCategory(this.state.activeCategoryId);
      } else {
        data = await productsApi.getAll();
      }

      this.state.products = data || [];
      this.applyFiltersAndSort();
    } catch (err) {
      container.innerHTML = emptyState.render({
        icon: 'error',
        title: 'Unable to Load Products',
        description: errorHandler.parse(err),
        actionText: 'Retry',
        actionId: 'retry-products-btn',
      });
      document.getElementById('retry-products-btn')?.addEventListener('click', () => this.loadProducts());
    }
  }

  applyFiltersAndSort() {
    let list = [...this.state.products];

    // Sort
    if (this.state.sortOption === 'price-low') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (this.state.sortOption === 'price-high') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (this.state.sortOption === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (this.state.sortOption === 'name') {
      list.sort((a, b) => (a.productName || '').localeCompare(b.productName || ''));
    }

    this.state.filteredProducts = list;
    this.renderProductsGrid();
  }

  renderProductsGrid() {
    const container = document.getElementById('products-grid');
    const countEl = document.getElementById('products-count-badge');
    const headerTitle = document.getElementById('products-section-title');

    if (headerTitle) {
      headerTitle.textContent = this.state.searchKeyword
        ? `Search results for "${this.state.searchKeyword}"`
        : this.state.activeCategoryName;
    }

    if (countEl) {
      countEl.textContent = `${this.state.filteredProducts.length} items`;
    }

    if (!container) return;

    if (this.state.filteredProducts.length === 0) {
      container.innerHTML = emptyState.render({
        icon: 'search',
        title: 'No Products Found',
        description: this.state.searchKeyword
          ? `No items matched your search query "${this.state.searchKeyword}".`
          : 'No items currently available in this category.',
        actionText: 'View All Products',
        actionId: 'reset-filter-btn',
      });
      document.getElementById('reset-filter-btn')?.addEventListener('click', () => {
        this.selectCategory(null, 'All Products');
        const searchInput = document.getElementById('store-search-input');
        if (searchInput) searchInput.value = '';
        this.state.searchKeyword = '';
        this.loadProducts();
      });
      return;
    }

    container.innerHTML = this.state.filteredProducts
      .map((p) => productCard.render(p))
      .join('');
  }

  renderCategoryPills() {
    const container = document.getElementById('category-pills-container');
    if (!container) return;

    const allPill = `
      <button 
        type="button" 
        data-nav-category-id="all" 
        data-nav-category-name="All Products"
        class="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
          this.state.activeCategoryId === null
            ? 'bg-spring-dark-green text-white shadow-xs'
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-spring-primary-green'
        }"
      >
        All Products
      </button>
    `;

    const catPills = this.state.categories
      .map((cat) => {
        const isActive = this.state.activeCategoryId === cat.id;
        return `
        <button 
          type="button" 
          data-nav-category-id="${cat.id}"
          data-nav-category-name="${cat.categoryName}"
          class="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
            isActive
              ? 'bg-spring-dark-green text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-spring-primary-green'
          }"
        >
          ${cat.categoryName}
        </button>
      `;
      })
      .join('');

    container.innerHTML = allPill + catPills;
  }

  selectCategory(id, name) {
    this.state.activeCategoryId = id;
    this.state.activeCategoryName = name || 'All Products';
    this.renderCategoryPills();
    this.loadProducts();

    // Scroll slightly to products section if clicked from top
    const section = document.getElementById('products-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // =================== SHOPPING CART =================== //

  async loadCart() {
    if (!authGuard.isAuthenticated()) {
      navbar.updateCartBadge(0);
      return;
    }

    try {
      const cart = await cartApi.getMyCart();
      this.state.cart = cart;
      const itemCount = (cart?.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
      navbar.updateCartBadge(itemCount);
      this.renderCartDrawer();
    } catch (err) {
      console.warn('Error loading cart:', err);
    }
  }

  async handleAddToCart(productId, quantity = 1, buttonElement = null) {
    if (!authGuard.isAuthenticated()) {
      this.openAuthModal('login', 'Please sign in to add items to your cart.');
      return;
    }

    if (buttonElement) {
      buttonElement.disabled = true;
      buttonElement.innerHTML = loader.spinner('w-3.5 h-3.5');
    }

    try {
      const updatedCart = await cartApi.addItem({ productId, quantity });
      this.state.cart = updatedCart;
      const itemCount = (updatedCart?.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
      navbar.updateCartBadge(itemCount);
      this.renderCartDrawer();
      toast.success('Added to your shopping cart', 'Added to Cart');
    } catch (err) {
      toast.error(errorHandler.parse(err), 'Could not add to cart');
    } finally {
      if (buttonElement) {
        buttonElement.disabled = false;
        buttonElement.innerHTML = `
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          <span>Add</span>
        `;
      }
    }
  }

  renderCartDrawer() {
    const itemsContainer = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const emptyEl = document.getElementById('cart-empty-view');
    const contentEl = document.getElementById('cart-content-view');

    if (!itemsContainer) return;

    const items = this.state.cart?.items || [];
    const totalAmount = this.state.cart?.totalAmount || 0;

    if (items.length === 0) {
      if (emptyEl) emptyEl.classList.remove('hidden');
      if (contentEl) contentEl.classList.add('hidden');
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');
    if (contentEl) contentEl.classList.remove('hidden');

    if (subtotalEl) subtotalEl.textContent = formatter.currency(totalAmount);
    if (totalEl) totalEl.textContent = formatter.currency(totalAmount);

    itemsContainer.innerHTML = items
      .map(
        (item) => `
      <div class="flex items-center gap-3.5 py-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
        <div class="w-16 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=300&q=80" 
            alt="${item.productName}" 
            class="w-full h-full object-cover"
          />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">${item.productName}</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${formatter.currency(item.productPrice)} each</p>
          
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button 
                type="button" 
                class="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                onclick="window.storeApp.updateCartQuantity(${item.id}, ${item.quantity - 1})"
              >-</button>
              <span class="px-2 text-xs font-semibold text-slate-900 dark:text-slate-100">${item.quantity}</span>
              <button 
                type="button" 
                class="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                onclick="window.storeApp.updateCartQuantity(${item.id}, ${item.quantity + 1})"
              >+</button>
            </div>

            <div class="text-right">
              <span class="text-sm font-bold text-slate-900 dark:text-slate-100">${formatter.currency(item.subtotal)}</span>
              <button 
                type="button" 
                class="block text-[11px] text-rose-500 hover:underline mt-0.5"
                onclick="window.storeApp.removeCartItem(${item.id})"
              >Remove</button>
            </div>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  }

  async updateCartQuantity(cartItemId, newQuantity) {
    try {
      const updated = await cartApi.updateItemQuantity(cartItemId, newQuantity);
      this.state.cart = updated;
      const itemCount = (updated?.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
      navbar.updateCartBadge(itemCount);
      this.renderCartDrawer();
    } catch (err) {
      toast.error(errorHandler.parse(err));
    }
  }

  async removeCartItem(cartItemId) {
    try {
      const updated = await cartApi.removeItem(cartItemId);
      this.state.cart = updated;
      const itemCount = (updated?.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
      navbar.updateCartBadge(itemCount);
      this.renderCartDrawer();
      toast.info('Item removed from cart');
    } catch (err) {
      toast.error(errorHandler.parse(err));
    }
  }

  // =================== WISHLIST =================== //

  toggleWishlist(productId, btnElement) {
    const list = storage.toggleWishlist(productId);
    this.state.wishlist = list;
    navbar.updateWishlistBadge(list.length);

    const isAdded = list.includes(productId);
    if (btnElement) {
      const svg = btnElement.querySelector('svg');
      if (svg) {
        if (isAdded) {
          svg.classList.add('fill-rose-500', 'text-rose-500', 'scale-110');
          svg.classList.remove('fill-none');
        } else {
          svg.classList.remove('fill-rose-500', 'text-rose-500', 'scale-110');
          svg.classList.add('fill-none');
        }
      }
    }

    if (isAdded) {
      toast.success('Saved to your favorites', 'Wishlist');
    } else {
      toast.info('Removed from favorites', 'Wishlist');
    }
  }

  renderWishlistDrawer() {
    const container = document.getElementById('wishlist-items-container');
    const emptyEl = document.getElementById('wishlist-empty-view');
    if (!container) return;

    const ids = this.state.wishlist;
    if (ids.length === 0) {
      if (emptyEl) emptyEl.classList.remove('hidden');
      container.innerHTML = '';
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');

    // Find in loaded products or display placeholder
    const items = ids.map((id) => {
      return this.state.products.find((p) => p.id === id) || {
        id,
        productName: `Item #${id}`,
        price: 29.99,
        image: productCard.getPlaceholderImage(),
      };
    });

    container.innerHTML = items
      .map(
        (p) => `
      <div class="flex items-center justify-between gap-3 py-3 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <img src="${p.image || productCard.getPlaceholderImage()}" class="w-12 h-14 object-cover rounded-lg" alt="" />
          <div>
            <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">${p.productName}</h4>
            <p class="text-xs font-bold text-spring-dark-green mt-0.5">${formatter.currency(p.price)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button 
            type="button" 
            class="px-2.5 py-1 text-xs font-medium bg-spring-dark-green text-white rounded-lg shadow-xs hover:bg-emerald-800 transition"
            onclick="window.storeApp.handleAddToCart(${p.id}, 1)"
          >Add to Cart</button>
          <button 
            type="button" 
            class="p-1 text-slate-400 hover:text-rose-500 transition"
            onclick="window.storeApp.toggleWishlist(${p.id})"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>
    `
      )
      .join('');
  }

  // =================== PRODUCT DETAILS & REVIEWS =================== //

  async openProductModal(productId) {
    this.productDetailModal.open();

    const titleEl = document.getElementById('modal-product-title');
    const catEl = document.getElementById('modal-product-category');
    const priceEl = document.getElementById('modal-product-price');
    const descEl = document.getElementById('modal-product-desc');
    const imgEl = document.getElementById('modal-product-img');
    const stockEl = document.getElementById('modal-product-stock');
    const sizeEl = document.getElementById('modal-product-size');
    const colorEl = document.getElementById('modal-product-color');
    const matEl = document.getElementById('modal-product-material');
    const avgRatingEl = document.getElementById('modal-avg-rating');
    const reviewCountEl = document.getElementById('modal-review-count');

    // Reset qty
    const qtyInput = document.getElementById('modal-qty-input');
    if (qtyInput) qtyInput.value = '1';
    this.state.selectedQuantity = 1;

    try {
      const product = await productsApi.getById(productId);
      this.state.selectedProduct = product;

      if (titleEl) titleEl.textContent = product.productName;
      if (catEl) catEl.textContent = product.category?.categoryName || 'Fashion';
      if (priceEl) priceEl.textContent = formatter.currency(product.price);
      if (descEl) descEl.textContent = product.description || 'No detailed description provided.';
      if (imgEl) imgEl.src = product.image || productCard.getPlaceholderImage();

      if (sizeEl) sizeEl.textContent = product.size || 'Standard';
      if (colorEl) colorEl.textContent = product.color || 'Standard';
      if (matEl) matEl.textContent = product.material || 'Premium Fabric';

      const stock = product.stockQuantity !== undefined ? product.stockQuantity : 10;
      if (stockEl) {
        if (stock <= 0) {
          stockEl.textContent = 'Out of Stock';
          stockEl.className = 'text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700';
        } else {
          stockEl.textContent = `In Stock (${stock} available)`;
          stockEl.className = 'text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700';
        }
      }

      // Fetch Reviews & Average Rating
      await this.loadProductReviews(productId);
    } catch (err) {
      toast.error('Failed to load product details');
    }
  }

  async loadProductReviews(productId) {
    const reviewsList = document.getElementById('modal-reviews-list');
    const avgRatingEl = document.getElementById('modal-avg-rating');
    const reviewCountEl = document.getElementById('modal-review-count');

    try {
      const [reviews, avg] = await Promise.all([
        reviewsApi.getByProduct(productId),
        reviewsApi.getAverageRating(productId),
      ]);

      this.state.selectedProductReviews = reviews || [];
      this.state.selectedProductRating = avg || 0;

      if (avgRatingEl) avgRatingEl.textContent = Number(avg || 0).toFixed(1);
      if (reviewCountEl) reviewCountEl.textContent = `(${reviews?.length || 0} reviews)`;

      if (!reviewsList) return;

      if (!reviews || reviews.length === 0) {
        reviewsList.innerHTML = '<p class="text-xs text-slate-400 py-4 italic">No customer reviews yet. Be the first to share your thoughts!</p>';
        return;
      }

      const currentUser = storage.getUser();

      reviewsList.innerHTML = reviews
        .map((r) => {
          const isOwn = currentUser && currentUser.id === r.userId;
          return `
          <div class="py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-slate-900 dark:text-slate-100">${r.userName || 'Customer'}</span>
                <span class="text-[11px] text-slate-400">${formatter.date(r.createdAt)}</span>
              </div>
              <div class="flex items-center gap-1 text-amber-500">
                ${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}
              </div>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${r.comment}</p>
            ${
              isOwn
                ? `<div class="flex items-center gap-2 mt-1">
                    <button type="button" class="text-[11px] text-rose-500 hover:underline" onclick="window.storeApp.handleDeleteReview(${r.id})">Delete</button>
                  </div>`
                : ''
            }
          </div>
        `;
        })
        .join('');
    } catch (err) {
      if (reviewsList) {
        reviewsList.innerHTML = '<p class="text-xs text-slate-400 py-2">Reviews not available.</p>';
      }
    }
  }

  async handleReviewSubmit(e) {
    e.preventDefault();
    if (!authGuard.isAuthenticated()) {
      this.openAuthModal('login', 'Please sign in to submit a product review.');
      return;
    }

    if (!this.state.selectedProduct) return;

    const ratingVal = parseInt(document.getElementById('review-rating-value')?.value, 10) || 5;
    const commentVal = document.getElementById('review-comment-input')?.value.trim();

    if (!commentVal) {
      toast.warning('Please enter a review comment');
      return;
    }

    try {
      await reviewsApi.create({
        productId: this.state.selectedProduct.id,
        rating: ratingVal,
        comment: commentVal,
      });

      toast.success('Thank you! Your review has been posted.', 'Review Added');
      document.getElementById('review-comment-input').value = '';
      await this.loadProductReviews(this.state.selectedProduct.id);
    } catch (err) {
      toast.error(errorHandler.parse(err), 'Could not submit review');
    }
  }

  async handleDeleteReview(reviewId) {
    const confirmed = await confirmDialog.show({
      title: 'Delete Review',
      message: 'Are you sure you want to delete your review?',
      confirmText: 'Delete',
      isDanger: true,
    });

    if (confirmed) {
      try {
        await reviewsApi.delete(reviewId);
        toast.info('Review deleted');
        if (this.state.selectedProduct) {
          await this.loadProductReviews(this.state.selectedProduct.id);
        }
      } catch (err) {
        toast.error(errorHandler.parse(err));
      }
    }
  }

  // =================== CHECKOUT & ORDERS =================== //

  openCheckoutModal() {
    if (!authGuard.isAuthenticated()) {
      this.openAuthModal('login', 'Please sign in to complete checkout.');
      return;
    }

    const items = this.state.cart?.items || [];
    if (items.length === 0) {
      toast.warning('Your cart is empty. Add some products first!');
      return;
    }

    const user = storage.getUser();
    const nameInput = document.getElementById('checkout-name');
    const emailInput = document.getElementById('checkout-email');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const totalEl = document.getElementById('checkout-total');
    const itemsPreview = document.getElementById('checkout-items-preview');

    if (nameInput && user) nameInput.value = user.name || '';
    if (emailInput && user) emailInput.value = user.email || '';

    const total = this.state.cart?.totalAmount || 0;
    if (subtotalEl) subtotalEl.textContent = formatter.currency(total);
    if (totalEl) totalEl.textContent = formatter.currency(total);

    if (itemsPreview) {
      itemsPreview.innerHTML = items
        .map(
          (i) => `
        <div class="flex items-center justify-between text-xs py-1 text-slate-600 dark:text-slate-300">
          <span class="truncate max-w-[200px]">${i.productName} × ${i.quantity}</span>
          <span class="font-semibold">${formatter.currency(i.subtotal)}</span>
        </div>
      `
        )
        .join('');
    }

    this.checkoutModal.open();
  }

  async handlePlaceOrder(e) {
    e.preventDefault();
    const address = document.getElementById('checkout-address')?.value.trim();
    if (!address) {
      toast.warning('Please enter a valid shipping address');
      return;
    }

    const submitBtn = document.getElementById('btn-submit-order');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `${loader.spinner('w-4 h-4')} <span>Placing Order...</span>`;
    }

    try {
      const orderResponse = await ordersApi.placeOrder({ shippingAddress: address });
      this.checkoutModal.close();

      // Clear local cart state
      this.state.cart = null;
      navbar.updateCartBadge(0);

      // Display Success Modal
      const orderIdEl = document.getElementById('success-order-id');
      const orderTotalEl = document.getElementById('success-order-total');
      if (orderIdEl) orderIdEl.textContent = `#ORD-${orderResponse.id}`;
      if (orderTotalEl) orderTotalEl.textContent = formatter.currency(orderResponse.totalAmount);

      this.orderSuccessModal.open();
      toast.success('Your order has been placed successfully!', 'Order Placed');
    } catch (err) {
      toast.error(errorHandler.parse(err), 'Checkout Failed');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Place Order</span>';
      }
    }
  }

  async openOrdersModal() {
    if (!authGuard.isAuthenticated()) {
      this.openAuthModal('login', 'Please sign in to view your orders.');
      return;
    }

    this.ordersModal.open();
    const container = document.getElementById('orders-list-container');
    if (!container) return;

    container.innerHTML = '<div class="py-12 flex justify-center">' + loader.spinner('w-8 h-8 text-spring-dark-green') + '</div>';

    try {
      const orders = await ordersApi.getMyOrders();
      if (!orders || orders.length === 0) {
        container.innerHTML = emptyState.render({
          icon: 'box',
          title: 'No Orders Yet',
          description: 'You have not placed any orders yet. Discover our new arrivals!',
        });
        return;
      }

      container.innerHTML = orders
        .map((o) => {
          const statusClass = CONFIG.STATUS_COLORS[o.status] || 'bg-slate-100 text-slate-800';
          const canCancel = o.status === 'PENDING' || o.status === 'PROCESSING';

          return `
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span class="text-xs font-mono text-slate-400">Order ID</span>
                <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">#ORD-${o.id}</h4>
              </div>
              <div class="text-right">
                <span class="text-xs text-slate-400 block">${formatter.dateTime(o.orderDate)}</span>
                <span class="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusClass}">
                  ${o.status}
                </span>
              </div>
            </div>

            <div class="space-y-2 text-xs">
              <div class="text-slate-500">Shipping to: <span class="font-medium text-slate-700 dark:text-slate-300">${o.shippingAddress || 'Standard Address'}</span></div>
              
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 divide-y divide-slate-100 dark:divide-slate-800">
                ${(o.items || [])
                  .map(
                    (item) => `
                  <div class="flex items-center justify-between py-1.5 first:pt-0 last:pb-0">
                    <span class="font-medium text-slate-800 dark:text-slate-200">${item.productName} × ${item.quantity}</span>
                    <span class="font-semibold text-slate-900 dark:text-slate-100">${formatter.currency(item.subtotal)}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>

            <div class="flex items-center justify-between pt-2">
              <div class="text-sm font-bold text-slate-900 dark:text-slate-100">
                Total: <span class="text-spring-dark-green">${formatter.currency(o.totalAmount)}</span>
              </div>

              ${
                canCancel
                  ? `<button 
                      type="button" 
                      class="px-3 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900 transition"
                      onclick="window.storeApp.handleCancelOrder(${o.id})"
                    >Cancel Order</button>`
                  : ''
              }
            </div>
          </div>
        `;
        })
        .join('');
    } catch (err) {
      container.innerHTML = emptyState.render({
        icon: 'error',
        title: 'Could not load orders',
        description: errorHandler.parse(err),
      });
    }
  }

  async handleCancelOrder(orderId) {
    const confirmed = await confirmDialog.show({
      title: 'Cancel Order',
      message: `Are you sure you want to cancel order #ORD-${orderId}?`,
      confirmText: 'Cancel Order',
      isDanger: true,
    });

    if (confirmed) {
      try {
        await ordersApi.cancelOrder(orderId);
        toast.success(`Order #ORD-${orderId} has been cancelled.`);
        this.openOrdersModal();
      } catch (err) {
        toast.error(errorHandler.parse(err));
      }
    }
  }

  // =================== USER PROFILE =================== //

  async openProfileModal() {
    if (!authGuard.isAuthenticated()) {
      this.openAuthModal('login');
      return;
    }

    this.profileModal.open();
    try {
      const profile = await usersApi.getMyProfile();
      const nameInput = document.getElementById('profile-name');
      const emailInput = document.getElementById('profile-email');
      if (nameInput) nameInput.value = profile.name || '';
      if (emailInput) emailInput.value = profile.email || '';
    } catch (err) {
      toast.error('Failed to load profile details');
    }
  }

  async handleUpdateProfile(e) {
    e.preventDefault();
    const name = document.getElementById('profile-name')?.value.trim();
    const email = document.getElementById('profile-email')?.value.trim();

    try {
      const updated = await usersApi.updateMyProfile({ name, email });
      storage.setUser(updated);
      navbar.updateAuthState();
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(errorHandler.parse(err));
    }
  }

  async handleChangePassword(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('current-password')?.value;
    const newPassword = document.getElementById('new-password')?.value;
    const confirmPassword = document.getElementById('confirm-new-password')?.value;

    if (newPassword !== confirmPassword) {
      toast.warning('New passwords do not match');
      return;
    }

    try {
      await usersApi.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      document.getElementById('current-password').value = '';
      document.getElementById('new-password').value = '';
      document.getElementById('confirm-new-password').value = '';
    } catch (err) {
      toast.error(errorHandler.parse(err));
    }
  }

  // =================== AUTHENTICATION =================== //

  openAuthModal(tab = 'login', notice = null) {
    this.switchAuthTab(tab);
    const noticeEl = document.getElementById('auth-notice-message');
    if (noticeEl) {
      if (notice) {
        noticeEl.textContent = notice;
        noticeEl.classList.remove('hidden');
      } else {
        noticeEl.classList.add('hidden');
      }
    }
    this.authModal.open();
  }

  switchAuthTab(tab) {
    const loginTab = document.getElementById('auth-tab-login');
    const registerTab = document.getElementById('auth-tab-register');
    const loginView = document.getElementById('auth-login-view');
    const registerView = document.getElementById('auth-register-view');

    if (tab === 'login') {
      loginTab?.classList.add('border-spring-dark-green', 'text-spring-dark-green');
      loginTab?.classList.remove('border-transparent', 'text-slate-400');
      registerTab?.classList.remove('border-spring-dark-green', 'text-spring-dark-green');
      registerTab?.classList.add('border-transparent', 'text-slate-400');
      loginView?.classList.remove('hidden');
      registerView?.classList.add('hidden');
    } else {
      registerTab?.classList.add('border-spring-dark-green', 'text-spring-dark-green');
      registerTab?.classList.remove('border-transparent', 'text-slate-400');
      loginTab?.classList.remove('border-spring-dark-green', 'text-spring-dark-green');
      loginTab?.classList.add('border-transparent', 'text-slate-400');
      registerView?.classList.remove('hidden');
      loginView?.classList.add('hidden');
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;

    const btn = document.getElementById('btn-submit-login');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `${loader.spinner('w-4 h-4')} <span>Signing In...</span>`;
    }

    try {
      const response = await authApi.login({ email, password });
      storage.setToken(response.token);
      storage.setUser(response.user);

      navbar.updateAuthState();
      this.authModal.close();
      toast.success(`Welcome back, ${response.user?.name || 'Shopper'}!`, 'Signed In');

      await this.loadCart();

      // If admin, show quick link toast
      if (response.user?.role === 'ADMIN' || response.user?.role === 'ROLE_ADMIN') {
        toast.info('Administrator privileges detected. Access dashboard anytime via top navigation.', 'Admin Portal');
      }
    } catch (err) {
      toast.error(errorHandler.parse(err), 'Authentication Failed');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>Sign In</span>';
      }
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name')?.value.trim();
    const email = document.getElementById('register-email')?.value.trim();
    const password = document.getElementById('register-password')?.value;

    const btn = document.getElementById('btn-submit-register');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `${loader.spinner('w-4 h-4')} <span>Creating Account...</span>`;
    }

    try {
      const response = await authApi.register({ name, email, password });
      storage.setToken(response.token);
      storage.setUser(response.user);

      navbar.updateAuthState();
      this.authModal.close();
      toast.success(`Account created! Welcome to SpringShop, ${response.user?.name}!`, 'Welcome');
      await this.loadCart();
    } catch (err) {
      toast.error(errorHandler.parse(err), 'Registration Failed');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>Create Account</span>';
      }
    }
  }

  handleLogout() {
    storage.clearAuth();
    navbar.updateAuthState();
    navbar.updateCartBadge(0);
    this.state.cart = null;
    toast.info('You have been signed out.');
  }
}

// Instantiate and attach globally for inline event handlers
window.storeApp = new StorefrontApp();
document.addEventListener('DOMContentLoaded', () => {
  window.storeApp.init();
});
