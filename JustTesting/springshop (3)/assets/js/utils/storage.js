/**
 * Storage Utility
 * Safe localStorage wrapper with JSON serialization and key management
 */
const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null || item === undefined) return defaultValue;
      try {
        return JSON.parse(item);
      } catch (_) {
        return item;
      }
    } catch (e) {
      console.warn(`[Storage] Failed to read key: ${key}`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[Storage] Failed to save key: ${key}`, e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`[Storage] Failed to remove key: ${key}`, e);
    }
  },

  clear() {
    try {
      localStorage.clear();
    } catch (e) {
      console.error(`[Storage] Failed to clear storage`, e);
    }
  }
};

window.Storage = Storage;
