/**
 * Storefront Footer Component
 */
const Footer = {
  render() {
    return `
      <footer class="bg-gray-900 text-gray-300 pt-16 pb-12 border-t border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
            
            <!-- Brand Column -->
            <div class="lg:col-span-2 space-y-4">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-[#55883B] text-white flex items-center justify-center font-bold text-base">
                  S
                </div>
                <span class="text-xl font-extrabold tracking-tight text-white">
                  Spring<span class="text-[#C1E899]">Shop</span>
                </span>
              </div>
              <p class="text-xs text-gray-400 leading-relaxed max-w-sm">
                SpringShop is an online fashion boutique offering curated women’s & men’s apparel, shoes, bags, and contemporary accessories designed for everyday confidence and effortless elegance.
              </p>
              
              <!-- Contact Info -->
              <div class="space-y-2 text-xs text-gray-400 pt-2">
                <p><i class="fa-solid fa-envelope text-[#C1E899] mr-2"></i> contact@springshop.fashion</p>
                <p><i class="fa-solid fa-phone text-[#C1E899] mr-2"></i> +1 (800) 555-SPRG</p>
                <p><i class="fa-solid fa-location-dot text-[#C1E899] mr-2"></i> Fashion District, 5th Avenue, NY</p>
              </div>

              <div class="flex items-center gap-3 pt-2">
                <a href="#" class="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#55883B] text-white flex items-center justify-center text-xs transition-colors" aria-label="Instagram">
                  <i class="fa-brands fa-instagram"></i>
                </a>
                <a href="#" class="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#55883B] text-white flex items-center justify-center text-xs transition-colors" aria-label="Facebook">
                  <i class="fa-brands fa-facebook-f"></i>
                </a>
                <a href="#" class="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#55883B] text-white flex items-center justify-center text-xs transition-colors" aria-label="Pinterest">
                  <i class="fa-brands fa-pinterest-p"></i>
                </a>
                <a href="#" class="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#55883B] text-white flex items-center justify-center text-xs transition-colors" aria-label="Twitter">
                  <i class="fa-brands fa-x-twitter"></i>
                </a>
              </div>
            </div>

            <!-- Shop Links -->
            <div class="space-y-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-white">Shop</h4>
              <ul class="space-y-2 text-xs text-gray-400">
                <li><a href="#productsSection" onclick="Store.filterByCategory(null)" class="hover:text-[#C1E899] transition-colors">All Products</a></li>
                <li><a href="#productsSection" class="hover:text-[#C1E899] transition-colors">Women's Collection</a></li>
                <li><a href="#productsSection" class="hover:text-[#C1E899] transition-colors">Men's Apparel</a></li>
                <li><a href="#productsSection" class="hover:text-[#C1E899] transition-colors">Footwear & Bags</a></li>
                <li><a href="#productsSection" class="hover:text-[#C1E899] transition-colors">New Season Arrivals</a></li>
              </ul>
            </div>

            <!-- Customer Care -->
            <div class="space-y-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-white">Customer Care</h4>
              <ul class="space-y-2 text-xs text-gray-400">
                <li><a href="javascript:void(0)" onclick="Toast.info('Fast 3-5 business day delivery on all domestic orders.')" class="hover:text-[#C1E899] transition-colors">Shipping Information</a></li>
                <li><a href="javascript:void(0)" onclick="Toast.info('We offer 30-day hassle-free returns on unworn items.')" class="hover:text-[#C1E899] transition-colors">Returns & Exchanges</a></li>
                <li><a href="javascript:void(0)" onclick="Toast.info('Need help? Email contact@springshop.fashion anytime.')" class="hover:text-[#C1E899] transition-colors">Help Center & FAQ</a></li>
                <li><a href="javascript:void(0)" onclick="Toast.info('Standard fit sizing chart applies to all clothing items.')" class="hover:text-[#C1E899] transition-colors">Size Guide</a></li>
                <li><a href="javascript:void(0)" onclick="Toast.info('Track your order inside My Orders.')" class="hover:text-[#C1E899] transition-colors">Order Tracking</a></li>
              </ul>
            </div>

            <!-- Account & Company -->
            <div class="space-y-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-white">Account & Trust</h4>
              <ul class="space-y-2 text-xs text-gray-400">
                <li><a href="javascript:void(0)" onclick="Modal.openProfile()" class="hover:text-[#C1E899] transition-colors">My Profile</a></li>
                <li><a href="javascript:void(0)" onclick="Modal.openOrders()" class="hover:text-[#C1E899] transition-colors">Order History</a></li>
                <li><a href="javascript:void(0)" onclick="Store.showWishlistModal()" class="hover:text-[#C1E899] transition-colors">Saved Wishlist</a></li>
                <li><a href="./../../../admin.html" class="text-[#C1E899] font-medium hover:underline">Admin Management Portal</a></li>
                <li><a href="javascript:void(0)" onclick="Toast.info('SpringShop guarantees 100% data privacy.')" class="hover:text-[#C1E899] transition-colors">Privacy & Terms</a></li>
              </ul>
            </div>

          </div>

          <!-- Bottom Copyright -->
          <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© 2026 SpringShop. All rights reserved.</p>
            <div class="flex items-center gap-4 text-sm text-gray-400">
              <i class="fa-brands fa-cc-visa" title="Visa"></i>
              <i class="fa-brands fa-cc-mastercard" title="MasterCard"></i>
              <i class="fa-brands fa-cc-apple-pay" title="Apple Pay"></i>
              <i class="fa-brands fa-cc-paypal" title="PayPal"></i>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
};

window.Footer = Footer;
