/**
 * Storefront Navbar Controller
 */
import { storage } from '../utils/storage.js';
import { categoriesApi } from '../api/categories.js';

export const navbar = {
  async initCategoriesDropdown(dropdownElId = 'navbar-categories-dropdown') {
    const dropdown = document.getElementById(dropdownElId);
    if (!dropdown) return;

    try {
      const topCategories = await categoriesApi.getTopLevel();
      if (!topCategories || topCategories.length === 0) {
        dropdown.innerHTML = '<div class="px-4 py-2 text-xs text-slate-400">No categories found</div>';
        return;
      }

      let html = '<div class="py-2 grid grid-cols-1 gap-1 min-w-[200px]">';
      for (const cat of topCategories) {
        html += `
          <button 
            type="button" 
            data-nav-category-id="${cat.id}"
            data-nav-category-name="${cat.categoryName}"
            class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-spring-light-green/40 dark:hover:bg-slate-800 hover:text-spring-dark-green rounded-lg transition flex items-center justify-between group"
          >
            <span>${cat.categoryName}</span>
            <svg class="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        `;
      }
      html += '</div>';
      dropdown.innerHTML = html;
    } catch (err) {
      console.warn('Could not load categories for navbar dropdown:', err);
    }
  },

  updateCartBadge(itemCount = 0) {
    const badges = document.querySelectorAll('.cart-badge-count');
    badges.forEach((el) => {
      el.textContent = String(itemCount);
      if (itemCount > 0) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });
  },

  updateWishlistBadge(count = 0) {
    const badges = document.querySelectorAll('.wishlist-badge-count');
    badges.forEach((el) => {
      el.textContent = String(count);
      if (count > 0) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });
  },

  updateAuthState() {
    const user = storage.getUser();
    const token = storage.getToken();
    const isLoggedIn = !!(token && user);
    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN');

    const authGuestElements = document.querySelectorAll('.auth-guest-only');
    const authUserElements = document.querySelectorAll('.auth-user-only');
    const authAdminElements = document.querySelectorAll('.auth-admin-only');
    const userNameElements = document.querySelectorAll('.auth-user-name');
    const userEmailElements = document.querySelectorAll('.auth-user-email');

    authGuestElements.forEach((el) => {
      if (isLoggedIn) el.classList.add('hidden');
      else el.classList.remove('hidden');
    });

    authUserElements.forEach((el) => {
      if (isLoggedIn) el.classList.remove('hidden');
      else el.classList.add('hidden');
    });

    authAdminElements.forEach((el) => {
      if (isLoggedIn && isAdmin) el.classList.remove('hidden');
      else el.classList.add('hidden');
    });

    if (isLoggedIn && user) {
      userNameElements.forEach((el) => (el.textContent = user.name || 'Account'));
      userEmailElements.forEach((el) => (el.textContent = user.email || ''));
    }
  }
};
