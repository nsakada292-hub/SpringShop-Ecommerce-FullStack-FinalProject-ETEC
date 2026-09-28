/**
 * Validator Utility
 */
const Validator = {
  isEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  isPasswordValid(password) {
    return typeof password === 'string' && password.trim().length >= 6;
  },

  isRequired(val) {
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    return true;
  },

  isPositiveNumber(val) {
    const n = Number(val);
    return !isNaN(n) && n >= 0;
  }
};

window.Validator = Validator;
