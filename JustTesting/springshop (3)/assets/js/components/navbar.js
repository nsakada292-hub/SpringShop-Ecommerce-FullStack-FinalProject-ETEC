/**
 * Storefront Navbar Component
 */
const Navbar = {
  render() {
    const user = AuthGuard.getUser();
    const isDark = document.documentElement.classList.contains('dark');
    const wishlistCount = (Store.wishlist || []).length;
    const cartCount = Store.getCartItemCount();

    return `
      <!-- Top Announcement Bar -->
      <div class="bg-[#55883B] text-white text-xs font-medium py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <span class="hidden sm:inline">🌿 Spring Collection 2026</span>
        <span>•</span>
        <span>Free standard shipping on fashion orders over $50</span>
        <span>•</span>
        <a href="#productsSection" class="underline hover:text-[#C1E899] font-semibold transition-colors">Shop Now</a>
      </div>

      <!-- Main Sticky Navigation Bar -->
      <header class="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16 gap-4">
            
            <!-- Left: Mobile Menu Button & Brand Logo -->
            <div class="flex items-center gap-3">
              <button 
                type="button" 
                onclick="Drawer.openMobileMenu()" 
                class="lg:hidden w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Open Mobile Menu">
                <i class="fa-solid fa-bars text-base"></i>
              </button>

              <a href="index.html" class="flex items-center gap-2.5 group">
                <div class="w-9 h-9 rounded-xl bg-[#55883B] group-hover:bg-[#456f30] text-white flex items-center justify-center font-black text-lg transition-colors shadow-xs">
                  S
                </div>
                <span class="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Spring<span class="text-[#55883B] dark:text-[#79bf54]">Shop</span>
                </span>
              </a>
            </div>

            <!-- Middle: Desktop Navigation Links & Categories Dropdown -->
            <nav class="hidden lg:flex items-center gap-6 text-sm font-medium">
              <a href="index.html" class="text-gray-900 dark:text-white hover:text-[#55883B] transition-colors">
                Home
              </a>
              <a href="#productsSection" class="text-gray-600 dark:text-gray-300 hover:text-[#55883B] transition-colors">
                Shop
              </a>

              <!-- Categories Dropdown -->
              <div class="relative group" id="categoriesDropdownContainer">
                <button 
                  type="button" 
                  class="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 group-hover:text-[#55883B] transition-colors py-2">
                  <span>Categories</span>
                  <i class="fa-solid fa-chevron-down text-[10px] transition-transform group-hover:rotate-180"></i>
                </button>
                <div class="absolute top-full left-0 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-2 hidden group-hover:block animate-fade-in z-50">
                  <div class="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Top Categories</div>
                  <div id="desktopCategoriesList" class="max-h-72 overflow-y-auto">
                    ${Loader.spinner('', 'sm')}
                  </div>
                </div>
              </div>

              <a href="#reviewsSection" class="text-gray-600 dark:text-gray-300 hover:text-[#55883B] transition-colors">
                Reviews
              </a>
            </nav>

            <!-- Middle-Right: Search Input -->
            <div class="flex-1 max-w-xs md:max-w-sm hidden sm:block">
              <div class="relative">
                <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input 
                  type="text" 
                  id="navbarSearchInput"
                  placeholder="Search clothing, bags, shoes..." 
                  class="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full pl-9 pr-8 py-2 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-[#55883B] outline-none transition-all"
                  oninput="Store.handleSearchInput(event)"
                />
                <button 
                  type="button" 
                  id="clearSearchBtn"
                  onclick="Store.clearSearch()"
                  class="hidden absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  aria-label="Clear Search">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            <!-- Right: Actions (Theme, Wishlist, Cart, User) -->
            <div class="flex items-center gap-2 sm:gap-3">
              <!-- Dark / Light Mode Toggle -->
              <button 
                type="button" 
                onclick="Store.toggleTheme()" 
                class="w-9 h-9 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                aria-label="Toggle Theme"
                title="Toggle Dark / Light Mode">
                <i class="fa-solid ${isDark ? 'fa-sun text-amber-400' : 'fa-moon text-gray-600'} text-sm"></i>
              </button>

              <!-- Wishlist Button -->
              <button 
                type="button" 
                onclick="Store.showWishlistModal()" 
                class="relative w-9 h-9 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                aria-label="Saved Wishlist"
                title="Wishlist">
                <i class="fa-regular fa-heart text-base"></i>
                <span id="wishlistBadge" class="${wishlistCount > 0 ? '' : 'hidden'} absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  ${wishlistCount}
                </span>
              </button>

              <!-- Cart Drawer Toggle -->
              <button 
                type="button" 
                onclick="Drawer.openCart()" 
                class="relative w-9 h-9 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                aria-label="Shopping Cart"
                title="Shopping Bag">
                <i class="fa-solid fa-bag-shopping text-base"></i>
                <span id="cartBadge" class="${cartCount > 0 ? '' : 'hidden'} absolute -top-1 -right-1 bg-[#55883B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  ${cartCount}
                </span>
              </button>

              <!-- User Account Dropdown / Sign In -->
              ${user ? `
                <div class="relative group" id="userAccountMenu">
                  <button 
                    type="button" 
                    class="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div class="w-7 h-7 rounded-full bg-[#E6F0DC] text-[#315220] dark:bg-[#1a2a16] dark:text-[#a8e090] font-bold text-xs flex items-center justify-center">
                      ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span class="hidden md:inline text-xs font-semibold text-gray-800 dark:text-gray-200 max-w-[90px] truncate">
                      ${user.name || 'Account'}
                    </span>
                    <i class="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
                  </button>

                  <!-- Account Dropdown Menu -->
                  <div class="absolute right-0 top-full w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-2 hidden group-hover:block animate-fade-in z-50">
                    <div class="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p class="text-xs font-bold text-gray-900 dark:text-white truncate">${user.name}</p>
                      <p class="text-[11px] text-gray-500 truncate">${user.email}</p>
                      <span class="inline-block mt-1 text-[10px] px-2 py-0.2 bg-[#E6F0DC] dark:bg-[#1a2a16] text-[#55883B] dark:text-[#a8e090] font-semibold rounded-full">
                        ${user.role}
                      </span>
                    </div>

                    <div class="py-1 text-xs">
                      <button onclick="Modal.openProfile()" class="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5">
                        <i class="fa-solid fa-user-pen text-gray-400"></i> Profile Settings
                      </button>
                      <button onclick="Modal.openOrders()" class="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5">
                        <i class="fa-solid fa-box text-gray-400"></i> My Orders
                      </button>
                      ${user.role === 'ADMIN' || user.role === 'ROLE_ADMIN' ? `
                        <a href="admin.html" class="w-full text-left px-4 py-2 text-[#55883B] font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5">
                          <i class="fa-solid fa-chart-line"></i> Admin Dashboard
                        </a>
                      ` : ''}
                    </div>

                    <div class="pt-1 border-t border-gray-100 dark:border-gray-800">
                      <button onclick="AuthAPI.logout()" class="w-full text-left px-4 py-2 text-rose-600 text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5">
                        <i class="fa-solid fa-right-from-bracket"></i> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ` : `
                <button 
                  type="button" 
                  onclick="Modal.openAuth('login')" 
                  class="btn-primary text-xs py-2 px-3.5 font-semibold">
                  <i class="fa-regular fa-user mr-1.5"></i> Sign In
                </button>
              `}
            </div>
          </div>
        </div>

        <!-- Mobile search row (visible only on mobile below navbar) -->
        <div class="sm:hidden px-4 pb-3">
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input 
              type="text" 
              placeholder="Search products..." 
              class="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full pl-9 pr-4 py-1.5 text-xs text-gray-900 dark:text-gray-100 outline-none"
              oninput="Store.handleSearchInput(event)"
            />
          </div>
        </div>
      </header>
    `;
  },

  update() {
    const navEl = document.getElementById('mainNavbarContainer');
    if (navEl) {
      navEl.innerHTML = this.render();
      Store.populateCategoriesInNav();
    }
  }
};

window.Navbar = Navbar;