/**
 * Pagination Component
 */
export const pagination = {
  render({ currentPage = 1, totalPages = 1, containerId = 'pagination-container' } = {}) {
    if (totalPages <= 1) return '';

    let pagesHtml = '';
    for (let i = 1; i <= totalPages; i++) {
      const isActive = i === currentPage;
      pagesHtml += `
        <button 
          type="button" 
          data-page="${i}"
          class="w-9 h-9 flex items-center justify-center rounded-xl text-xs font-semibold transition ${
            isActive
              ? 'bg-spring-dark-green text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }"
        >
          ${i}
        </button>
      `;
    }

    return `
      <div id="${containerId}" class="flex items-center justify-center gap-1.5 py-6">
        <button 
          type="button" 
          data-page="${currentPage - 1}"
          ${currentPage === 1 ? 'disabled' : ''}
          class="px-3 h-9 flex items-center justify-center rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Prev
        </button>

        ${pagesHtml}

        <button 
          type="button" 
          data-page="${currentPage + 1}"
          ${currentPage === totalPages ? 'disabled' : ''}
          class="px-3 h-9 flex items-center justify-center rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Next
        </button>
      </div>
    `;
  }
};
