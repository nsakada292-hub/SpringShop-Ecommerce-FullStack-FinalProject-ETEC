/**
 * Drawer Component
 * Handles Slide-over Cart Drawer and Mobile Navigation Drawer
 */
const Drawer = {
  cartDrawerId: 'cartDrawerContainer',
  mobileMenuId: 'mobileMenuDrawerContainer',

  init() {
    // Create cart drawer container if not present
    if (!document.getElementById(this.cartDrawerId)) {
      const el = document.createElement('div');
      el.id = this.cartDrawerId;
      document.body.appendChild(el);
    }
    // Create mobile menu drawer container if not present
    if (!document.getElementById(this.mobileMenuId)) {
      const el = document.createElement('div');
      el.id = this.mobileMenuId;
      document.body.appendChild(el);
    }
  },

  /**
   * Open Cart Drawer
   */
  async openCart() {
    this.init();
    const container = document.getElementById(this.cartDrawerId);

    // Initial loading state in drawer
    container.innerHTML = `
      <div class="fixed inset-0 z-50 overflow-hidden" id="cartOverlay">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onclick="Drawer.closeCart()"></div>
        <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div class="w-screen max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col transform transition-transform animate-slide-in-right">
            <!-- Header -->
            <div class="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-bag-shopping text-[#55883B] text-lg"></i>
                <h2 class="text-lg font-bold text-gray-900 dark:text-white">Your Shopping Bag</h2>
              </div>
              <button onclick="Drawer.closeCart()" class="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 flex items-center justify-center transition-colors">
                <i class="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto p-5" id="cartDrawerBody">
              ${Loader.spinner('Fetching your cart...')}
            </div>
          </div>
        </div>
      </div>
    `;

    await this.renderCartContent();
  },

  async renderCartContent() {
    const body = document.getElementById('cartDrawerBody');
    if (!body) return;

    if (!AuthGuard.isAuthenticated()) {
      body.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center py-12 px-4">
          <div class="w-16 h-16 rounded-full bg-[#E6F0DC] dark:bg-[#1a2a16] text-[#55883B] flex items-center justify-center text-2xl mb-4">
            <i class="fa-solid fa-user-lock"></i>
          </div>
          <h3 class="text-base font-bold text-gray-900 dark:text-white mb-2">Sign in to view your bag</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
            Your shopping cart is securely synchronized with your account.
          </p>
          <button onclick="Drawer.closeCart(); Modal.openAuth('login');" class="btn-primary w-full py-2.5 text-sm">
            Sign In / Register
          </button>
        </div>
      `;
      return;
    }

    try {
      const cart = await CartAPI.getMyCart();
      Store.cart = cart;
      Store.updateCartBadge();

      if (!cart || !cart.items || cart.items.length === 0) {
        body.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full text-center py-12 px-4">
            <div class="w-20 h-20 rounded-full bg-[#E6F0DC] dark:bg-[#1a2a16] text-[#55883B] flex items-center justify-center text-3xl mb-4">
              <i class="fa-solid fa-cart-shopping"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Your bag is empty</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
              Explore our latest fashion collections and discover your new favorites.
            </p>
            <button onclick="Drawer.closeCart(); window.scrollTo({ top: 400, behavior: 'smooth' });" class="btn-primary py-2.5 px-6 text-sm">
              Discover Products
            </button>
          </div>
        `;
        return;
      }

      // Render cart items & footer
      body.innerHTML = `
        <div class="flex flex-col h-full justify-between">
          <!-- Item list -->
          <div class="space-y-4 divide-y divide-gray-100 dark:divide-gray-800 overflow-y-auto pr-1">
            ${cart.items.map(item => `
              <div class="pt-4 first:pt-0 flex items-start gap-4">
                <div class="w-16 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-400">
                  <i class="fa-solid fa-shirt text-xl text-[#55883B]/40"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate" title="${item.productName}">
                    ${item.productName}
                  </h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Price: ${Formatter.currency(item.productPrice)}
                  </p>
                  <p class="text-xs font-semibold text-[#55883B] mt-0.5">
                    Subtotal: ${Formatter.currency(item.subtotal)}
                  </p>

                  <!-- Quantity Controls -->
                  <div class="flex items-center gap-2 mt-2">
                    <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                      <button 
                        type="button"
                        onclick="Drawer.updateItemQuantity(${item.id}, ${item.quantity - 1})"
                        class="w-7 h-7 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs">
                        <i class="fa-solid fa-minus"></i>
                      </button>
                      <span class="w-8 text-center text-xs font-semibold text-gray-800 dark:text-gray-200">
                        ${item.quantity}
                      </span>
                      <button 
                        type="button"
                        onclick="Drawer.updateItemQuantity(${item.id}, ${item.quantity + 1})"
                        class="w-7 h-7 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs">
                        <i class="fa-solid fa-plus"></i>
                      </button>
                    </div>

                    <button 
                      type="button"
                      onclick="Drawer.removeItem(${item.id})"
                      class="text-xs text-rose-500 hover:text-rose-700 p-1.5 ml-auto"
                      title="Remove Item">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Summary & Checkout Footer -->
          <div class="pt-5 border-t border-gray-200 dark:border-gray-800 mt-4 space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Total Items:</span>
              <span class="font-semibold text-gray-800 dark:text-gray-200">
                ${cart.items.reduce((sum, it) => sum + it.quantity, 0)}
              </span>
            </div>
            <div class="flex items-center justify-between text-base font-bold">
              <span class="text-gray-900 dark:text-white">Estimated Total:</span>
              <span class="text-lg text-[#55883B] dark:text-[#79bf54]">
                ${Formatter.currency(cart.totalAmount)}
              </span>
            </div>

            <button 
              type="button"
              onclick="Drawer.closeCart(); Modal.openCheckout();"
              class="btn-primary w-full py-3 text-sm font-semibold shadow-md flex items-center justify-center gap-2">
              <i class="fa-solid fa-lock text-xs"></i>
              Proceed to Checkout
            </button>

            <div class="flex items-center justify-between pt-1">
              <button 
                type="button"
                onclick="Drawer.clearCart()"
                class="text-xs text-gray-400 hover:text-rose-500 transition-colors">
                Clear Bag
              </button>
              <button 
                type="button"
                onclick="Drawer.closeCart()"
                class="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">
                Continue Shopping &rarr;
              </button>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      body.innerHTML = EmptyState.renderError({
        title: 'Could not load cart',
        message: ErrorHandler.format(err),
        retryHandlerName: 'Drawer.renderCartContent'
      });
    }
  },

  async updateItemQuantity(cartItemId, newQty) {
    try {
      await CartAPI.updateItemQuantity(cartItemId, newQty);
      await this.renderCartContent();
    } catch (err) {
      Toast.error(ErrorHandler.format(err));
    }
  },

  async removeItem(cartItemId) {
    try {
      await CartAPI.removeItem(cartItemId);
      Toast.info('Item removed from cart');
      await this.renderCartContent();
    } catch (err) {
      Toast.error(ErrorHandler.format(err));
    }
  },

  async clearCart() {
    Confirmation.open({
      title: 'Empty Shopping Bag?',
      message: 'Are you sure you want to remove all items from your bag?',
      confirmText: 'Empty Bag',
      confirmType: 'danger',
      onConfirm: async () => {
        try {
          await CartAPI.clearMyCart();
          Toast.info('Cart cleared');
          await this.renderCartContent();
        } catch (err) {
          Toast.error(ErrorHandler.format(err));
        }
      }
    });
  },

  closeCart() {
    const container = document.getElementById(this.cartDrawerId);
    if (container) container.innerHTML = '';
  },

  /**
   * Mobile Navigation Drawer
   */
  openMobileMenu() {
    this.init();
    const container = document.getElementById(this.mobileMenuId);
    const user = AuthGuard.getUser();
    const categories = Store.topCategories || [];

    container.innerHTML = `
      <div class="fixed inset-0 z-50 overflow-hidden" id="mobileMenuOverlay">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onclick="Drawer.closeMobileMenu()"></div>
        <div class="fixed inset-y-0 left-0 max-w-full flex pr-10">
          <div class="w-screen max-w-xs bg-white dark:bg-gray-900 shadow-2xl flex flex-col transform transition-transform animate-slide-in-left">
            <!-- Header -->
            <div class="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-7 h-7 rounded-lg bg-[#55883B] text-white flex items-center justify-center font-bold text-sm">S</span>
                <span class="text-base font-bold text-gray-900 dark:text-white">SpringShop</span>
              </div>
              <button onclick="Drawer.closeMobileMenu()" class="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 flex items-center justify-center">
                <i class="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <!-- Nav Links -->
            <div class="flex-1 overflow-y-auto p-5 space-y-6">
              <div>
                <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Navigation</p>
                <div class="space-y-1">
                  <a href="index.html" class="flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <i class="fa-solid fa-house text-[#55883B]"></i> Home
                  </a>
                  <a href="#productsSection" onclick="Drawer.closeMobileMenu()" class="flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <i class="fa-solid fa-shop text-[#55883B]"></i> Shop All Products
                  </a>
                  <a href="javascript:void(0)" onclick="Drawer.closeMobileMenu(); Store.showWishlistModal();" class="flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <i class="fa-solid fa-heart text-rose-500"></i> Saved Wishlist
                  </a>
                </div>
              </div>

              <!-- Categories -->
              <div>
                <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                <div class="space-y-1">
                  <button onclick="Drawer.closeMobileMenu(); Store.filterByCategory(null);" class="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    All Categories
                  </button>
                  ${categories.map(c => `
                    <button onclick="Drawer.closeMobileMenu(); Store.filterByCategory(${c.id}, '${c.categoryName}');" class="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between">
                      <span>${c.categoryName}</span>
                      <i class="fa-solid fa-chevron-right text-xs text-gray-400"></i>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Account Area -->
              <div class="pt-4 border-t border-gray-200 dark:border-gray-800">
                <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Account</p>
                ${user ? `
                  <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3">
                    <p class="text-sm font-bold text-gray-900 dark:text-white truncate">${user.name}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${user.email}</p>
                    <span class="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#E6F0DC] text-[#315220] dark:bg-[#1f301e] dark:text-[#a8e090] font-semibold">
                      ${user.role}
                    </span>
                  </div>
                  <div class="space-y-1">
                    <button onclick="Drawer.closeMobileMenu(); Modal.openProfile();" class="w-full text-left py-2 px-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
                      <i class="fa-solid fa-user-pen text-xs"></i> Edit Profile
                    </button>
                    <button onclick="Drawer.closeMobileMenu(); Modal.openOrders();" class="w-full text-left py-2 px-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
                      <i class="fa-solid fa-box text-xs"></i> My Orders
                    </button>
                    ${user.role === 'ADMIN' || user.role === 'ROLE_ADMIN' ? `
                      <a href="admin.html" class="w-full text-left py-2 px-3 rounded-lg text-sm text-[#55883B] font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
                        <i class="fa-solid fa-chart-line text-xs"></i> Admin Dashboard
                      </a>
                    ` : ''}
                    <button onclick="Drawer.closeMobileMenu(); AuthAPI.logout();" class="w-full text-left py-2 px-3 rounded-lg text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2">
                      <i class="fa-solid fa-right-from-bracket text-xs"></i> Logout
                    </button>
                  </div>
                ` : `
                  <button onclick="Drawer.closeMobileMenu(); Modal.openAuth('login');" class="btn-primary w-full py-2.5 text-sm mb-2">
                    Sign In
                  </button>
                  <button onclick="Drawer.closeMobileMenu(); Modal.openAuth('register');" class="btn-secondary w-full py-2 text-sm">
                    Create Account
                  </button>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  closeMobileMenu() {
    const container = document.getElementById(this.mobileMenuId);
    if (container) container.innerHTML = '';
  }
};

window.Drawer = Drawer;
