/**
 * Form Input Validator Utilities
 */
export const validator = {
  isValidEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).trim().toLowerCase());
  },

  isStrongPassword(password) {
    return typeof password === 'string' && password.trim().length >= 6;
  },

  isNotEmpty(val) {
    return val !== undefined && val !== null && String(val).trim().length > 0;
  },

  isPositiveNumber(val) {
    const num = Number(val);
    return !isNaN(num) && num > 0;
  },

  isNonNegativeInteger(val) {
    const num = Number(val);
    return !isNaN(num) && Number.isInteger(num) && num >= 0;
  }
};
