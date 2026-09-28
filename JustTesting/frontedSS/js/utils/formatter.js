export const formatter = {
  currency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(Number(amount) || 0);
  },
  date(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },
  dateTime(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  slug(text) {
    return (text || '').toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  },
  truncate(text, length = 60) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
};