/**
 * Product Card Component
 * Reusable product rendering for storefront catalog, search results, and recommendations
 */
const ProductCard = {
  render(product, isLiked = false) {
    if (!product) return '';

    const id = product.id;
    const name = product.productName || 'Fashion Item';
    const price = product.price || 0;
    const stock = product.stockQuantity !== undefined ? product.stockQuantity : 10;
    const categoryName = product.category ? product.category.categoryName : 'Fashion';
    
    // Resolve Image URL (local Spring Boot uploads URL or placeholder)
    let imageUrl = product.image;
    if (!imageUrl || imageUrl === '' || imageUrl === 'null') {
      imageUrl = CONFIG.PLACEHOLDER_PRODUCT_IMAGE;
    } else if (imageUrl.startsWith('uploads/')) {
      imageUrl = `${CONFIG.API_BASE_URL}/${imageUrl}`;
    }

    const isOutOfStock = stock <= 0;

    return `
      <div class="product-card rounded-xl overflow-hidden flex flex-col group relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl" data-product-id="${id}">
        <!-- Image Container -->
        <div class="product-image-container relative overflow-hidden bg-gray-50 dark:bg-gray-900 cursor-pointer" onclick="window.Store.viewProductDetails(${id})">
          <img 
            src="${imageUrl}" 
            alt="${name}" 
            loading="lazy"
            onerror="this.onerror=null; this.src='${CONFIG.PLACEHOLDER_PRODUCT_IMAGE}';"
            class="product-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          <!-- Badges -->
          <div class="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            ${isOutOfStock ? `
              <span class="badge-stock bg-red-600 text-white font-medium text-[11px] px-2 py-0.5 rounded shadow-sm">
                Out of Stock
              </span>
            ` : stock < 5 ? `
              <span class="badge-stock bg-amber-600 text-white font-medium text-[11px] px-2 py-0.5 rounded shadow-sm">
                Only ${stock} Left
              </span>
            ` : ''}
            ${product.size ? `
              <span class="bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                ${product.size}
              </span>
            ` : ''}
          </div>

          <!-- Wishlist Heart Button -->
          <button 
            type="button"
            onclick="event.stopPropagation(); window.Store.toggleWishlist(${id});"
            class="heart-btn absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 backdrop-blur-xs flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-gray-800 transition-transform ${isLiked ? 'liked text-red-500' : ''}"
            aria-label="Add to Wishlist"
            id="wishlist-btn-${id}">
            <i class="${isLiked ? 'fa-solid text-red-500' : 'fa-regular'} fa-heart"></i>
          </button>
        </div>

        <!-- Details -->
        <div class="p-4 flex flex-col flex-1">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-xs font-semibold text-[#55883B] dark:text-[#79bf54] uppercase tracking-wider">
              ${categoryName}
            </span>
            ${product.rating !== undefined ? `
              <div class="flex items-center text-xs font-medium text-amber-500 gap-1">
                <i class="fa-solid fa-star text-[11px]"></i>
                <span>${Number(product.rating || 5).toFixed(1)}</span>
              </div>
            ` : ''}
          </div>

          <h3 
            onclick="window.Store.viewProductDetails(${id})"
            class="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-[#55883B] dark:hover:text-[#79bf54] transition-colors line-clamp-1 cursor-pointer mb-2">
            ${name}
          </h3>

          <div class="mt-auto pt-2 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800/60">
            <div class="flex flex-col">
              <span class="text-xs text-gray-400 font-medium">Price</span>
              <span class="text-base font-bold text-gray-900 dark:text-white">
                ${Formatter.currency(price)}
              </span>
            </div>

            <button 
              type="button"
              ${isOutOfStock ? 'disabled' : ''}
              onclick="event.stopPropagation(); window.Store.addToCart(${id}, 1);"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isOutOfStock 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-[#55883B] hover:bg-[#456f30] text-white shadow-sm hover:shadow active:scale-95'
              }"
              aria-label="Add ${name} to cart"
              id="add-cart-btn-${id}">
              <i class="fa-solid fa-cart-shopping"></i>
              <span>${isOutOfStock ? 'Sold Out' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
};

window.ProductCard = ProductCard;
