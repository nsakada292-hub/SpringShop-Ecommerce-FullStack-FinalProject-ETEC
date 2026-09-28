// Maps the backend ProductResponse (Spring Boot) into the shape the
// storefront components expect. The backend returns camelCase fields:
//   id, productName, description, price, stockQuantity,
//   category: { id, categoryName, parentCategoryId }, size, color,
//   material, image (full URL), createdAt, updatedAt.
// size/color are SINGLE comma-separated strings (e.g. "S, M, L").
// Everything else (sizes[], colors[], images[], originalPrice) is a
// convenience the storefront derives from the backend data.

export function splitList(value) {
  if (Array.isArray(value)) {
    return value
      .map((v) => (v && typeof v === "object" ? v.name || v.value || v.hex || v : v))
      .filter(Boolean);
  }
  if (!value) return [];
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function normalizeProduct(raw) {
  if (!raw) return null;
  // Already normalized (or a raw object that happens to use the
  // storefront shape) — avoid double-mapping.
  if (raw.name !== undefined && raw.price !== undefined && raw.productName === undefined) {
    return raw;
  }

  const sizes = splitList(raw.sizes ?? raw.size);
  const colors = splitList(raw.colors ?? raw.color);
  const image = raw.image || (Array.isArray(raw.images) ? raw.images[0] : "") || "";
  const stock = Number(raw.stockQuantity ?? raw.stock ?? 0);
  const price = Number(raw.price ?? 0);
  const originalPrice = raw.originalPrice != null ? Number(raw.originalPrice) : null;

  const categoryRaw = raw.category;
  const category = categoryRaw
    ? {
        id: categoryRaw.id ?? raw.categoryId ?? null,
        name: categoryRaw.categoryName ?? categoryRaw.name ?? "",
        parentCategoryId: categoryRaw.parentCategoryId ?? null,
      }
    : {
        id: raw.categoryId ?? null,
        name: raw.categoryName ?? (typeof raw.category === "string" ? raw.category : ""),
        parentCategoryId: null,
      };

  return {
    id: raw.id,
    productId: raw.id,
    name: raw.productName ?? raw.name ?? "Untitled product",
    description: raw.description ?? "",
    price,
    originalPrice,
    stock,
    stockQuantity: stock,
    quantity: raw.quantity ?? stock,
    inStock: stock > 0,
    size: raw.size ?? null,
    color: raw.color ?? null,
    sizes,
    colors,
    material: raw.material ?? "",
    image,
    images: raw.images && raw.images.length ? [...raw.images] : image ? [image] : [],
    category,
    categoryId: category.id,
    categoryName: category.name,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
}

export function normalizeProducts(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeProduct).filter(Boolean);
}

// CartResponse items are flat: { id, productId, productName,
// productPrice, quantity, subtotal }. imageLookup lets us attach the
// product image from a cache so rows aren't empty.
export function normalizeCart(raw, imageLookup) {
  if (!raw) return { id: null, items: [], totalAmount: 0 };
  const items = (Array.isArray(raw.items) ? raw.items : []).map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.productName || item.name || "Product",
    price: Number(item.productPrice ?? item.price ?? 0),
    quantity: Number(item.quantity ?? 1),
    subtotal: Number(item.subtotal ?? 0),
    size: item.size ?? null,
    color: item.color ?? null,
    image: imageLookup ? imageLookup(item.productId) || item.image || "" : item.image || "",
  }));
  return {
    id: raw.id,
    items,
    totalAmount: Number(raw.totalAmount ?? 0),
  };
}

export function formatPrice(value, currency = "$") {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "";
  return `${currency}${Number(value).toFixed(2)}`;
}