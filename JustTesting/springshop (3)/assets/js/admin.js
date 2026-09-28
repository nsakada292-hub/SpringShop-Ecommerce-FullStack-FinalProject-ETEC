/**
 * Admin Dashboard Controller
 * Manages dashboard analytics, products CRUD, categories CRUD, orders, users, reviews, and settings
 */
const Admin = {
  activeTab: 'dashboard',
  products: [],
  categories: [],
  orders: [],
  users: [],
  reviews: [],
  selectedCategoryFilter: '',
  searchQuery: '',
  notifications: [
    { id: 1, title: 'System Ready', text: 'SpringShop backend REST API connection initialized.', time: 'Just now', icon: 'fa-circle-check text-emerald-500' }
  ],

  /**
   * Initialize Admin Application
   */
  async init() {
    // 1. Theme
    Store.initTheme();

    // 2. Auth Protection Check
    if (!AuthGuard.requireAdmin('index.html')) {
      return;
    }

    // 3. Render base chrome (Sidebar, Topbar)
    this.renderChrome();

    // 4. Load initial tab
    await this.switchTab('dashboard');
  },

  /**
   * Render Topbar and Sidebar Navigation
   */
  renderChrome() {
    const user = AuthGuard.getUser();
    const isDark = document.documentElement.classList.contains('dark');

    // Sidebar
    const sidebarContainer = document.getElementById('adminSidebarContainer');
    if (sidebarContainer) {
      sidebarContainer.innerHTML = `
        <aside class="admin-sidebar bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen sticky top-0 z-30">
          <!-- Brand -->
          <div class="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <a href="admin.html" class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-[#55883B] text-white flex items-center justify-center font-bold text-base">S</div>
              <div>
                <span class="text-base font-extrabold text-gray-900 dark:text-white block leading-tight">Spring<span class="text-[#55883B]">Shop</span></span>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Admin Portal</span>
              </div>
            </a>
            <button onclick="Admin.toggleMobileSidebar()" class="lg:hidden text-gray-500 hover:text-gray-700">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <!-- Navigation Links -->
          <nav class="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-medium">
            <button onclick="Admin.switchTab('dashboard')" class="admin-nav-item w-full ${this.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
              <i class="fa-solid fa-chart-pie w-5 text-center"></i>
              <span>Dashboard</span>
            </button>

            <button onclick="Admin.switchTab('products')" class="admin-nav-item w-full ${this.activeTab === 'products' ? 'active' : ''}" data-tab="products">
              <i class="fa-solid fa-shirt w-5 text-center"></i>
              <span>Products</span>
            </button>

            <button onclick="Admin.switchTab('categories')" class="admin-nav-item w-full ${this.activeTab === 'categories' ? 'active' : ''}" data-tab="categories">
              <i class="fa-solid fa-layer-group w-5 text-center"></i>
              <span>Categories</span>
            </button>

            <button onclick="Admin.switchTab('orders')" class="admin-nav-item w-full ${this.activeTab === 'orders' ? 'active' : ''}" data-tab="orders">
              <i class="fa-solid fa-box-archive w-5 text-center"></i>
              <span>Orders</span>
            </button>

            <button onclick="Admin.switchTab('users')" class="admin-nav-item w-full ${this.activeTab === 'users' ? 'active' : ''}" data-tab="users">
              <i class="fa-solid fa-users w-5 text-center"></i>
              <span>Customers & Users</span>
            </button>

            <button onclick="Admin.switchTab('reviews')" class="admin-nav-item w-full ${this.activeTab === 'reviews' ? 'active' : ''}" data-tab="reviews">
              <i class="fa-solid fa-star w-5 text-center"></i>
              <span>Reviews & Ratings</span>
            </button>

            <button onclick="Admin.switchTab('settings')" class="admin-nav-item w-full ${this.activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
              <i class="fa-solid fa-gear w-5 text-center"></i>
              <span>Store Settings</span>
            </button>

            <div class="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
              <a href="index.html" class="admin-nav-item w-full text-[#55883B] dark:text-[#79bf54]">
                <i class="fa-solid fa-store w-5 text-center"></i>
                <span>View Storefront</span>
              </a>
            </div>
          </nav>

          <!-- User footer in sidebar -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 flex items-center justify-between">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-full bg-[#E6F0DC] text-[#55883B] font-bold text-xs flex items-center justify-center flex-shrink-0">
                ${user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-gray-900 dark:text-white truncate">${user?.name || 'Administrator'}</p>
                <p class="text-[10px] text-gray-500 truncate">${user?.email || ''}</p>
              </div>
            </div>
            <button onclick="AuthAPI.logout(); window.location.href='index.html';" class="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg" title="Sign Out">
              <i class="fa-solid fa-right-from-bracket text-xs"></i>
            </button>
          </div>
        </aside>
      `;
    }

    // Topbar
    const topbarContainer = document.getElementById('adminTopbarContainer');
    if (topbarContainer) {
      topbarContainer.innerHTML = `
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 px-4 sm:px-6 py-3">
          <div class="flex items-center justify-between gap-4">
            
            <div class="flex items-center gap-3">
              <button onclick="Admin.toggleMobileSidebar()" class="lg:hidden text-gray-600 dark:text-gray-300 w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <i class="fa-solid fa-bars"></i>
              </button>
              <h1 id="adminPageHeaderTitle" class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Dashboard Overview
              </h1>
            </div>

            <!-- Topbar Actions -->
            <div class="flex items-center gap-3">
              <!-- Dark / Light Theme -->
              <button onclick="Store.toggleTheme()" class="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors" title="Toggle Theme">
                <i class="fa-solid ${isDark ? 'fa-sun text-amber-400' : 'fa-moon'} text-sm"></i>
              </button>

              <!-- Notifications Menu -->
              <div class="relative group">
                <button class="relative w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors">
                  <i class="fa-regular fa-bell text-base"></i>
                  <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
                </button>
                <div class="absolute right-0 top-full w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-3 hidden group-hover:block animate-fade-in z-50">
                  <div class="px-4 pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span class="text-xs font-bold text-gray-900 dark:text-white">Notifications</span>
                    <span class="text-[10px] text-gray-400">Session logs</span>
                  </div>
                  <div class="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                    ${this.notifications.map(n => `
                      <div class="p-3 text-xs flex items-start gap-2.5">
                        <i class="fa-solid ${n.icon} text-sm mt-0.5"></i>
                        <div>
                          <p class="font-semibold text-gray-800 dark:text-gray-200">${n.title}</p>
                          <p class="text-gray-500 text-[11px]">${n.text}</p>
                          <span class="text-[10px] text-gray-400 mt-1 block">${n.time}</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Admin Profile Pill -->
              <div class="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-800">
                <div class="text-right">
                  <p class="text-xs font-bold text-gray-900 dark:text-white leading-tight">${user?.name || 'Administrator'}</p>
                  <span class="text-[10px] text-emerald-600 font-semibold uppercase">Admin Active</span>
                </div>
                <div class="w-8 h-8 rounded-full bg-[#55883B] text-white font-bold text-xs flex items-center justify-center">
                  ${user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
              </div>
            </div>

          </div>
        </header>
      `;
    }
  },

  toggleMobileSidebar() {
    const sidebar = document.getElementById('adminSidebarContainer');
    if (sidebar) {
      sidebar.classList.toggle('hidden');
    }
  },

  /**
   * Switch Active Admin Tab
   */
  async switchTab(tabName) {
    this.activeTab = tabName;

    // Update active nav items
    document.querySelectorAll('.admin-nav-item').forEach(el => {
      if (el.getAttribute('data-tab') === tabName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Update page header title
    const titles = {
      dashboard: 'Dashboard Overview',
      products: 'Product Management',
      categories: 'Category Management',
      orders: 'Order Management',
      users: 'Customer & User Management',
      reviews: 'Reviews & Feedback',
      settings: 'Store Settings'
    };
    const titleEl = document.getElementById('adminPageHeaderTitle');
    if (titleEl) titleEl.textContent = titles[tabName] || 'Admin';

    const contentEl = document.getElementById('adminMainContent');
    if (!contentEl) return;

    contentEl.innerHTML = Loader.spinner(`Loading ${tabName}...`);

    switch (tabName) {
      case 'dashboard':
        await this.renderDashboardTab(contentEl);
        break;
      case 'products':
        await this.renderProductsTab(contentEl);
        break;
      case 'categories':
        await this.renderCategoriesTab(contentEl);
        break;
      case 'orders':
        await this.renderOrdersTab(contentEl);
        break;
      case 'users':
        await this.renderUsersTab(contentEl);
        break;
      case 'reviews':
        await this.renderReviewsTab(contentEl);
        break;
      case 'settings':
        this.renderSettingsTab(contentEl);
        break;
    }
  },

  /**
   * Tab 1: Dashboard Home Overview
   */
  async renderDashboardTab(container) {
    try {
      const [products, orders, users, categories] = await Promise.all([
        ProductsAPI.getAll().catch(() => []),
        OrdersAPI.getAll().catch(() => []),
        UsersAPI.getAll().catch(() => []),
        CategoriesAPI.getAll().catch(() => [])
      ]);

      this.products = products || [];
      this.orders = orders || [];
      this.users = users || [];
      this.categories = categories || [];

      const pendingOrders = this.orders.filter(o => o.status === 'PENDING').length;
      
      // Calculate total order revenue safely from backend orders list
      const totalRevenue = this.orders.reduce((sum, o) => {
        if (o.status !== 'CANCELLED' && o.totalAmount) {
          return sum + Number(o.totalAmount);
        }
        return sum;
      }, 0);

      container.innerHTML = `
        <div class="space-y-8 animate-fade-in">
          
          <!-- KPI Stats Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div class="admin-card flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Products</p>
                <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">${this.products.length}</p>
                <span class="text-[11px] text-[#55883B] font-medium mt-1 inline-block">Across ${this.categories.length} Categories</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-[#E6F0DC] text-[#55883B] dark:bg-[#1a2a16] dark:text-[#79bf54] flex items-center justify-center text-xl">
                <i class="fa-solid fa-shirt"></i>
              </div>
            </div>

            <div class="admin-card flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Orders</p>
                <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">${this.orders.length}</p>
                <span class="text-[11px] text-amber-600 font-semibold mt-1 inline-block">${pendingOrders} Pending Fulfillment</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 flex items-center justify-center text-xl">
                <i class="fa-solid fa-box-archive"></i>
              </div>
            </div>

            <div class="admin-card flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registered Users</p>
                <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">${this.users.length}</p>
                <span class="text-[11px] text-blue-600 font-medium mt-1 inline-block">Verified User Accounts</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 flex items-center justify-center text-xl">
                <i class="fa-solid fa-users"></i>
              </div>
            </div>

            <div class="admin-card flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gross Orders Volume</p>
                <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">${Formatter.currency(totalRevenue)}</p>
                <span class="text-[11px] text-emerald-600 font-medium mt-1 inline-block">From Active Backend Orders</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 flex items-center justify-center text-xl">
                <i class="fa-solid fa-dollar-sign"></i>
              </div>
            </div>

          </div>

          <!-- Recent Orders and Quick Actions -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Recent Orders (2 cols) -->
            <div class="lg:col-span-2 admin-card space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <h3 class="text-base font-bold text-gray-900 dark:text-white">Recent Customer Orders</h3>
                <button onclick="Admin.switchTab('orders')" class="text-xs text-[#55883B] font-semibold hover:underline">
                  View All Orders &rarr;
                </button>
              </div>

              ${this.orders.length === 0 ? `
                <p class="text-xs text-gray-400 py-6 text-center">No orders have been recorded in the database yet.</p>
              ` : `
                <div class="admin-table-container">
                  <table class="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this.orders.slice(0, 5).map(o => {
                        const status = Formatter.orderStatus(o.status);
                        return `
                          <tr>
                            <td class="font-bold text-gray-900 dark:text-white">#${o.id}</td>
                            <td>${Formatter.date(o.orderDate)}</td>
                            <td class="font-bold text-[#55883B]">${Formatter.currency(o.totalAmount)}</td>
                            <td><span class="status-badge ${status.className}">${status.label}</span></td>
                            <td>
                              <button onclick="Admin.openOrderStatusModal(${o.id}, '${o.status}')" class="text-xs text-[#55883B] font-semibold hover:underline">
                                Manage
                              </button>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>

            <!-- Quick Management Shortcuts -->
            <div class="admin-card space-y-4">
              <h3 class="text-base font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
                Quick Actions
              </h3>
              
              <div class="space-y-2.5">
                <button onclick="Admin.openAddProductModal()" class="w-full btn-primary py-2.5 text-xs justify-start px-4">
                  <i class="fa-solid fa-plus w-4"></i> Add New Product
                </button>
                <button onclick="Admin.openAddCategoryModal()" class="w-full btn-secondary py-2.5 text-xs justify-start px-4">
                  <i class="fa-solid fa-folder-plus w-4"></i> Create Category
                </button>
                <button onclick="Admin.switchTab('orders')" class="w-full btn-outline py-2.5 text-xs justify-start px-4">
                  <i class="fa-solid fa-list-check w-4"></i> Review Pending Orders
                </button>
              </div>

              <div class="p-3 bg-[#E6F0DC]/60 dark:bg-[#1a2a16]/60 rounded-xl text-xs text-gray-700 dark:text-gray-300 mt-4 border border-[#C1E899]">
                <p class="font-bold text-[#55883B] mb-1"><i class="fa-solid fa-shield-halved mr-1"></i> Connected to Spring Boot</p>
                <p class="text-[11px] text-gray-600 dark:text-gray-400">All data operations communicate via authenticated JWT REST endpoints.</p>
              </div>
            </div>

          </div>

        </div>
      `;
    } catch (err) {
      container.innerHTML = EmptyState.renderError({
        title: 'Could not load dashboard',
        message: ErrorHandler.format(err),
        retryHandlerName: "() => Admin.switchTab('dashboard')"
      });
    }
  },

  /**
   * Tab 2: Products Management
   */
  async renderProductsTab(container) {
    try {
      const [products, categories] = await Promise.all([
        ProductsAPI.getAll(),
        CategoriesAPI.getAll()
      ]);
      this.products = products || [];
      this.categories = categories || [];

      container.innerHTML = `
        <div class="space-y-6 animate-fade-in">
          
          <!-- Top Bar: Filter & Add Product -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3 flex-1">
              <div class="relative flex-1 max-w-xs">
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input 
                  type="text" 
                  id="adminProductSearchInput" 
                  placeholder="Filter products..." 
                  class="form-input pl-8 py-2 text-xs" 
                  oninput="Admin.filterProductTable()" 
                />
              </div>

              <select id="adminProductCategoryFilter" class="form-input py-2 text-xs max-w-xs" onchange="Admin.filterProductTable()">
                <option value="">All Categories</option>
                ${this.categories.map(c => `<option value="${c.id}">${c.categoryName}</option>`).join('')}
              </select>
            </div>

            <button onclick="Admin.openAddProductModal()" class="btn-primary py-2.5 px-4 text-xs font-semibold">
              <i class="fa-solid fa-plus mr-1"></i> Add Product
            </button>
          </div>

          <!-- Product Table -->
          <div class="admin-card">
            <div class="admin-table-container">
              <table class="admin-table" id="adminProductsTable">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Size/Color</th>
                    <th>Material</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="adminProductsTableBody">
                  ${this.renderProductRows(this.products)}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      `;
    } catch (err) {
      container.innerHTML = EmptyState.renderError({
        title: 'Could not load products',
        message: ErrorHandler.format(err),
        retryHandlerName: "() => Admin.switchTab('products')"
      });
    }
  },

  renderProductRows(list) {
    if (!list || list.length === 0) {
      return `<tr><td colspan="7" class="text-center py-8 text-xs text-gray-400">No products found.</td></tr>`;
    }
    return list.map(p => `
      <tr id="admin-row-product-${p.id}">
        <td>
          <div class="flex items-center gap-3">
            <img 
              src="${p.image || CONFIG.PLACEHOLDER_PRODUCT_IMAGE}" 
              alt="${p.productName}"
              class="w-10 h-12 object-cover rounded-md bg-gray-100 dark:bg-gray-800"
              onerror="this.onerror=null; this.src='${CONFIG.PLACEHOLDER_PRODUCT_IMAGE}';"
            />
            <div>
              <p class="font-bold text-gray-900 dark:text-white leading-tight">${p.productName}</p>
              <span class="text-[11px] text-gray-400">ID: #${p.id}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[11px] font-semibold">
            ${p.category?.categoryName || '—'}
          </span>
        </td>
        <td class="font-bold text-[#55883B]">${Formatter.currency(p.price)}</td>
        <td>
          <span class="px-2 py-0.5 rounded-md text-[11px] font-bold ${p.stockQuantity <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
            ${p.stockQuantity !== undefined ? p.stockQuantity : '—'} units
          </span>
        </td>
        <td class="text-xs text-gray-600 dark:text-gray-400">
          ${p.size || '—'} / ${p.color || '—'}
        </td>
        <td class="text-xs text-gray-600 dark:text-gray-400">${p.material || '—'}</td>
        <td>
          <div class="flex items-center gap-2">
            <button onclick="Admin.openEditProductModal(${p.id})" class="text-xs text-blue-600 hover:text-blue-800 p-1 font-medium" title="Edit">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button onclick="Admin.deleteProduct(${p.id}, '${p.productName.replace(/'/g, "\\'")}')" class="text-xs text-rose-600 hover:text-rose-800 p-1 font-medium" title="Delete">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  filterProductTable() {
    const keyword = document.getElementById('adminProductSearchInput')?.value?.toLowerCase().trim() || '';
    const catId = document.getElementById('adminProductCategoryFilter')?.value;

    let filtered = this.products.filter(p => {
      const matchesKeyword = !keyword || (p.productName && p.productName.toLowerCase().includes(keyword));
      const matchesCat = !catId || (p.category && String(p.category.id) === String(catId));
      return matchesKeyword && matchesCat;
    });

    const tbody = document.getElementById('adminProductsTableBody');
    if (tbody) {
      tbody.innerHTML = this.renderProductRows(filtered);
    }
  },

  openAddProductModal() {
    const container = Modal.init();
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto" id="adminModalOverlay">
        <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 relative my-8 animate-fade-in" onclick="event.stopPropagation()">
          <button onclick="Modal.close()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>

          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-1">Create New Product</h2>
          <p class="text-xs text-gray-500 mb-6">Fills multipart/form-data for Spring Boot ProductController</p>

          <div id="adminProductFormError" class="hidden mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-600 dark:text-rose-400"></div>

          <form onsubmit="Admin.handleCreateProduct(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Product Name <span class="text-rose-500">*</span></label>
              <input type="text" id="prodName" required placeholder="e.g. Classic Trench Coat" class="form-input text-xs" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Price ($) <span class="text-rose-500">*</span></label>
                <input type="number" step="0.01" id="prodPrice" required placeholder="49.99" class="form-input text-xs" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Stock Quantity <span class="text-rose-500">*</span></label>
                <input type="number" id="prodStock" required placeholder="50" class="form-input text-xs" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category <span class="text-rose-500">*</span></label>
              <select id="prodCategory" required class="form-input text-xs">
                <option value="">Select Category</option>
                ${this.categories.map(c => `<option value="${c.id}">${c.categoryName}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea id="prodDesc" rows="3" placeholder="Detailed product description..." class="form-input text-xs"></textarea>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Size</label>
                <input type="text" id="prodSize" placeholder="S, M, L, XL" class="form-input text-xs" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Color</label>
                <input type="text" id="prodColor" placeholder="Olive, Beige" class="form-input text-xs" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Material</label>
                <input type="text" id="prodMaterial" placeholder="100% Linen" class="form-input text-xs" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Product Image File <span class="text-rose-500">*</span></label>
              <input type="file" id="prodFile" accept="image/*" required class="form-input text-xs file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#55883B] file:text-white hover:file:bg-[#456f30]" />
            </div>

            <div class="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button type="button" onclick="Modal.close()" class="btn-outline py-2 px-4 text-xs">Cancel</button>
              <button type="submit" id="saveProdBtn" class="btn-primary py-2 px-5 text-xs font-semibold">Save Product</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('adminModalOverlay').onclick = (e) => {
      if (e.target.id === 'adminModalOverlay') Modal.close();
    };
  },

  async handleCreateProduct(e) {
    e.preventDefault();
    const btn = document.getElementById('saveProdBtn');
    const errBox = document.getElementById('adminProductFormError');

    const fileInput = document.getElementById('prodFile');
    if (!fileInput.files || fileInput.files.length === 0) {
      errBox.textContent = 'Please select a product image file.';
      errBox.classList.remove('hidden');
      return;
    }

    const formData = new FormData();
    formData.append('productName', document.getElementById('prodName').value.trim());
    formData.append('price', document.getElementById('prodPrice').value);
    formData.append('stockQuantity', document.getElementById('prodStock').value);
    formData.append('categoryId', document.getElementById('prodCategory').value);
    formData.append('description', document.getElementById('prodDesc').value.trim());
    formData.append('size', document.getElementById('prodSize').value.trim());
    formData.append('color', document.getElementById('prodColor').value.trim());
    formData.append('material', document.getElementById('prodMaterial').value.trim());
    formData.append('file', fileInput.files[0]);

    try {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-1"></i> Uploading...';
      errBox.classList.add('hidden');

      await ProductsAPI.create(formData);
      Toast.success('Product created successfully!');
      Modal.close();
      await this.switchTab('products');
    } catch (err) {
      errBox.textContent = ErrorHandler.format(err);
      errBox.classList.remove('hidden');
      btn.disabled = false;
      btn.innerHTML = 'Save Product';
    }
  },

  async openEditProductModal(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const container = Modal.init();
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto" id="adminModalOverlay">
        <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 relative my-8 animate-fade-in" onclick="event.stopPropagation()">
          <button onclick="Modal.close()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>

          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-1">Edit Product #${product.id}</h2>
          <p class="text-xs text-gray-500 mb-6">Update product details and optional new image</p>

          <div id="adminProductFormError" class="hidden mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-600 dark:text-rose-400"></div>

          <form onsubmit="Admin.handleUpdateProduct(event, ${product.id})" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
              <input type="text" id="editProdName" required value="${product.productName || ''}" class="form-input text-xs" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
                <input type="number" step="0.01" id="editProdPrice" required value="${product.price || ''}" class="form-input text-xs" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Stock Quantity</label>
                <input type="number" id="editProdStock" required value="${product.stockQuantity || 0}" class="form-input text-xs" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select id="editProdCategory" required class="form-input text-xs">
                ${this.categories.map(c => `
                  <option value="${c.id}" ${product.category?.id === c.id ? 'selected' : ''}>${c.categoryName}</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea id="editProdDesc" rows="3" class="form-input text-xs">${product.description || ''}</textarea>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Size</label>
                <input type="text" id="editProdSize" value="${product.size || ''}" class="form-input text-xs" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Color</label>
                <input type="text" id="editProdColor" value="${product.color || ''}" class="form-input text-xs" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Material</label>
                <input type="text" id="editProdMaterial" value="${product.material || ''}" class="form-input text-xs" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Replace Image (Optional)</label>
              <input type="file" id="editProdFile" accept="image/*" class="form-input text-xs file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#55883B] file:text-white" />
            </div>

            <div class="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button type="button" onclick="Modal.close()" class="btn-outline py-2 px-4 text-xs">Cancel</button>
              <button type="submit" id="updateProdBtn" class="btn-primary py-2 px-5 text-xs font-semibold">Update Product</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async handleUpdateProduct(e, productId) {
    e.preventDefault();
    const btn = document.getElementById('updateProdBtn');
    const errBox = document.getElementById('adminProductFormError');

    const formData = new FormData();
    formData.append('productName', document.getElementById('editProdName').value.trim());
    formData.append('price', document.getElementById('editProdPrice').value);
    formData.append('stockQuantity', document.getElementById('editProdStock').value);
    formData.append('categoryId', document.getElementById('editProdCategory').value);
    formData.append('description', document.getElementById('editProdDesc').value.trim());
    formData.append('size', document.getElementById('editProdSize').value.trim());
    formData.append('color', document.getElementById('editProdColor').value.trim());
    formData.append('material', document.getElementById('editProdMaterial').value.trim());

    const fileInput = document.getElementById('editProdFile');
    if (fileInput.files && fileInput.files.length > 0) {
      formData.append('file', fileInput.files[0]);
    }

    try {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-1"></i> Saving...';
      errBox.classList.add('hidden');

      await ProductsAPI.update(productId, formData);
      Toast.success('Product updated successfully!');
      Modal.close();
      await this.switchTab('products');
    } catch (err) {
      errBox.textContent = ErrorHandler.format(err);
      errBox.classList.remove('hidden');
      btn.disabled = false;
      btn.innerHTML = 'Update Product';
    }
  },

  async deleteProduct(productId, productName) {
    Confirmation.open({
      title: 'Delete Product?',
      message: `Are you sure you want to delete "${productName}" (ID #${productId})? This action cannot be undone.`,
      confirmText: 'Yes, Delete Product',
      confirmType: 'danger',
      onConfirm: async () => {
        try {
          await ProductsAPI.delete(productId);
          Toast.info('Product deleted.');
          await this.switchTab('products');
        } catch (err) {
          Toast.error(ErrorHandler.format(err));
        }
      }
    });
  },

  /**
   * Tab 3: Categories Management
   */
  async renderCategoriesTab(container) {
    try {
      const categories = await CategoriesAPI.getAll();
      this.categories = categories || [];

      container.innerHTML = `
        <div class="space-y-6 animate-fade-in">
          
          <div class="flex items-center justify-between">
            <p class="text-xs text-gray-500">Manage hierarchical categories for the SpringShop catalog</p>
            <button onclick="Admin.openAddCategoryModal()" class="btn-primary py-2 px-4 text-xs font-semibold">
              <i class="fa-solid fa-plus mr-1"></i> Add Category
            </button>
          </div>

          <div class="admin-card">
            <div class="admin-table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Parent Category</th>
                    <th>Description</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.categories.length === 0 ? `
                    <tr><td colspan="5" class="text-center py-6 text-xs text-gray-400">No categories created yet.</td></tr>
                  ` : this.categories.map(c => {
                    const parent = this.categories.find(p => p.id === c.parentCategoryId);
                    return `
                      <tr>
                        <td class="font-bold text-gray-900 dark:text-white">
                          ${c.categoryName} <span class="text-gray-400 font-normal text-xs">(#${c.id})</span>
                        </td>
                        <td>
                          ${parent ? `<span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">${parent.categoryName}</span>` : '<span class="text-xs text-gray-400">Top-Level</span>'}
                        </td>
                        <td class="text-xs text-gray-600 dark:text-gray-300">${c.description || '—'}</td>
                        <td class="text-xs text-gray-500">${Formatter.date(c.createdAt)}</td>
                        <td>
                          <div class="flex items-center gap-2">
                            <button onclick="Admin.openEditCategoryModal(${c.id})" class="text-xs text-blue-600 hover:text-blue-800 p-1" title="Edit">
                              <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button onclick="Admin.deleteCategory(${c.id}, '${c.categoryName.replace(/'/g, "\\'")}')" class="text-xs text-rose-600 hover:text-rose-800 p-1" title="Delete">
                              <i class="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      `;
    } catch (err) {
      container.innerHTML = EmptyState.renderError({
        title: 'Could not load categories',
        message: ErrorHandler.format(err),
        retryHandlerName: "() => Admin.switchTab('categories')"
      });
    }
  },

  openAddCategoryModal() {
    const container = Modal.init();
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="adminModalOverlay">
        <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 relative animate-fade-in" onclick="event.stopPropagation()">
          <button onclick="Modal.close()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Create Category</h3>
          <p class="text-xs text-gray-500 mb-4">POST /api/categories endpoint</p>

          <form onsubmit="Admin.handleCreateCategory(event)" class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category Name <span class="text-rose-500">*</span></label>
              <input type="text" id="catNameInput" required placeholder="e.g. Footwear" class="form-input text-xs" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Parent Category (Optional)</label>
              <select id="catParentInput" class="form-input text-xs">
                <option value="">None (Top-Level Category)</option>
                ${this.categories.map(c => `<option value="${c.id}">${c.categoryName}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea id="catDescInput" rows="2" placeholder="Brief category description..." class="form-input text-xs"></textarea>
            </div>

            <div class="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
              <button type="button" onclick="Modal.close()" class="btn-outline py-1.5 px-3 text-xs">Cancel</button>
              <button type="submit" id="saveCatBtn" class="btn-primary py-1.5 px-4 text-xs font-semibold">Save Category</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async handleCreateCategory(e) {
    e.preventDefault();
    const name = document.getElementById('catNameInput').value.trim();
    const parentIdVal = document.getElementById('catParentInput').value;
    const parentCategoryId = parentIdVal ? Number(parentIdVal) : null;
    const description = document.getElementById('catDescInput').value.trim();

    try {
      await CategoriesAPI.create({ categoryName: name, parentCategoryId, description });
      Toast.success('Category created successfully!');
      Modal.close();
      await this.switchTab('categories');
    } catch (err) {
      Toast.error(ErrorHandler.format(err));
    }
  },

  openEditCategoryModal(id) {
    const category = this.categories.find(c => c.id === id);
    if (!category) return;

    const container = Modal.init();
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="adminModalOverlay">
        <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 relative animate-fade-in" onclick="event.stopPropagation()">
          <button onclick="Modal.close()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Edit Category #${category.id}</h3>
          <p class="text-xs text-gray-500 mb-4">PUT /api/categories/${category.id}</p>

          <form onsubmit="Admin.handleUpdateCategory(event, ${category.id})" class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
              <input type="text" id="editCatName" required value="${category.categoryName || ''}" class="form-input text-xs" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Parent Category</label>
              <select id="editCatParent" class="form-input text-xs">
                <option value="">None (Top-Level Category)</option>
                ${this.categories.filter(c => c.id !== category.id).map(c => `
                  <option value="${c.id}" ${category.parentCategoryId === c.id ? 'selected' : ''}>${c.categoryName}</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea id="editCatDesc" rows="2" class="form-input text-xs">${category.description || ''}</textarea>
            </div>

            <div class="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
              <button type="button" onclick="Modal.close()" class="btn-outline py-1.5 px-3 text-xs">Cancel</button>
              <button type="submit" class="btn-primary py-1.5 px-4 text-xs font-semibold">Update Category</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async handleUpdateCategory(e, id) {
    e.preventDefault();
    const name = document.getElementById('editCatName').value.trim();
    const parentIdVal = document.getElementById('editCatParent').value;
    const parentCategoryId = parentIdVal ? Number(parentIdVal) : null;
    const description = document.getElementById('editCatDesc').value.trim();

    try {
      await CategoriesAPI.update(id, { categoryName: name, parentCategoryId, description });
      Toast.success('Category updated!');
      Modal.close();
      await this.switchTab('categories');
    } catch (err) {
      Toast.error(ErrorHandler.format(err));
    }
  },

  async deleteCategory(id, name) {
    Confirmation.open({
      title: 'Delete Category?',
      message: `Are you sure you want to delete category "${name}"?`,
      confirmText: 'Delete Category',
      confirmType: 'danger',
      onConfirm: async () => {
        try {
          await CategoriesAPI.delete(id);
          Toast.info('Category deleted.');
          await this.switchTab('categories');
        } catch (err) {
          Toast.error(ErrorHandler.format(err));
        }
      }
    });
  },

  /**
   * Tab 4: Orders Management
   */
  async renderOrdersTab(container) {
    try {
      const orders = await OrdersAPI.getAll();
      this.orders = orders || [];

      container.innerHTML = `
        <div class="space-y-6 animate-fade-in">
          
          <div class="flex items-center justify-between">
            <p class="text-xs text-gray-500">Live order fulfillment management via /api/orders/all</p>
            <span class="text-xs font-bold text-gray-700 dark:text-gray-300">Total: ${this.orders.length} orders</span>
          </div>

          <div class="admin-card">
            <div class="admin-table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Shipping Address</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.orders.length === 0 ? `
                    <tr><td colspan="8" class="text-center py-8 text-xs text-gray-400">No orders recorded.</td></tr>
                  ` : this.orders.map(o => {
                    const status = Formatter.orderStatus(o.status);
                    const itemCount = (o.items || []).reduce((s, it) => s + it.quantity, 0);

                    return `
                      <tr>
                        <td class="font-bold text-gray-900 dark:text-white">#${o.id}</td>
                        <td class="text-xs">User #${o.userId}</td>
                        <td class="text-xs text-gray-500">${Formatter.date(o.orderDate, true)}</td>
                        <td class="text-xs">
                          <span class="font-semibold">${itemCount} item(s)</span>
                          <span class="text-[11px] text-gray-400 block truncate max-w-[120px]">
                            ${(o.items || []).map(i => i.productName).join(', ')}
                          </span>
                        </td>
                        <td class="font-bold text-[#55883B]">${Formatter.currency(o.totalAmount)}</td>
                        <td class="text-xs text-gray-600 dark:text-gray-300 max-w-[180px] truncate" title="${o.shippingAddress}">
                          ${o.shippingAddress || '—'}
                        </td>
                        <td>
                          <span class="status-badge ${status.className}">
                            ${status.label}
                          </span>
                        </td>
                        <td>
                          <div class="flex items-center gap-2">
                            <button onclick="Admin.openOrderStatusModal(${o.id}, '${o.status}')" class="btn-primary py-1 px-2.5 text-[11px]" title="Update Status">
                              Status
                            </button>
                            ${o.status !== 'CANCELLED' && o.status !== 'DELIVERED' ? `
                              <button onclick="Admin.cancelOrder(${o.id})" class="text-xs text-rose-600 hover:text-rose-800 p-1" title="Cancel Order">
                                <i class="fa-solid fa-ban"></i>
                              </button>
                            ` : ''}
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      `;
    } catch (err) {
      container.innerHTML = EmptyState.renderError({
        title: 'Could not load orders',
        message: ErrorHandler.format(err),
        retryHandlerName: "() => Admin.switchTab('orders')"
      });
    }
  },

  openOrderStatusModal(orderId, currentStatus) {
    const container = Modal.init();
    const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="adminModalOverlay">
        <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 relative animate-fade-in" onclick="event.stopPropagation()">
          <button onclick="Modal.close()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <h3 class="text-base font-bold text-gray-900 dark:text-white mb-1">Update Order #${orderId} Status</h3>
          <p class="text-xs text-gray-500 mb-4">PUT /api/orders/${orderId}/status?status=...</p>

          <form onsubmit="Admin.handleUpdateOrderStatus(event, ${orderId})" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Order Status</label>
              <select id="newOrderStatusSelect" class="form-input text-xs">
                ${statuses.map(s => `
                  <option value="${s}" ${s === currentStatus ? 'selected' : ''}>${s}</option>
                `).join('')}
              </select>
            </div>

            <div class="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
              <button type="button" onclick="Modal.close()" class="btn-outline py-1.5 px-3 text-xs">Cancel</button>
              <button type="submit" class="btn-primary py-1.5 px-4 text-xs font-semibold">Save Status</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async handleUpdateOrderStatus(e, orderId) {
    e.preventDefault();
    const status = document.getElementById('newOrderStatusSelect').value;

    try {
      await OrdersAPI.updateStatus(orderId, status);
      Toast.success(`Order #${orderId} updated to ${status}`);
      Modal.close();
      await this.switchTab('orders');
    } catch (err) {
      Toast.error(ErrorHandler.format(err));
    }
  },

  async cancelOrder(orderId) {
    Confirmation.open({
      title: 'Cancel Order #' + orderId + '?',
      message: 'This will update order status to CANCELLED and restore item inventory in the backend database.',
      confirmText: 'Cancel Order',
      confirmType: 'danger',
      onConfirm: async () => {
        try {
          await OrdersAPI.cancelOrder(orderId);
          Toast.info(`Order #${orderId} cancelled.`);
          await this.switchTab('orders');
        } catch (err) {
          Toast.error(ErrorHandler.format(err));
        }
      }
    });
  },

  /**
   * Tab 5: Customers & User Management
   */
  async renderUsersTab(container) {
    try {
      const users = await UsersAPI.getAll();
      this.users = users || [];

      container.innerHTML = `
        <div class="space-y-6 animate-fade-in">
          
          <div class="flex items-center justify-between">
            <p class="text-xs text-gray-500">Registered system accounts via /api/users</p>
            <span class="text-xs font-bold text-gray-700 dark:text-gray-300">Total Users: ${this.users.length}</span>
          </div>

          <div class="admin-card">
            <div class="admin-table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.users.length === 0 ? `
                    <tr><td colspan="5" class="text-center py-8 text-xs text-gray-400">No users found.</td></tr>
                  ` : this.users.map(u => `
                    <tr>
                      <td class="font-bold text-gray-900 dark:text-white">#${u.id}</td>
                      <td class="font-semibold text-gray-800 dark:text-gray-200">${u.name || '—'}</td>
                      <td class="text-xs text-gray-600 dark:text-gray-400">${u.email}</td>
                      <td>
                        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${u.role === 'ADMIN' ? 'bg-[#55883B] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}">
                          ${u.role}
                        </span>
                      </td>
                      <td>
                        <button onclick="Admin.viewUserDetails(${u.id})" class="text-xs text-[#55883B] font-semibold hover:underline">
                          View Details
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      `;
    } catch (err) {
      container.innerHTML = EmptyState.renderError({
        title: 'Could not load users',
        message: ErrorHandler.format(err),
        retryHandlerName: "() => Admin.switchTab('users')"
      });
    }
  },

  async viewUserDetails(id) {
    try {
      const user = await UsersAPI.getById(id);
      const container = Modal.init();
      container.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="adminModalOverlay">
          <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 relative animate-fade-in" onclick="event.stopPropagation()">
            <button onclick="Modal.close()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center">
              <i class="fa-solid fa-xmark"></i>
            </button>

            <div class="w-12 h-12 rounded-full bg-[#E6F0DC] text-[#55883B] flex items-center justify-center text-xl font-bold mb-3">
              ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <h3 class="text-base font-bold text-gray-900 dark:text-white">${user.name}</h3>
            <p class="text-xs text-gray-500 mb-4">${user.email}</p>

            <div class="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-xs">
              <div class="flex justify-between">
                <span class="text-gray-400">User ID:</span>
                <span class="font-bold">#${user.id}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Assigned Role:</span>
                <span class="font-semibold text-[#55883B]">${user.role}</span>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
              <button onclick="Modal.close()" class="btn-primary w-full py-2 text-xs">Close</button>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      Toast.error(ErrorHandler.format(err));
    }
  },

  /**
   * Tab 6: Reviews & Ratings Management
   */
  async renderReviewsTab(container) {
    try {
      const products = await ProductsAPI.getAll().catch(() => []);
      this.products = products || [];

      let allReviews = [];
      if (this.products.length > 0) {
        const reviewPromises = this.products.slice(0, 10).map(p =>
          ReviewsAPI.getByProduct(p.id)
            .then(revs => (revs || []).map(r => ({ ...r, productName: p.productName })))
            .catch(() => [])
        );
        const results = await Promise.allSettled(reviewPromises);
        results.forEach(r => {
          if (r.status === 'fulfilled' && Array.isArray(r.value)) {
            allReviews = allReviews.concat(r.value);
          }
        });
      }

      container.innerHTML = `
        <div class="space-y-6 animate-fade-in">
          
          <div class="flex items-center justify-between">
            <p class="text-xs text-gray-500">Customer feedback and rating management</p>
            <span class="text-xs font-bold text-gray-700 dark:text-gray-300">${allReviews.length} total reviews inspected</span>
          </div>

          <div class="admin-card">
            <div class="admin-table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${allReviews.length === 0 ? `
                    <tr><td colspan="6" class="text-center py-8 text-xs text-gray-400">No reviews submitted yet for active products.</td></tr>
                  ` : allReviews.map(r => `
                    <tr>
                      <td class="font-bold text-gray-900 dark:text-white text-xs">${r.productName || '#' + r.productId}</td>
                      <td class="text-xs">${r.userName || 'User #' + r.userId}</td>
                      <td>
                        <div class="flex items-center gap-1 text-amber-400 text-xs">
                          ${Array.from({ length: 5 }).map((_, i) => `
                            <i class="fa-solid fa-star ${i < r.rating ? '' : 'opacity-25'}"></i>
                          `).join('')}
                          <span class="font-bold text-gray-700 dark:text-gray-300 ml-1">(${r.rating})</span>
                        </div>
                      </td>
                      <td class="text-xs text-gray-600 dark:text-gray-300 max-w-xs truncate">${r.comment || '—'}</td>
                      <td class="text-xs text-gray-400">${Formatter.date(r.createdAt)}</td>
                      <td>
                        <button onclick="Admin.deleteReview(${r.id})" class="text-xs text-rose-600 hover:text-rose-800 p-1" title="Delete Review">
                          <i class="fa-solid fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      `;
    } catch (err) {
      container.innerHTML = EmptyState.renderError({
        title: 'Could not load reviews',
        message: ErrorHandler.format(err),
        retryHandlerName: "() => Admin.switchTab('reviews')"
      });
    }
  },

  async deleteReview(id) {
    Confirmation.open({
      title: 'Delete Review?',
      message: 'Are you sure you want to remove this review from the system?',
      confirmText: 'Delete Review',
      confirmType: 'danger',
      onConfirm: async () => {
        try {
          await ReviewsAPI.delete(id);
          Toast.info('Review removed.');
          await this.switchTab('reviews');
        } catch (err) {
          Toast.error(ErrorHandler.format(err));
        }
      }
    });
  },

  /**
   * Tab 7: Store Settings
   */
  renderSettingsTab(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in max-w-3xl">
        
        <div class="admin-card space-y-4">
          <h3 class="text-base font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
            Backend API Configuration
          </h3>
          <p class="text-xs text-gray-500">
            SpringShop connects directly to your Spring Boot REST backend. You can customize the API Base URL for testing.
          </p>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">API Base URL</label>
              <input type="text" id="customApiUrlInput" value="${CONFIG.API_BASE_URL}" class="form-input text-xs" />
            </div>
            <button type="button" onclick="Admin.saveCustomApiUrl()" class="btn-primary py-2 px-4 text-xs font-semibold">
              Update API URL
            </button>
          </div>
        </div>

        <div class="admin-card space-y-4">
          <h3 class="text-base font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
            Brand & Theme Information
          </h3>

          <div class="grid grid-cols-2 gap-4 text-xs">
            <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span class="text-gray-400 block mb-1">Primary Brand Green</span>
              <div class="flex items-center gap-2">
                <span class="w-4 h-4 rounded-full bg-[#55883B] inline-block"></span>
                <span class="font-bold">#55883B</span>
              </div>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span class="text-gray-400 block mb-1">Accent Brown</span>
              <div class="flex items-center gap-2">
                <span class="w-4 h-4 rounded-full bg-[#9A6735] inline-block"></span>
                <span class="font-bold">#9A6735</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;
  },

  saveCustomApiUrl() {
    const input = document.getElementById('customApiUrlInput');
    if (!input) return;
    const url = input.value.trim();
    if (url) {
      localStorage.setItem('springshop_custom_api_url', url);
      CONFIG.API_BASE_URL = url;
      Toast.success('API Base URL updated to ' + url);
    }
  }
};

window.Admin = Admin;
