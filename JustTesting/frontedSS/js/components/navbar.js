import { authGuard } from '../utils/auth-guard.js';

export const navbar = {
  render() {
    const user = authGuard.getUser();
    const isAdmin = authGuard.isAdmin();
    return `
      <header class="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <a href="/index.html" class="flex items-center gap-2 font-bold text-xl tracking-tight text-spring-dark-green dark:text-spring-primary-green">
            <span class="p-1.5 rounded-lg bg-spring-light-green text-spring-dark-green">🌿</span>
            <span>SpringShop</span>
          </a>
          <div class="flex items-center gap-3">
            <button id="theme-toggle-btn" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
              🌙
            </button>
            <button id="cart-drawer-toggle" class="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
              🛒 <span id="nav-cart-badge" class="absolute -top-1 -right-1 bg-spring-dark-green text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">0</span>
            </button>
            ${isAdmin ? `<a href="/admin.html" class="px-3 py-1.5 text-xs font-semibold rounded-md bg-spring-dark-green text-white hover:opacity-90">Admin Dashboard</a>` : ''}
            ${user ? `<button id="nav-logout-btn" class="text-xs text-slate-500 hover:text-red-500">Sign Out</button>` : `<button id="nav-login-btn" class="text-xs font-semibold text-spring-dark-green">Sign In</button>`}
          </div>
        </div>
      </header>
    `;
  }
};