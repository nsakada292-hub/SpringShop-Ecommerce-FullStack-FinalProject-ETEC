/**
 * Storefront Main State & Controller
 * Coordinates products, categories, cart, search, filtering, and theme
 */
const Store = {
  products: [],
  filteredProducts: [],
  topCategories: [],
  allCategories: [],
  activeCategoryId: null,
  activeCategoryName: null,
  searchKeyword: '',
  wishlist: [],
  cart: null,
  currentPage: 1,
  pageSize: 12,
  sortBy: 'default',

  /**
   * Initialize Storefront
   */
  async init() {
    this.initTheme();
    this.initWishlist();
    this.initAuthListeners();
    this.initScrollToTop();

    // Render initial layout containers
    Navbar.update();
    this.renderHero();
    this.renderReviewsSection();
    this.renderFooter();

    // Check URL parameters (e.g. loginRequired, categoryId, etc.)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('loginRequired') === 'true') {
      Modal.openAuth('login');
    }

    // Load dynamic data from Spring Boot backend
    await Promise.all([
      this.loadCategories(),
      this.loadProducts(),
      this.loadCart()
    ]);
  },

  /**
   * Dark / Light Theme Support
   */
  initTheme() {
    const saved = Storage.get(CONFIG.STORAGE_KEYS.THEME);
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    Storage.set(CONFIG.STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
    Navbar.update();
  },

  /**
   * Wishlist Management (Frontend state + localStorage)
   */
  initWishlist() {
    this.wishlist = Storage.get(CONFIG.STORAGE_KEYS.WISHLIST, []);
    this.updateWishlistBadge();
  },

  isWishlisted(productId) {
    return this.wishlist.includes(Number(productId));
  },

  toggleWishlist(productId) {
    const id = Number(productId);
    const index = this.wishlist.indexOf(id);
    if (index > -1) {
      this.wishlist.splice(index, 1);
      Toast.info('Removed from wishlist');
    } else {
      this.wishlist.push(id);
      Toast.success('Added to wishlist');
    }
    Storage.set(CONFIG.STORAGE_KEYS.WISHLIST, this.wishlist);
    this.updateWishlistBadge();

    // Re-render product card states
    const cardHeart = document.querySelector(`#product-${id} .heart-btn`);
    if (cardHeart) {
      const isLiked = this.isWishlisted(id);
      cardHeart.className = `heart-btn absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xs flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-sm hover:scale-110 ${isLiked ? 'liked text-rose-500 fill-rose-500' : ''}`;
      cardHeart.innerHTML = `<i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart ${isLiked ? 'text-rose-500' : ''}"></i>`;
    }
  },

  updateWishlistBadge() {
    const badge = document.getElementById('wishlistBadge');
    if (badge) {
      if (this.wishlist.length > 0) {
        badge.textContent = this.wishlist.length;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  },

  showWishlistModal() {
    const container = Modal.init();
    const wishlistedProducts = this.products.filter(p => this.wishlist.includes(p.id));

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto" id="wishlistOverlay">
        <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 relative my-8 animate-fade-in" onclick="event.stopPropagation()">
          <button onclick="Modal.close()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>

          <div class="flex items-center gap-2 mb-6">
            <div class="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <i class="fa-solid fa-heart"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Your Saved Items</h2>
              <p class="text-xs text-gray-500">${this.wishlist.length} item(s) saved</p>
            </div>
          </div>

          <div class="max-h-[60vh] overflow-y-auto">
            ${wishlistedProducts.length === 0 ? `
              <div class="text-center py-10">
                <div class="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center text-2xl mx-auto mb-3">
                  <i class="fa-regular fa-heart"></i>
                </div>
                <h3 class="text-base font-bold text-gray-900 dark:text-white mb-1">No items in wishlist yet</h3>
                <p class="text-xs text-gray-500 mb-4">Click the heart icon on any product to save items for later.</p>
                <button onclick="Modal.close()" class="btn-primary text-xs py-2 px-4">Browse Store</button>
              </div>
            ` : `
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${wishlistedProducts.map(p => ProductCard.render(p)).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    document.getElementById('wishlistOverlay').onclick = (e) => {
      if (e.target.id === 'wishlistOverlay') Modal.close();
    };
  },

  /**
   * Auth Event Listeners
   */
  initAuthListeners() {
    window.addEventListener('auth:changed', async () => {
      Navbar.update();
      await this.loadCart();
    });
  },

  /**
   * Cart State
   */
  async loadCart() {
    if (AuthGuard.isAuthenticated()) {
      try {
        this.cart = await CartAPI.getMyCart();
      } catch (e) {
        console.warn('Could not sync cart:', e);
        this.cart = { items: [], totalAmount: 0 };
      }
    } else {
      this.cart = { items: [], totalAmount: 0 };
    }
    this.updateCartBadge();
  },

  getCartItemCount() {
    if (!this.cart || !this.cart.items) return 0;
    return this.cart.items.reduce((sum, it) => sum + (it.quantity || 0), 0);
  },

  updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
      const count = this.getCartItemCount();
      if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  },

  async addToCart(productId, quantity = 1) {
    if (!AuthGuard.requireAuth(() => this.addToCart(productId, quantity), 'Please sign in to add items to your shopping bag.')) {
      return;
    }

    try {
      this.cart = await CartAPI.addItem({ productId, quantity });
      this.updateCartBadge();
      Toast.success('Added to your shopping bag!');
      
      // Auto open cart drawer to preview
      Drawer.openCart();
    } catch (err) {
      Toast.error(ErrorHandler.format(err));
    }
  },

  /**
   * Categories
   */
  async loadCategories() {
    try {
      const [topLevel, all] = await Promise.all([
        CategoriesAPI.getTopLevel(),
        CategoriesAPI.getAll()
      ]);
      this.topCategories = topLevel || [];
      this.allCategories = all || [];

      this.renderCategoryFilterPills();
      this.populateCategoriesInNav();
    } catch (err) {
      console.warn('Could not load categories:', err);
    }
  },

  populateCategoriesInNav() {
    const container = document.getElementById('desktopCategoriesList');
    if (!container) return;

    if (!this.topCategories || this.topCategories.length === 0) {
      container.innerHTML = `<p class="text-xs text-gray-400 p-3">No categories found.</p>`;
      return;
    }

    container.innerHTML = `
      <a href="javascript:void(0)" onclick="Store.filterByCategory(null)" class="block px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-[#E6F0DC] dark:hover:bg-[#1a2a16] hover:text-[#55883B] transition-colors rounded-md mx-1">
        All Categories
      </a>
      ${this.topCategories.map(c => `
        <a href="javascript:void(0)" onclick="Store.filterByCategory(${c.id}, '${c.categoryName}')" class="block px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-[#E6F0DC] dark:hover:bg-[#1a2a16] hover:text-[#55883B] transition-colors rounded-md mx-1">
          ${c.categoryName}
        </a>
      `).join('')}
    `;
  },

  renderCategoryFilterPills() {
    const container = document.getElementById('categoryFilterPills');
    if (!container) return;

    container.innerHTML = `
      <button 
        type="button" 
        onclick="Store.filterByCategory(null)" 
        class="category-pill text-xs font-semibold px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 ${!this.activeCategoryId ? 'active bg-[#55883B] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}">
        All Items
      </button>
      ${this.topCategories.map(c => `
        <button 
          type="button" 
          onclick="Store.filterByCategory(${c.id}, '${c.categoryName}')" 
          class="category-pill text-xs font-medium px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 ${this.activeCategoryId === c.id ? 'active bg-[#55883B] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}">
          ${c.categoryName}
        </button>
      `).join('')}
    `;
  },

  async filterByCategory(categoryId, categoryName = null) {
    this.activeCategoryId = categoryId;
    this.activeCategoryName = categoryName;
    this.currentPage = 1;
    this.renderCategoryFilterPills();
    
    // Smooth scroll to products section
    const sec = document.getElementById('productsSection');
    if (sec) sec.scrollIntoView({ behavior: 'smooth' });

    await this.loadProducts();
  },

  /**
   * Products Loading & Filtering
   */
  async loadProducts() {
    const grid = document.getElementById('productsGrid');
    const headerTitle = document.getElementById('productsSectionTitle');
    const headerDesc = document.getElementById('productsSectionDesc');

    if (grid) {
      grid.innerHTML = Loader.productGridSkeletons(8);
    }

    try {
      let data = [];
      if (this.searchKeyword) {
        data = await ProductsAPI.search(this.searchKeyword);
        if (headerTitle) headerTitle.textContent = `Search Results for "${this.searchKeyword}"`;
        if (headerDesc) headerDesc.textContent = `Found ${data.length} product(s) matching your search query.`;
      } else if (this.activeCategoryId) {
        data = await ProductsAPI.getByCategory(this.activeCategoryId);
        if (headerTitle) headerTitle.textContent = this.activeCategoryName ? `${this.activeCategoryName} Collection` : 'Category Products';
        if (headerDesc) headerDesc.textContent = `Showing all fashion items in this collection.`;
      } else {
        data = await ProductsAPI.getAll();
        if (headerTitle) headerTitle.textContent = 'Featured Collection';
        if (headerDesc) headerDesc.textContent = 'Explore our curated apparel, footwear, and accessories crafted for timeless style.';
      }

      this.products = data || [];
      this.applySortingAndPagination();
    } catch (err) {
      if (grid) {
        grid.innerHTML = `
          <div class="col-span-full">
            ${EmptyState.renderError({
              title: 'Could not load products',
              message: ErrorHandler.format(err),
              retryHandlerName: 'Store.loadProducts'
            })}
          </div>
        `;
      }
    }
  },

  handleSearchInput: debounce(async (event) => {
    const keyword = event.target.value.trim();
    Store.searchKeyword = keyword;
    Store.currentPage = 1;

    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) {
      if (keyword) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }

    await Store.loadProducts();
  }, 350),

  clearSearch() {
    this.searchKeyword = '';
    const input = document.getElementById('navbarSearchInput');
    if (input) input.value = '';
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) clearBtn.classList.add('hidden');
    this.loadProducts();
  },

  handleSortChange(sortBy) {
    this.sortBy = sortBy;
    this.applySortingAndPagination();
  },

  applySortingAndPagination() {
    let list = [...this.products];

    // Sorting
    switch (this.sortBy) {
      case 'price-asc':
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name-asc':
        list.sort((a, b) => (a.productName || '').localeCompare(b.productName || ''));
        break;
      default:
        // Default order
        break;
    }

    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIdx = (this.currentPage - 1) * this.pageSize;
    const paginatedList = list.slice(startIdx, startIdx + this.pageSize);

    this.renderProductsGrid(paginatedList, totalItems, totalPages);
  },

  renderProductsGrid(items, totalCount, totalPages) {
    const grid = document.getElementById('productsGrid');
    const paginationContainer = document.getElementById('productsPagination');
    const countLabel = document.getElementById('productsCountLabel');

    if (countLabel) {
      countLabel.textContent = `Showing ${items.length} of ${totalCount} items`;
    }

    if (!grid) return;

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full">
          ${EmptyState.render({
            icon: 'fa-solid fa-shirt',
            title: 'No products found',
            description: this.searchKeyword 
              ? `No items match your search for "${this.searchKeyword}". Try checking for typos or browse categories.`
              : 'There are currently no products available in this category.',
            actionText: 'View All Products',
            actionHandler: () => { Store.clearSearch(); Store.filterByCategory(null); }
          })}
        </div>
      `;
      document.getElementById('emptyStateActionBtn')?.addEventListener('click', () => {
        Store.clearSearch();
        Store.filterByCategory(null);
      });
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    grid.innerHTML = items.map(p => ProductCard.render(p)).join('');

    if (paginationContainer) {
      paginationContainer.innerHTML = Pagination.render({
        currentPage: this.currentPage,
        totalPages,
        onPageChange: 'Store.changePage'
      });
    }
  },

  changePage(newPage) {
    this.currentPage = newPage;
    this.applySortingAndPagination();
    const sec = document.getElementById('productsSection');
    if (sec) sec.scrollIntoView({ behavior: 'smooth' });
  },

  viewProductDetails(productId) {
    Modal.openProduct(productId);
  },

  /**
   * Hero Banner Section
   */
  renderHero() {
    const container = document.getElementById('heroContainer');
    if (!container) return;

    container.innerHTML = `
      <section class="hero-banner pt-12 pb-16 md:py-20 border-b border-gray-200 dark:border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <!-- Left Headline & Call to action -->
            <div class="lg:col-span-7 space-y-6 text-left">
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xs text-xs font-bold text-[#55883B] dark:text-[#a8e090] border border-[#C1E899]/60 shadow-xs">
                <i class="fa-solid fa-sparkles"></i>
                <span>Fresh Modern Elegance • Spring Edition</span>
              </div>

              <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.1]">
                Find Your <br />
                <span class="text-[#55883B] dark:text-[#79bf54]">Everyday Confidence</span>
              </h1>

              <p class="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
                Discover refined apparel, footwear, and accessories tailored with premium fabrics and authentic craftsmanship. Elevate your wardrobe effortlessly.
              </p>

              <div class="flex flex-wrap items-center gap-4 pt-2">
                <a href="#productsSection" class="btn-primary py-3 px-6 text-sm font-semibold shadow-md">
                  Shop Collection <i class="fa-solid fa-arrow-right ml-1"></i>
                </a>
                <button onclick="Store.filterByCategory(null)" class="btn-secondary py-3 px-6 text-sm font-semibold">
                  Browse All Categories
                </button>
              </div>

              <!-- Trust Stats -->
              <div class="pt-6 grid grid-cols-3 gap-6 border-t border-gray-300/40 dark:border-gray-700/60 max-w-lg">
                <div>
                  <p class="text-xl font-extrabold text-gray-900 dark:text-white">100%</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Authentic Designs</p>
                </div>
                <div>
                  <p class="text-xl font-extrabold text-gray-900 dark:text-white">Fast</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Express Delivery</p>
                </div>
                <div>
                  <p class="text-xl font-extrabold text-gray-900 dark:text-white">30-Day</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Easy Returns</p>
                </div>
              </div>
            </div>

            <!-- Right Visual Image Area -->
            <div class="lg:col-span-5 relative">
              <div class="relative mx-auto max-w-md rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80" 
                  alt="SpringShop Fashion Model"
                  class="w-full h-full object-cover aspect-4/5"
                />
                <div class="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-white/40 dark:border-gray-700/40 shadow-lg flex items-center justify-between">
                  <div>
                    <span class="text-[11px] font-bold uppercase tracking-wider text-[#55883B] block">Trending Now</span>
                    <span class="text-sm font-bold text-gray-900 dark:text-white">Linen Blend Jacket</span>
                  </div>
                  <span class="text-sm font-black text-[#55883B] dark:text-[#79bf54]">$89.00</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    `;
  },

  /**
   * Homepage Reviews Section
   */
  renderReviewsSection() {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;

    container.innerHTML = `
      <section id="reviewsSection" class="py-16 bg-[#E6F0DC]/40 dark:bg-[#151c15] border-t border-b border-gray-200 dark:border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-12">
            <span class="text-xs font-bold uppercase tracking-wider text-[#55883B] dark:text-[#79bf54]">Loved by Customers</span>
            <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">What Our Shoppers Say</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              SpringShop combines sustainable fabrics, premium tailoring, and fast doorstep delivery.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div>
                <div class="flex items-center text-amber-400 text-sm mb-3">
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  "The quality of the cotton trench coat exceeded my expectations. Elegant cut and it fits like a glove!"
                </p>
              </div>
              <div class="mt-6 flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div class="w-8 h-8 rounded-full bg-[#E6F0DC] text-[#55883B] font-bold text-xs flex items-center justify-center">E</div>
                <div>
                  <p class="text-xs font-bold text-gray-900 dark:text-white">Elena Vance</p>
                  <p class="text-[10px] text-gray-400">Verified Buyer</p>
                </div>
              </div>
            </div>

            <div class="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div>
                <div class="flex items-center text-amber-400 text-sm mb-3">
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  "Fast shipping and responsive customer service. The leather shoulder bag has become my daily staple."
                </p>
              </div>
              <div class="mt-6 flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div class="w-8 h-8 rounded-full bg-[#E6F0DC] text-[#55883B] font-bold text-xs flex items-center justify-center">M</div>
                <div>
                  <p class="text-xs font-bold text-gray-900 dark:text-white">Marcus Sterling</p>
                  <p class="text-[10px] text-gray-400">Verified Buyer</p>
                </div>
              </div>
            </div>

            <div class="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div>
                <div class="flex items-center text-amber-400 text-sm mb-3">
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  "Love the neutral earthy colors and minimalist design. SpringShop is now my first stop for seasonal updates."
                </p>
              </div>
              <div class="mt-6 flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div class="w-8 h-8 rounded-full bg-[#E6F0DC] text-[#55883B] font-bold text-xs flex items-center justify-center">S</div>
                <div>
                  <p class="text-xs font-bold text-gray-900 dark:text-white">Sophia Lauren</p>
                  <p class="text-[10px] text-gray-400">Verified Buyer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  /**
   * Footer
   */
  renderFooter() {
    const container = document.getElementById('footerContainer');
    if (container) {
      container.innerHTML = Footer.render();
    }
  },

  /**
   * Floating Back to Top Button
   */
  initScrollToTop() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
};

window.Store = Store;
