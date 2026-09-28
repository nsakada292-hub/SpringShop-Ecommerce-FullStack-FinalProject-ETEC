import api from "./api";
import { readStore, writeStore } from "../utils/localStore";
import { normalizeProducts } from "../utils/productMapping";

// The Spring Boot backend in this project does not ship wishlist
// endpoints. The love-list is therefore persisted locally so the
// feature works everywhere; server calls are made best-effort and
// silently ignored if the endpoints are added later.
const KEY = "wishlist";

function localList() {
  return readStore(KEY, []);
}

function snapshotOf(product) {
  if (product && product.name !== undefined && product.price !== undefined) {
    return {
      id: product.id,
      name: product.name,
      price: Number(product.price ?? 0),
      image: product.image || product.images?.[0] || "",
      inStock: product.inStock,
      size: product.size ?? null,
      color: product.color ?? null,
    };
  }
  return null;
}

export async function getWishlist() {
  try {
    const res = await api.get("/wishlist");
    const data = normalizeProducts(res.data?.products || res.data);
    if (data.length) writeStore(KEY, data);
  } catch {
    // endpoints absent — keep local list
  }
  return { data: localList() };
}

export async function addToWishlist(product) {
  const snapshot = snapshotOf(product);
  if (snapshot) {
    const list = localList();
    if (!list.some((p) => p.id === snapshot.id)) {
      writeStore(KEY, [snapshot, ...list]);
    }
  }
  try {
    await api.post(`/wishlist/${product.id}`);
  } catch {
    // unsupported — ignore
  }
  return { data: localList() };
}

export async function removeFromWishlist(productId) {
  writeStore(KEY, localList().filter((p) => p.id !== productId));
  try {
    await api.delete(`/wishlist/${productId}`);
  } catch {
    // unsupported — ignore
  }
  return { data: localList() };
}