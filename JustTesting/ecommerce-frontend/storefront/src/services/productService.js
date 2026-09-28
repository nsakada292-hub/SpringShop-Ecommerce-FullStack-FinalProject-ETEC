import api from "./api";
import { normalizeProducts, normalizeProduct } from "../utils/productMapping";

// Small in-memory cache of normalized products. Used to enrich flat
// cart rows (the backend only returns productId/productName/price on
// cart items) with images without an extra fetch per row.
const productCache = new Map();

export function cacheProduct(product) {
  if (!product || product.id == null) return;
  productCache.set(product.id, product);
}

export function getCachedProduct(productId) {
  return productCache.get(productId) || null;
}

function remember(list) {
  list.forEach(cacheProduct);
  return list;
}

export const getProducts = async (params) => {
  const res = await api.get("/products", { params });
  return { ...res, data: remember(normalizeProducts(res.data)) };
};

export const getProductById = async (id) => {
  const res = await api.get(`/products/${id}`);
  return { ...res, data: cacheProduct(normalizeProduct(res.data)) };
};

export const searchProducts = async (keyword) => {
  const res = await api.get("/products/search", { params: { keyword } });
  return { ...res, data: remember(normalizeProducts(res.data)) };
};

export const getProductsByCategory = async (categoryId) => {
  const res = await api.get(`/products/category/${categoryId}`);
  return { ...res, data: remember(normalizeProducts(res.data)) };
};

// The backend has no dedicated related endpoint, so we compute it:
// products from the same category subtree, current product excluded.
export const getRelatedProducts = async (productId, limit = 4) => {
  const current =
    getCachedProduct(productId) ||
    normalizeProduct((await api.get(`/products/${productId}`)).data);
  const all = remember(normalizeProducts((await api.get("/products")).data));
  const categoryId = current?.categoryId;
  const related = all.filter((p) => {
    if (p.id === productId) return false;
    if (categoryId != null) return p.categoryId === categoryId;
    return current?.categoryName && p.categoryName === current.categoryName;
  });
  return related.slice(0, limit);
};