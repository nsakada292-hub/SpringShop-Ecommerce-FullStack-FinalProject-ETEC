/**
 * Product Card Component
 * Renders consistent, accessible, high-aesthetic product cards for storefront and admin preview
 */
import { formatter } from '../utils/formatter.js';
import { storage } from '../utils/storage.js';

export const productCard = {
  getPlaceholderImage() {
    return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';
  },

  render(product, options = {}) {
    if (!product) return '';

    const id = product.id;
    const name = product.productName || 'Untitled Product';
    const price = product.price || 0;
    const categoryName = product.category?.categoryName || 'Fashion';
    const categoryId = product.category?.id || '';
    const image = product.image || this.getPlaceholderImage();
    const stock = product.stockQuantity !== undefined ? product.stockQuantity : 10;
    const isOut = stock <= 0;
    const isLow = stock > 0 && stock <= 5;
    const isWishlisted = storage.isWishlisted(id);

    const size = product.size || '';
    const color = product.color || '';

    return `
      <article data-product-id="${id}" class="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-xs hover:shadow-xl hover:border-spring-primary-green/60 dark:hover:border-spring-dark-green/60 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer">
        <!-- Image Container -->
        <div class="relative w-full aspect-[4/5] bg-slate-100 dark:bg-slate-800/50 overflow-hidden">
          <img 
            src="${image}" 
            alt="${name}" 
            loading="lazy"
            class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';"
          />

          <!-- Badges & Wishlist Overlay -->
          <div class="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-white/90 dark:bg-slate-900/90 text-spring-dark-green border border-slate-200/50 dark:border-slate-700/50 shadow-xs backdrop-blur-xs">
              ${categoryName}
            </span>

            <button 
              type="button" 
              data-wishlist-btn="${id}" 
              class="pointer-events-auto w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 flex items-center justify-center text-slate-400 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 shadow-xs backdrop-blur-xs transition-colors"
              aria-label="Add to Wishlist"
              title="Add to Wishlist"
            >
              <svg class="w-4 h-4 transition-transform duration-200 ${isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : 'fill-none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"></path>
              </svg>
            </button>
          </div>

          <!-- Stock Pill if Low or Out -->
          ${
            isOut
              ? `<div class="absolute bottom-3 left-3 bg-rose-600/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md shadow-xs">Out of Stock</div>`
              : isLow
              ? `<div class="absolute bottom-3 left-3 bg-amber-600/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md shadow-xs">Only ${stock} left</div>`
              : ''
          }
        </div>

        <!-- Product Info Body -->
        <div class="p-4 flex flex-col flex-1 justify-between gap-3">
          <div>
            <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>${size || color ? `${[size, color].filter(Boolean).join(' · ')}` : 'Regular Fit'}</span>
              <span class="flex items-center gap-1 text-amber-500 font-medium">
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <span>4.8</span>
              </span>
            </div>

            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-spring-dark-green transition-colors line-clamp-1">
              ${name}
            </h3>
          </div>

          <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div class="text-base font-bold text-slate-900 dark:text-slate-100">
              ${formatter.currency(price)}
            </div>

            <button 
              type="button" 
              data-add-cart-btn="${id}"
              ${isOut ? 'disabled' : ''} 
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                isOut
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-spring-light-green hover:bg-spring-primary-green text-spring-dark-green border border-spring-primary-green/50 active:scale-95'
              }"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span>Add</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }
};
