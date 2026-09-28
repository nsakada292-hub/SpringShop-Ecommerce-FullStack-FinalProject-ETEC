import { formatter } from '../utils/formatter.js';

export const productCard = {
  render(product) {
    const isOutOfStock = product.stock <= 0;
    const imageUrl = product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
    return `
      <div class="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full" data-product-id="${product.id}">
        <div class="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img src="${imageUrl}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          ${isOutOfStock ? `<span class="absolute top-2 right-2 bg-slate-900/80 text-white text-xs font-semibold px-2 py-1 rounded">Out of Stock</span>` : ''}
          ${product.badge ? `<span class="absolute top-2 left-2 bg-spring-dark-green text-white text-xs font-bold px-2.5 py-1 rounded-full">${product.badge}</span>` : ''}
        </div>
        <div class="p-4 flex-1 flex flex-col">
          <div class="text-xs font-medium text-slate-400 mb-1">${product.categoryName || 'Apparel'}</div>
          <h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm line-clamp-1 mb-1">${product.name}</h3>
          <p class="text-xs text-slate-500 line-clamp-2 mb-3 flex-1">${product.description || ''}</p>
          <div class="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
            <span class="font-bold text-spring-dark-green text-base">${formatter.currency(product.price)}</span>
            <button class="add-to-cart-btn px-3 py-1.5 bg-spring-dark-green text-white text-xs font-semibold rounded-lg hover:opacity-90 transition active:scale-95 disabled:opacity-50" ${isOutOfStock ? 'disabled' : ''} data-id="${product.id}">
              ${isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
};