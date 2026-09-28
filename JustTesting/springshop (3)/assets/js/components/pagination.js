/**
 * Pagination Component
 */
const Pagination = {
  render({
    currentPage = 1,
    totalPages = 1,
    onPageChange = 'window.Store.changePage'
  }) {
    if (totalPages <= 1) return '';

    let html = `
      <div class="flex items-center justify-center gap-1.5 my-8">
        <button 
          ${currentPage === 1 ? 'disabled' : ''} 
          onclick="${onPageChange}(${currentPage - 1})"
          class="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          aria-label="Previous Page">
          <i class="fa-solid fa-chevron-left text-xs"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      // Show first, last, and window around current page
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        const isActive = i === currentPage;
        html += `
          <button 
            onclick="${onPageChange}(${i})"
            class="w-9 h-9 rounded-md text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-[#55883B] text-white shadow-sm' 
                : 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }">
            ${i}
          </button>
        `;
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        html += '<span class="px-1 text-gray-400">...</span>';
      }
    }

    html += `
        <button 
          ${currentPage === totalPages ? 'disabled' : ''} 
          onclick="${onPageChange}(${currentPage + 1})"
          class="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          aria-label="Next Page">
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </button>
      </div>
    `;

    return html;
  }
};

window.Pagination = Pagination;
