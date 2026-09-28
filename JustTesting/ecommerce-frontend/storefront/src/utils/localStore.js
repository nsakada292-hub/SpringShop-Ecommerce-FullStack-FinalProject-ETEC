// Tiny localStorage / sessionStorage JSON wrappers so feature code
// (guest cart, love-list, pending auth email) can persist state
// without tripping over storage-quota or serialization errors.

const STORE_PREFIX = "lagoon_store";
const SESSION_PREFIX = "lagoon_session";

function buildKey(prefix, name) {
  return `${prefix}_${String(name).toLowerCase()}`;
}

export function readStore(name, fallback) {
  try {
    const raw = localStorage.getItem(buildKey(STORE_PREFIX, name));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore(name, value) {
  try {
    localStorage.setItem(buildKey(STORE_PREFIX, name), JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function removeStore(name) {
  try {
    localStorage.removeItem(buildKey(STORE_PREFIX, name));
  } catch {
    /* ignore */
  }
}

export function readSession(name, fallback) {
  try {
    const raw = sessionStorage.getItem(buildKey(SESSION_PREFIX, name));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    try {
      return sessionStorage.getItem(buildKey(SESSION_PREFIX, name)) || fallback;
    } catch {
      return fallback;
    }
  }
}

export function writeSession(name, value) {
  try {
    if (typeof value === "string") {
      sessionStorage.setItem(buildKey(SESSION_PREFIX, name), value);
    } else {
      sessionStorage.setItem(buildKey(SESSION_PREFIX, name), JSON.stringify(value));
    }
  } catch {
    /* ignore */
  }
}

export function removeSession(name) {
  try {
    sessionStorage.removeItem(buildKey(SESSION_PREFIX, name));
  } catch {
    /* ignore */
  }
}