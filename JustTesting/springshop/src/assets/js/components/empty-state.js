/**
 * Empty State & Error Display Component
 */
export const emptyState = {
  render({
    icon = 'search',
    title = 'No items found',
    description = 'Try adjusting your search or filters.',
    actionText = null,
    actionId = null,
    className = 'py-16',
  } = {}) {
    let iconSvg = '';
    if (icon === 'search') {
      iconSvg = `<svg class="w-12 h-12 text-slate-400 dark:text-slate-500 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path></svg>`;
    } else if (icon === 'cart') {
      iconSvg = `<svg class="w-12 h-12 text-slate-400 dark:text-slate-500 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"></path></svg>`;
    } else if (icon === 'box') {
      iconSvg = `<svg class="w-12 h-12 text-slate-400 dark:text-slate-500 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"></path></svg>`;
    } else if (icon === 'heart') {
      iconSvg = `<svg class="w-12 h-12 text-slate-400 dark:text-slate-500 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"></path></svg>`;
    } else if (icon === 'error') {
      iconSvg = `<svg class="w-12 h-12 text-rose-500 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"></path></svg>`;
    }

    return `
      <div class="flex flex-col items-center justify-center text-center px-4 ${className}">
        <div class="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-4 border border-slate-200/60 dark:border-slate-700/60">
          ${iconSvg}
        </div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">${title}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">${description}</p>
        ${
          actionText
            ? `<button id="${actionId || 'empty-action-btn'}" type="button" class="inline-flex items-center gap-2 px-5 py-2.5 bg-spring-dark-green hover:bg-emerald-800 text-white text-sm font-medium rounded-xl shadow-sm transition-all duration-200">
                ${actionText}
              </button>`
            : ''
        }
      </div>
    `;
  }
};
