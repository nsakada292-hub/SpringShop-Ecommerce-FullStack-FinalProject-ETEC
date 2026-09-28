/**
 * Modal Component System
 * Handles Product Details, Auth, Checkout, Orders, Reviews, and Profile Modals
 */
const Modal = {
  containerId: 'globalModalContainer',

  init() {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      document.body.appendChild(container);
    }
    return container;
  },

  close() {
    const container = document.getElementById(this.containerId);
    if (container) container.innerHTML = '';
  },

  /**
   * Product Details Modal
   */
  async openProduct(productId) {
    const container = this.init();
    
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto" id="modalOverlay">
        <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 relative my-8 animate-fade-in" onclick="event.stopPropagation()">
          <button onclick="Modal.close()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
          <div id="productModalContent">
            ${Loader.spinner('Loading product details...')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('modalOverlay').onclick = (e) => {
      if (e.target.id === 'modalOverlay') Modal.close();
    };

    try {
      const product = await ProductsAPI.getById(productId);
      
      // Load reviews and average rating in parallel
      let reviews = [];
      let avgRating = 0;
      try {
        const [revData, avgData] = await Promise.all([
          ReviewsAPI.getByProduct(productId),
          ReviewsAPI.getAverageRating(productId)
        ]);
        reviews = revData || [];
        avgRating = avgData || 0;
      } catch (e) {
        console.warn('Could not load reviews:', e);
      }

      const content = document.getElementById('productModalContent');
      if (!content) return;

      const isLiked = Store.isWishlisted(product.id);
      const isOutOfStock = product.stockQuantity !== undefined && product.stockQuantity <= 0;
      const imageUrl = product.image || CONFIG.PLACEHOLDER_PRODUCT_IMAGE;
      const currentUser = AuthGuard.getUser();
      const userReview = reviews.find(r => currentUser && r.userId === currentUser.id);

      content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Product Image -->
          <div class="rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 aspect-3/4 flex items-center justify-center relative">
            <img 
              src="${imageUrl}" 
              alt="${product.productName}"
              class="w-full h-full object-cover"
              onerror="this.onerror=null; this.src='${CONFIG.PLACEHOLDER_PRODUCT_IMAGE}';"
            />
            <button 
              type="button"
              onclick="Store.toggleWishlist(${product.id}); Modal.openProduct(${product.id});"
              class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xs flex items-center justify-center shadow-md hover:scale-110 transition-transform ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-gray-600 dark:text-gray-300'}">
              <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart text-lg"></i>
            </button>
          </div>

          <!-- Product Info & Actions -->
          <div class="flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-[#55883B] dark:text-[#79bf54]">
                  ${product.category?.categoryName || 'Fashion'}
                </span>
                <span class="text-gray-300 dark:text-gray-700">•</span>
                <div class="flex items-center text-amber-400 text-xs font-semibold">
                  <i class="fa-solid fa-star mr-1"></i>
                  <span>${avgRating > 0 ? avgRating.toFixed(1) : 'New'}</span>
                  <span class="text-gray-400 font-normal ml-1">(${reviews.length} reviews)</span>
                </div>
              </div>

              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                ${product.productName}
              </h2>

              <p class="text-2xl font-extrabold text-[#55883B] dark:text-[#79bf54] mb-4">
                ${Formatter.currency(product.price)}
              </p>

              <div class="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                ${product.description || 'Elevate your wardrobe with this authentic SpringShop creation, crafted for comfort, modern silhouette, and everyday confidence.'}
              </div>

              <!-- Product Specs -->
              <div class="grid grid-cols-3 gap-2 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl mb-6 text-xs">
                <div>
                  <span class="text-gray-400 block mb-0.5">Size</span>
                  <span class="font-semibold text-gray-800 dark:text-gray-200">${product.size || 'Standard'}</span>
                </div>
                <div>
                  <span class="text-gray-400 block mb-0.5">Color</span>
                  <span class="font-semibold text-gray-800 dark:text-gray-200">${product.color || 'Multi'}</span>
                </div>
                <div>
                  <span class="text-gray-400 block mb-0.5">Material</span>
                  <span class="font-semibold text-gray-800 dark:text-gray-200">${product.material || 'Cotton / Blend'}</span>
                </div>
              </div>
            </div>

            <!-- Add to Cart Form -->
            <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
              <div class="flex items-center gap-3 mb-4">
                <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <button type="button" onclick="Modal.decrementQty('productModalQty')" class="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm">
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <input type="number" id="productModalQty" value="1" min="1" max="${product.stockQuantity || 99}" class="w-12 text-center text-sm font-semibold bg-transparent outline-none text-gray-900 dark:text-white" readonly />
                  <button type="button" onclick="Modal.incrementQty('productModalQty', ${product.stockQuantity || 99})" class="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
                
                <button 
                  type="button"
                  onclick="Modal.handleAddToCart(${product.id})"
                  ${isOutOfStock ? 'disabled' : ''}
                  class="flex-1 btn-primary py-3 text-sm font-semibold shadow-md ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}">
                  <i class="fa-solid fa-bag-shopping mr-2"></i>
                  ${isOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}
                </button>
              </div>

              <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-4">
                <span><i class="fa-solid fa-truck-fast text-[#55883B] mr-1"></i> Fast Shipping</span>
                <span><i class="fa-solid fa-shield-check text-[#55883B] mr-1"></i> Authentic Quality</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Reviews Section -->
        <div class="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Customer Reviews</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">Real feedback from verified buyers</p>
            </div>
            ${!userReview ? `
              <button onclick="Modal.toggleReviewForm()" class="btn-outline text-xs py-1.5 px-3">
                <i class="fa-solid fa-pen mr-1"></i> Write a Review
              </button>
            ` : ''}
          </div>

          <!-- Review Form (Hidden by default or toggled) -->
          <div id="reviewFormSection" class="hidden mb-6 p-4 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">Write Your Review</h4>
            <form id="productReviewForm" onsubmit="Modal.submitReview(event, ${product.id})">
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Your Rating</label>
                <div class="flex items-center gap-2 text-xl text-amber-400" id="starRatingSelector">
                  ${[1, 2, 3, 4, 5].map(star => `
                    <i class="fa-solid fa-star cursor-pointer opacity-40 hover:opacity-100 transition-opacity" data-star="${star}" onclick="Modal.selectStar(${star})"></i>
                  `).join('')}
                </div>
                <input type="hidden" id="reviewRatingInput" name="rating" value="5" />
              </div>
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Your Comment</label>
                <textarea id="reviewCommentInput" rows="3" required placeholder="What did you love about this item? How is the fit and quality?" class="form-input text-xs"></textarea>
              </div>
              <div class="flex justify-end gap-2">
                <button type="button" onclick="Modal.toggleReviewForm()" class="btn-outline text-xs py-1.5 px-3">Cancel</button>
                <button type="submit" class="btn-primary text-xs py-1.5 px-4">Submit Review</button>
              </div>
            </form>
          </div>

          <!-- Reviews List -->
          <div class="space-y-4">
            ${reviews.length === 0 ? `
              <p class="text-xs text-gray-400 py-4 text-center">No reviews yet for this product. Be the first to leave one!</p>
            ` : reviews.map(r => `
              <div class="p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <div class="flex items-center justify-between mb-1.5">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-[#E6F0DC] text-[#315220] dark:bg-[#1f301e] dark:text-[#a8e090] font-bold text-xs flex items-center justify-center">
                      ${r.userName ? r.userName.charAt(0).toUpperCase() : 'U'}
                    </span>
                    <span class="text-xs font-semibold text-gray-800 dark:text-gray-200">${r.userName || 'Customer'}</span>
                    <span class="text-[10px] text-gray-400">${Formatter.date(r.createdAt)}</span>
                  </div>
                  <div class="flex items-center gap-1 text-amber-400 text-xs">
                    ${Array.from({ length: 5 }).map((_, i) => `
                      <i class="fa-solid fa-star ${i < r.rating ? '' : 'opacity-25'}"></i>
                    `).join('')}
                  </div>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">${r.comment || ''}</p>
                ${currentUser && r.userId === currentUser.id ? `
                  <div class="mt-2 flex items-center gap-3 text-[11px]">
                    <button onclick="Modal.deleteReview(${r.id}, ${product.id})" class="text-rose-500 hover:underline">
                      <i class="fa-solid fa-trash-can mr-1"></i> Delete My Review
                    </button>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;

      Modal.selectStar(5);
    } catch (err) {
      const content = document.getElementById('productModalContent');
      if (content) {
        content.innerHTML = EmptyState.renderError({
          title: 'Product not found',
          message: ErrorHandler.format(err)
        });
      }
    }
  },

  incrementQty(id, max) {
    const input = document.getElementById(id);
    if (!input) return;
    let val = parseInt(input.value) || 1;
    if (val < max) input.value = val + 1;
  },

  decrementQty(id) {
    const input = document.getElementById(id);
    if (!input) return;
    let val = parseInt(input.value) || 1;
    if (val > 1) input.value = val - 1;
  },

  async handleAddToCart(productId) {
    const input = document.getElementById('productModalQty');
    const quantity = input ? parseInt(input.value) || 1 : 1;
    await Store.addToCart(productId, quantity);
  },

  toggleReviewForm() {
    if (!AuthGuard.isAuthenticated()) {
      Toast.warning('Please sign in to write a review.');
      Modal.openAuth('login');
      return;
    }
    const formSec = document.getElementById('reviewFormSection');
    if (formSec) {
      formSec.classList.toggle('hidden');
    }
  },

  selectStar(rating) {
    const input = document.getElementById('reviewRatingInput');
    if (input) input.value = rating;
    const stars = document.querySelectorAll('#starRatingSelector i');
    stars.forEach(s => {
      const starVal = parseInt(s.getAttribute('data-star'));
      if (starVal <= rating) {
        s.classList.remove('opacity-40');
      } else {
        s.classList.add('opacity-40');
      }
    });
  },

  async submitReview(e, productId) {
    e.preventDefault();
    if (!AuthGuard.requireAuth()) return;

    const rating = parseInt(document.getElementById('reviewRatingInput')?.value) || 5;
    const comment = document.getElementById('reviewCommentInput')?.value?.trim();

    if (!comment) {
      Toast.warning('Please enter your review comment.');
      return;
    }

    try {
      await ReviewsAPI.create({ productId, rating, comment });
      Toast.success('Thank you! Your review has been submitted.');
      Modal.openProduct(productId); // reload modal content
    } catch (err) {
      Toast.error(ErrorHandler.format(err));
    }
  },

  async deleteReview(reviewId, productId) {
    Confirmation.open({
      title: 'Delete Review?',
      message: 'Are you sure you want to remove your review?',
      confirmText: 'Delete',
      confirmType: 'danger',
      onConfirm: async () => {
        try {
          await ReviewsAPI.delete(reviewId);
          Toast.info('Review deleted.');
          Modal.openProduct(productId);
        } catch (err) {
          Toast.error(ErrorHandler.format(err));
        }
      }
    });
  },

  /**
   * Authentication Modal (Login / Register Tabs)
   */
  openAuth(tab = 'login') {
    const container = this.init();

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="authModalOverlay">
        <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 relative animate-fade-in" onclick="event.stopPropagation()">
          <button onclick="Modal.close()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>

          <!-- Brand logo -->
          <div class="flex items-center gap-2 mb-6">
            <span class="w-8 h-8 rounded-xl bg-[#55883B] text-white flex items-center justify-center font-bold text-base">S</span>
            <span class="text-xl font-bold text-gray-900 dark:text-white">SpringShop</span>
          </div>

          <!-- Tab Switcher -->
          <div class="flex border-b border-gray-200 dark:border-gray-800 mb-6">
            <button 
              id="authLoginTabBtn"
              onclick="Modal.switchAuthTab('login')" 
              class="flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-colors ${tab === 'login' ? 'border-[#55883B] text-[#55883B]' : 'border-transparent text-gray-500 hover:text-gray-700'}">
              Sign In
            </button>
            <button 
              id="authRegisterTabBtn"
              onclick="Modal.switchAuthTab('register')" 
              class="flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-colors ${tab === 'register' ? 'border-[#55883B] text-[#55883B]' : 'border-transparent text-gray-500 hover:text-gray-700'}">
              Create Account
            </button>
          </div>

          <div id="authErrorMessage" class="hidden mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-600 dark:text-rose-400"></div>

          <!-- Login Form -->
          <form id="authLoginForm" class="${tab === 'login' ? 'block' : 'hidden'}" onsubmit="Modal.handleLogin(event)">
            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input type="email" id="loginEmail" required placeholder="you@example.com" class="form-input text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input type="password" id="loginPassword" required placeholder="••••••••" class="form-input text-sm" />
              </div>
            </div>
            <button type="submit" id="loginSubmitBtn" class="btn-primary w-full py-2.5 text-sm font-semibold shadow-md">
              Sign In
            </button>
          </form>

          <!-- Register Form -->
          <form id="authRegisterForm" class="${tab === 'register' ? 'block' : 'hidden'}" onsubmit="Modal.handleRegister(event)">
            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input type="text" id="registerName" required placeholder="John Doe" class="form-input text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input type="email" id="registerEmail" required placeholder="you@example.com" class="form-input text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input type="password" id="registerPassword" required minlength="6" placeholder="At least 6 characters" class="form-input text-sm" />
              </div>
            </div>
            <button type="submit" id="registerSubmitBtn" class="btn-primary w-full py-2.5 text-sm font-semibold shadow-md">
              Create Account
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('authModalOverlay').onclick = (e) => {
      if (e.target.id === 'authModalOverlay') Modal.close();
    };
  },

  switchAuthTab(tab) {
    const loginTabBtn = document.getElementById('authLoginTabBtn');
    const regTabBtn = document.getElementById('authRegisterTabBtn');
    const loginForm = document.getElementById('authLoginForm');
    const regForm = document.getElementById('authRegisterForm');
    const errBox = document.getElementById('authErrorMessage');
    if (errBox) errBox.classList.add('hidden');

    if (tab === 'login') {
      loginTabBtn.className = 'flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-colors border-[#55883B] text-[#55883B]';
      regTabBtn.className = 'flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-colors border-transparent text-gray-500 hover:text-gray-700';
      loginForm.classList.remove('hidden');
      regForm.classList.add('hidden');
    } else {
      regTabBtn.className = 'flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-colors border-[#55883B] text-[#55883B]';
      loginTabBtn.className = 'flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-colors border-transparent text-gray-500 hover:text-gray-700';
      regForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;
    const btn = document.getElementById('loginSubmitBtn');
    const errBox = document.getElementById('authErrorMessage');

    if (!email || !password) return;

    try {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-2"></i> Signing in...';
      errBox.classList.add('hidden');

      const res = await AuthAPI.login({ email, password });

      // OTP flow: /login returns a message but no token yet — prompt for the code.
      if (res && res.otpRequired) {
        this.openOtpVerify(email);
        Toast.info(res.message || 'Enter the verification code sent to your email.');
        return;
      }

      Toast.success(`Welcome back, ${res.user?.name || 'Customer'}!`);
      Modal.close();

      // Check if admin redirect requested
      if (res.user && (res.user.role === 'ADMIN' || res.user.role === 'ROLE_ADMIN')) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === '1' || window.location.pathname.includes('admin')) {
          window.location.href = 'admin.html';
        }
      }
    } catch (err) {
      errBox.textContent = ErrorHandler.format(err);
      errBox.classList.remove('hidden');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Sign In';
      }
    }
  },

  /**
   * OTP verification modal — shown after login/register so the user can enter
   * the code the backend emailed them (dev: also printed to the server console).
   */
  openOtpVerify(email) {
    const container = this.init();

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="otpModalOverlay">
        <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 relative animate-fade-in" onclick="event.stopPropagation()">
          <button onclick="Modal.close()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>

          <div class="flex items-center gap-2 mb-5">
            <span class="w-8 h-8 rounded-xl bg-[#55883B] text-white flex items-center justify-center font-bold text-base">S</span>
            <span class="text-xl font-bold text-gray-900 dark:text-white">Verify your email</span>
          </div>

          <p class="text-xs text-gray-500 dark:text-gray-400 mb-5">
            We emailed a 6-digit code to <strong class="text-gray-700 dark:text-gray-200">${email || ''}</strong>. Enter it below to finish signing in. (In development the code is also printed to the backend console.)
          </p>

          <div id="otpErrorMessage" class="hidden mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-600 dark:text-rose-400"></div>

          <form onsubmit="Modal.handleOtpVerify(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Verification Code</label>
              <input
                type="text"
                id="otpCodeInput"
                required
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="6"
                placeholder="123456"
                class="form-input text-sm text-center tracking-[0.3em] font-mono"
              />
            </div>

            <button type="submit" id="otpVerifyBtn" class="btn-primary w-full py-2.5 text-sm font-semibold shadow-md">
              <i class="fa-solid fa-shield-halved mr-1.5"></i> Verify &amp; Sign In
            </button>
          </form>

          <div class="mt-4 text-center text-xs">
            <span class="text-gray-500 dark:text-gray-400">Didn't get a code?</span>
            <button type="button" onclick="Modal.resendOtp()" class="ml-1 text-[#55883B] font-semibold hover:underline cursor-pointer">Resend code</button>
            <button type="button" onclick="Modal.openAuth('login')" class="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline cursor-pointer">Change email</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('otpModalOverlay').onclick = (e) => {
      if (e.target.id === 'otpModalOverlay') Modal.close();
    };

    window.setTimeout(() => document.getElementById('otpCodeInput')?.focus(), 50);
  },

  async handleOtpVerify(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const email = AuthAPI.getPendingOtpEmail();
    const code = document.getElementById('otpCodeInput')?.value?.trim();
    const btn = document.getElementById('otpVerifyBtn');
    const errBox = document.getElementById('otpErrorMessage');

    if (!email) {
      Modal.openAuth('login');
      return;
    }
    if (!code) return;

    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-2"></i> Verifying...'; }
    if (errBox) errBox.classList.add('hidden');

    try {
      const res = await AuthAPI.verifyOtp(email, code);
      Toast.success(`Welcome${res.user?.name ? ', ' + res.user.name : ''}!`);
      Modal.close();

      if (res.user && (res.user.role === 'ADMIN' || res.user.role === 'ROLE_ADMIN')) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === '1' || window.location.pathname.includes('admin')) {
          window.location.href = 'admin.html';
          return;
        }
      }
      if (typeof window.refreshAuthUI === 'function') window.refreshAuthUI();
    } catch (err) {
      if (errBox) {
        errBox.textContent = ErrorHandler.format(err);
        errBox.classList.remove('hidden');
      }
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-shield-halved mr-1.5"></i> Verify &amp; Sign In'; }
    }
  },

  async resendOtp() {
    const email = AuthAPI.getPendingOtpEmail();
    if (!email) { Modal.openAuth('login'); return; }
    try {
      await AuthAPI.sendOtp(email);
      Toast.info('A new verification code was sent.');
    } catch (err) {
      Toast.error(ErrorHandler.format(err));
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName')?.value?.trim();
    const email = document.getElementById('registerEmail')?.value?.trim();
    const password = document.getElementById('registerPassword')?.value;
    const btn = document.getElementById('registerSubmitBtn');
    const errBox = document.getElementById('authErrorMessage');

    if (!name || !email || !password) return;

    try {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-2"></i> Creating account...';
      errBox.classList.add('hidden');

      const res = await AuthAPI.register({ name, email, password });

      // OTP flow: /register returns a message but no token yet — prompt for the code.
      if (res && res.otpRequired) {
        this.openOtpVerify(email);
        Toast.info(res.message || 'Enter the verification code sent to your email.');
        return;
      }

      Toast.success(`Account created successfully! Welcome, ${res.user?.name || 'Customer'}!`);
      Modal.close();
    } catch (err) {
      errBox.textContent = ErrorHandler.format(err);
      errBox.classList.remove('hidden');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Create Account';
      }
    }
  },

  /**
   * Checkout Modal
   */
  async openCheckout() {
    if (!AuthGuard.requireAuth(() => Modal.openCheckout(), 'Please sign in to proceed to checkout.')) {
      return;
    }

    const container = this.init();
    
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto" id="checkoutOverlay">
        <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 relative my-8 animate-fade-in" onclick="event.stopPropagation()">
          <button onclick="Modal.close()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
          
          <div id="checkoutContent">
            ${Loader.spinner('Preparing checkout summary...')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('checkoutOverlay').onclick = (e) => {
      if (e.target.id === 'checkoutOverlay') Modal.close();
    };

    try {
      const cart = await CartAPI.getMyCart();
      const user = AuthGuard.getUser();
      const content = document.getElementById('checkoutContent');
      if (!content) return;

      if (!cart || !cart.items || cart.items.length === 0) {
        content.innerHTML = `
          <div class="text-center py-8">
            <div class="w-16 h-16 rounded-full bg-[#E6F0DC] text-[#55883B] flex items-center justify-center text-2xl mx-auto mb-3">
              <i class="fa-solid fa-cart-arrow-down"></i>
            </div>
            <h3 class="text-base font-bold text-gray-900 dark:text-white mb-1">Your cart is empty</h3>
            <p class="text-xs text-gray-500 mb-4">Please add products before checking out.</p>
            <button onclick="Modal.close()" class="btn-primary text-xs py-2 px-4">Continue Shopping</button>
          </div>
        `;
        return;
      }

      content.innerHTML = `
        <div class="mb-6">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#55883B] mb-1">
            <i class="fa-solid fa-shield-check"></i>
            <span>Secure Checkout</span>
          </div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Order Summary & Shipping</h2>
        </div>

        <!-- Order Items Breakdown -->
        <div class="p-4 bg-gray-50 dark:bg-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
          <div class="max-h-48 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700 pr-1 space-y-2">
            ${cart.items.map(it => `
              <div class="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div class="flex-1 pr-2">
                  <span class="font-semibold text-gray-800 dark:text-gray-200">${it.productName}</span>
                  <span class="text-gray-500 block">Qty: ${it.quantity} × ${Formatter.currency(it.productPrice)}</span>
                </div>
                <span class="font-bold text-gray-900 dark:text-white">${Formatter.currency(it.subtotal)}</span>
              </div>
            `).join('')}
          </div>

          <div class="pt-3 border-t border-gray-200 dark:border-gray-700 mt-3 flex items-center justify-between font-bold text-sm">
            <span class="text-gray-900 dark:text-white">Total Amount:</span>
            <span class="text-base text-[#55883B] dark:text-[#79bf54]">${Formatter.currency(cart.totalAmount)}</span>
          </div>
        </div>

        <div id="checkoutErrorMsg" class="hidden mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-600 dark:text-rose-400"></div>

        <!-- Shipping Address Form -->
        <form onsubmit="Modal.handlePlaceOrder(event)">
          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Customer</label>
              <div class="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-700 dark:text-gray-300 flex justify-between">
                <span>${user?.name || 'Customer'}</span>
                <span class="text-gray-500">${user?.email || ''}</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Shipping Address <span class="text-rose-500">*</span>
              </label>
              <textarea 
                id="checkoutAddressInput" 
                rows="3" 
                required 
                placeholder="Street address, Apartment/Suite, City, State, Postal Code, Country" 
                class="form-input text-xs"></textarea>
            </div>

            <div class="p-3 rounded-lg bg-[#E6F0DC]/60 dark:bg-[#1a2a16]/60 border border-[#C1E899] dark:border-[#274024] text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
              <i class="fa-solid fa-circle-info text-[#55883B] mt-0.5"></i>
              <span>This order will be registered in the Spring Boot backend database and inventory stock will be adjusted automatically.</span>
            </div>
          </div>

          <button type="submit" id="placeOrderBtn" class="btn-primary w-full py-3 text-sm font-bold shadow-md flex items-center justify-center gap-2">
            <i class="fa-solid fa-bag-shopping"></i>
            Place Order (${Formatter.currency(cart.totalAmount)})
          </button>
        </form>
      `;
    } catch (err) {
      const content = document.getElementById('checkoutContent');
      if (content) {
        content.innerHTML = EmptyState.renderError({
          title: 'Could not load checkout',
          message: ErrorHandler.format(err)
        });
      }
    }
  },

  async handlePlaceOrder(e) {
    e.preventDefault();
    const address = document.getElementById('checkoutAddressInput')?.value?.trim();
    const btn = document.getElementById('placeOrderBtn');
    const errBox = document.getElementById('checkoutErrorMsg');

    if (!address) {
      Toast.warning('Please enter a valid shipping address.');
      return;
    }

    try {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-2"></i> Placing your order...';
      errBox.classList.add('hidden');

      const orderResponse = await OrdersAPI.placeOrder({ shippingAddress: address });
      Toast.success('Order placed successfully!');
      
      // Clear local cart badge
      Store.cart = { items: [], totalAmount: 0 };
      Store.updateCartBadge();

      // Show Order Success Modal
      Modal.openOrderSuccess(orderResponse);
    } catch (err) {
      errBox.textContent = ErrorHandler.format(err);
      errBox.classList.remove('hidden');
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-bag-shopping mr-2"></i> Place Order';
    }
  },

  /**
   * Order Success Confirmation Screen
   */
  openOrderSuccess(order) {
    const container = this.init();

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
        <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-gray-200 dark:border-gray-800 text-center relative">
          <div class="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
            <i class="fa-solid fa-check"></i>
          </div>

          <h2 class="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Order Successfully Placed!</h2>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Thank you for shopping with SpringShop. Your order has been received and is being prepared.
          </p>

          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-left text-xs mb-6 space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-500">Order ID:</span>
              <span class="font-bold text-gray-800 dark:text-gray-200">#${order?.id || '—'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Date:</span>
              <span class="font-medium text-gray-800 dark:text-gray-200">${Formatter.date(order?.orderDate, true)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Total Amount:</span>
              <span class="font-bold text-[#55883B]">${Formatter.currency(order?.totalAmount)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Status:</span>
              <span class="font-semibold text-emerald-600">${order?.status || 'PENDING'}</span>
            </div>
            <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
              <span class="text-gray-500 block mb-0.5">Shipping to:</span>
              <span class="text-gray-800 dark:text-gray-200">${order?.shippingAddress || '—'}</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <button onclick="Modal.openOrders()" class="btn-primary flex-1 py-2.5 text-xs font-semibold">
              <i class="fa-solid fa-box mr-1.5"></i> View My Orders
            </button>
            <button onclick="Modal.close()" class="btn-outline flex-1 py-2.5 text-xs">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * My Orders Modal
   */
  async openOrders() {
    if (!AuthGuard.requireAuth(() => Modal.openOrders())) return;

    const container = this.init();

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto" id="ordersModalOverlay">
        <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 relative my-8 animate-fade-in" onclick="event.stopPropagation()">
          <button onclick="Modal.close()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>

          <div class="flex items-center gap-2 mb-6">
            <div class="w-9 h-9 rounded-lg bg-[#E6F0DC] text-[#55883B] flex items-center justify-center">
              <i class="fa-solid fa-box"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">My Order History</h2>
              <p class="text-xs text-gray-500">Track and manage all your SpringShop orders</p>
            </div>
          </div>

          <div id="myOrdersList">
            ${Loader.spinner('Fetching your orders...')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('ordersModalOverlay').onclick = (e) => {
      if (e.target.id === 'ordersModalOverlay') Modal.close();
    };

    try {
      const orders = await OrdersAPI.getMyOrders();
      const listEl = document.getElementById('myOrdersList');
      if (!listEl) return;

      if (!orders || orders.length === 0) {
        listEl.innerHTML = EmptyState.render({
          icon: 'fa-solid fa-box-open',
          title: 'No orders placed yet',
          description: 'When you place orders, they will show up here along with live tracking status.',
          actionText: 'Browse SpringShop Collection',
          actionHandler: () => Modal.close()
        });
        document.getElementById('emptyStateActionBtn')?.addEventListener('click', () => Modal.close());
        return;
      }

      listEl.innerHTML = `
        <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          ${orders.map(o => {
            const statusInfo = Formatter.orderStatus(o.status);
            const canCancel = o.status === 'PENDING' || o.status === 'PROCESSING';

            return `
              <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700 text-xs">
                  <div>
                    <span class="font-bold text-gray-900 dark:text-white">Order #${o.id}</span>
                    <span class="text-gray-400 ml-2">${Formatter.date(o.orderDate, true)}</span>
                  </div>
                  <span class="status-badge ${statusInfo.className}">
                    ${statusInfo.label}
                  </span>
                </div>

                <!-- Items list -->
                <div class="space-y-1.5 mb-3 text-xs">
                  ${(o.items || []).map(it => `
                    <div class="flex items-center justify-between text-gray-700 dark:text-gray-300">
                      <span>${it.productName} <span class="text-gray-400">× ${it.quantity}</span></span>
                      <span class="font-medium">${Formatter.currency(it.subtotal)}</span>
                    </div>
                  `).join('')}
                </div>

                <!-- Address & Total -->
                <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs">
                  <div class="text-gray-500 truncate max-w-xs">
                    <i class="fa-solid fa-location-dot text-[#55883B] mr-1"></i>
                    ${o.shippingAddress || 'Standard Shipping'}
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-sm text-gray-900 dark:text-white">
                      ${Formatter.currency(o.totalAmount)}
                    </span>
                    ${canCancel ? `
                      <button onclick="Modal.handleCancelOrder(${o.id})" class="text-xs text-rose-600 hover:text-rose-700 font-semibold">
                        Cancel Order
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } catch (err) {
      const listEl = document.getElementById('myOrdersList');
      if (listEl) {
        listEl.innerHTML = EmptyState.renderError({
          title: 'Could not fetch orders',
          message: ErrorHandler.format(err),
          retryHandlerName: 'Modal.openOrders'
        });
      }
    }
  },

  async handleCancelOrder(orderId) {
    Confirmation.open({
      title: 'Cancel Order #' + orderId + '?',
      message: 'Are you sure you want to cancel this order? Returned inventory will be restored.',
      confirmText: 'Yes, Cancel Order',
      confirmType: 'danger',
      onConfirm: async () => {
        try {
          await OrdersAPI.cancelOrder(orderId);
          Toast.info('Order #' + orderId + ' has been cancelled.');
          Modal.openOrders();
        } catch (err) {
          Toast.error(ErrorHandler.format(err));
        }
      }
    });
  },

  /**
   * User Profile Modal
   */
  async openProfile() {
    if (!AuthGuard.requireAuth(() => Modal.openProfile())) return;

    const container = this.init();

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="profileModalOverlay">
        <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 relative animate-fade-in" onclick="event.stopPropagation()">
          <button onclick="Modal.close()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>

          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 rounded-full bg-[#E6F0DC] text-[#55883B] dark:bg-[#1a2a16] dark:text-[#79bf54] flex items-center justify-center text-xl font-bold">
              <i class="fa-solid fa-user"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">My Profile</h2>
              <p class="text-xs text-gray-500">Manage your account information</p>
            </div>
          </div>

          <div id="profileModalBody">
            ${Loader.spinner('Loading profile...')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('profileModalOverlay').onclick = (e) => {
      if (e.target.id === 'profileModalOverlay') Modal.close();
    };

    try {
      const user = await UsersAPI.getMyProfile();
      const body = document.getElementById('profileModalBody');
      if (!body) return;

      body.innerHTML = `
        <form onsubmit="Modal.handleUpdateProfile(event)" class="space-y-4">
          <div id="profileErrorMsg" class="hidden p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-600 dark:text-rose-400"></div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input type="text" id="profileNameInput" required value="${user.name || ''}" class="form-input text-sm" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input type="email" id="profileEmailInput" required value="${user.email || ''}" class="form-input text-sm" />
          </div>

          <div class="pt-2 flex items-center justify-between text-xs">
            <span class="text-gray-500">Role: <strong class="text-gray-800 dark:text-gray-200">${user.role}</strong></span>
            <button type="button" onclick="Modal.openPasswordChange()" class="text-[#55883B] hover:underline font-semibold">
              <i class="fa-solid fa-key mr-1"></i> Change Password
            </button>
          </div>

          <div class="pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
            <button type="button" onclick="Modal.close()" class="btn-outline flex-1 py-2 text-xs">Cancel</button>
            <button type="submit" id="profileSaveBtn" class="btn-primary flex-1 py-2 text-xs font-semibold">Save Changes</button>
          </div>
        </form>
      `;
    } catch (err) {
      const body = document.getElementById('profileModalBody');
      if (body) {
        body.innerHTML = EmptyState.renderError({
          title: 'Could not load profile',
          message: ErrorHandler.format(err)
        });
      }
    }
  },

  async handleUpdateProfile(e) {
    e.preventDefault();
    const name = document.getElementById('profileNameInput')?.value?.trim();
    const email = document.getElementById('profileEmailInput')?.value?.trim();
    const btn = document.getElementById('profileSaveBtn');
    const errBox = document.getElementById('profileErrorMsg');

    try {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-1"></i> Saving...';
      errBox.classList.add('hidden');

      await UsersAPI.updateMyProfile({ name, email });
      Toast.success('Profile updated successfully!');
      Modal.close();
    } catch (err) {
      errBox.textContent = ErrorHandler.format(err);
      errBox.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Save Changes';
    }
  },

  /**
   * Password Change Modal
   */
  openPasswordChange() {
    const container = this.init();

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="passwordModalOverlay">
        <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 relative animate-fade-in" onclick="event.stopPropagation()">
          <button onclick="Modal.openProfile()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center">
            <i class="fa-solid fa-arrow-left"></i>
          </button>

          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Change Password</h3>
          <p class="text-xs text-gray-500 mb-4">Ensure your account uses a strong password</p>

          <div id="passwordErrorMsg" class="hidden mb-4 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-600 dark:text-rose-400"></div>

          <form onsubmit="Modal.handleChangePassword(event)" class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
              <input type="password" id="currentPasswordInput" required class="form-input text-xs" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input type="password" id="newPasswordInput" required minlength="6" class="form-input text-xs" />
            </div>
            <button type="submit" id="changePassBtn" class="btn-primary w-full py-2 text-xs font-semibold mt-2">
              Update Password
            </button>
          </form>
        </div>
      </div>
    `;
  },

  async handleChangePassword(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPasswordInput')?.value;
    const newPassword = document.getElementById('newPasswordInput')?.value;
    const btn = document.getElementById('changePassBtn');
    const errBox = document.getElementById('passwordErrorMsg');

    try {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-1"></i> Updating...';
      errBox.classList.add('hidden');

      await UsersAPI.changePassword({ currentPassword, newPassword });
      Toast.success('Password updated successfully!');
      Modal.close();
    } catch (err) {
      errBox.textContent = ErrorHandler.format(err);
      errBox.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Update Password';
    }
  }
};

window.Modal = Modal;
