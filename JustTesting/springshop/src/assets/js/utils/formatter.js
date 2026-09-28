/**
 * Data Formatting Utilities
 */
import { CONFIG } from '../config.js';

export const formatter = {
  currency(amount) {
    const num = Number(amount) || 0;
    return `${CONFIG.BRAND.DEFAULT_CURRENCY}${num.toFixed(2)}`;
  },

  date(dateString) {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  dateTime(dateString) {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  truncate(str, maxLength = 60) {
    if (!str) return '';
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
  },

  stars(rating = 0) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return { full, half, empty, numeric: Number(rating).toFixed(1) };
  }
};
