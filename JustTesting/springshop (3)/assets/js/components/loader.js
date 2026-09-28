/**
 * Loader Component
 * Generates skeleton placeholders and loading spinners
 */
const Loader = {
  /**
   * Skeleton cards for product grids
   */
  productGridSkeletons(count = 8) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="product-card rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 p-3">
          <div class="aspect-[3/4] w-full rounded-md skeleton mb-3"></div>
          <div class="h-3 w-1/3 skeleton rounded mb-2"></div>
          <div class="h-4 w-3/4 skeleton rounded mb-3"></div>
          <div class="flex justify-between items-center mt-3">
            <div class="h-5 w-16 skeleton rounded"></div>
            <div class="h-8 w-20 skeleton rounded-md"></div>
          </div>
        </div>
      `;
    }
    return html;
  },

  /**
   * Spinner component
   */
  spinner(text = 'Loading...', size = 'md') {
    const sizeClasses = size === 'sm' ? 'w-5 h-5 border-2' : size === 'lg' ? 'w-10 h-10 border-3' : 'w-7 h-7 border-2';
    return `
      <div class="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400 gap-3">
        <div class="${sizeClasses} border-t-transparent border-[#55883B] rounded-full animate-spin"></div>
        ${text ? `<span class="text-sm font-medium">${text}</span>` : ''}
      </div>
    `;
  },

  /**
   * Table row skeletons for admin
   */
  tableSkeletons(cols = 5, rows = 5) {
    let html = '';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        html += `<td class="p-4"><div class="h-4 w-${c === 0 ? '12' : c === 1 ? '32' : '20'} skeleton rounded"></div></td>`;
      }
      html += '</tr>';
    }
    return html;
  }
};

window.Loader = Loader;
