/**
 * Formatter Utilities
 * Formats currency, dates, ratings, and strings
 */
const Formatter = {
  /**
   * Format number or string as USD currency
   * @param {number|string} amount
   * @returns {string} e.g. "$29.99"
   */
  currency(amount) {
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
      return '$0.00';
    }
    const num = Number(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  },

  /**
   * Format ISO date string into human-friendly date
   * @param {string|Date} dateStr 
   * @returns {string} e.g. "Aug 25, 2026"
   */
  date(dateStr) {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(d);
    } catch {
      return String(dateStr);
    }
  },

  /**
   * Format datetime with time
   */
  dateTime(dateStr) {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch {
      return String(dateStr);
    }
  },

  /**
   * Generate HTML stars from rating number (0-5)
   * @param {number} rating 
   * @returns {string} HTML string
   */
  stars(rating) {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    const fullStars = Math.floor(r);
    const halfStar = (r - fullStars) >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    let html = '<div class="flex items-center text-amber-500 text-sm gap-0.5" aria-label="' + r + ' out of 5 stars">';
    for (let i = 0; i < fullStars; i++) {
      html += '<i class="fa-solid fa-star"></i>';
    }
    if (halfStar) {
      html += '<i class="fa-solid fa-star-half-stroke"></i>';
    }
    if (emptyStars > 0) {
      for (let i = 0; i < emptyStars; i++) {
        html += '<i class="fa-regular fa-star text-gray-300 dark:text-gray-600"></i>';
      }
    }
    html += `<span class="ml-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">${r.toFixed(1)}</span></div>`;
    return html;
  },

  /**
   * Format Order Status badge
   * @param {string} status 
   * @returns {{ label: string, className: string }}
   */
  orderStatus(status) {
    const s = String(status || 'PENDING').toUpperCase();
    const map = {
      PENDING: { label: 'Pending', className: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' },
      PROCESSING: { label: 'Processing', className: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800' },
      SHIPPED: { label: 'Shipped', className: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800' },
      DELIVERED: { label: 'Delivered', className: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' },
      CANCELLED: { label: 'Cancelled', className: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800' }
    };
    return map[s] || { label: s, className: 'bg-gray-100 text-gray-800 border border-gray-200' };
  },

  /**
   * Truncate text with ellipsis
   */
  truncate(text, maxLength = 80) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }
};

window.Formatter = Formatter;