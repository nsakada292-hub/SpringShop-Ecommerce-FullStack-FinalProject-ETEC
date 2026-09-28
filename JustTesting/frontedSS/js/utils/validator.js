export const validator = {
  isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  isNotEmpty(value) {
    return value !== null && value !== undefined && String(value).trim().length > 0;
  },
  isMinLength(value, min = 6) {
    return String(value || '').length >= min;
  },
  isPositiveNumber(val) {
    const num = Number(val);
    return !isNaN(num) && num > 0;
  }
};