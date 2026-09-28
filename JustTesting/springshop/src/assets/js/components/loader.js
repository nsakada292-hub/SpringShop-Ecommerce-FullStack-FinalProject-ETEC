/**
 * Skeleton and Loading UI Components
 */
export const loader = {
  renderProductSkeletons(count = 8) {
    return Array.from({ length: count })
      .map(
        () => `
      <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 overflow-hidden flex flex-col justify-between">
        <div class="w-full aspect-[4/5] rounded-xl skeleton-shimmer mb-4"></div>
        <div class="space-y-2.5">
          <div class="h-3 w-1/3 rounded-full skeleton-shimmer"></div>
          <div class="h-4 w-3/4 rounded-full skeleton-shimmer"></div>
          <div class="h-4 w-1/2 rounded-full skeleton-shimmer"></div>
          <div class="pt-2 flex items-center justify-between">
            <div class="h-5 w-1/4 rounded-full skeleton-shimmer"></div>
            <div class="h-9 w-24 rounded-xl skeleton-shimmer"></div>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  },

  renderTableSkeletons(rows = 5, cols = 5) {
    return Array.from({ length: rows })
      .map(
        () => `
      <tr class="border-b border-slate-100 dark:border-slate-800 animate-pulse">
        ${Array.from({ length: cols })
          .map(
            () => `
          <td class="px-6 py-4">
            <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
          </td>
        `
          )
          .join('')}
      </tr>
    `
      )
      .join('');
  },

  spinner(size = 'w-5 h-5') {
    return `
      <svg class="animate-spin ${size} text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
    `;
  }
};
