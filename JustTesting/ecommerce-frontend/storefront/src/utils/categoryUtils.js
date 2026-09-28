// Helpers to interpret the backend's hierarchical CategoryResponse
// tree (parentCategoryId) through the storefront's fixed top-level
// navigation types (women / men / kid / beauty).
//
// The backend does not return a "type" field — categories are matched
// to a nav type by name semantics ("Men's Shirt" → men). Products are
// grouped under a category id, so filtering is "is this product in the
// descendant set of a type/subcategory node?".

export const TYPE_ALIASES = {
  women: ["women", "woman", "womens", "ladies", "femme"],
  men: ["men", "man", "mens", "guys", "homme"],
  kid: ["kid", "kids", "children", "child", "baby", "toddler"],
  beauty: ["beauty", "beaut", "cosmetic", "makeup", "skincare"],
};

// Same default rows as the design spec, used so menus/filters never
// render empty even before an admin seeds category data.
export const DEFAULT_SUBCATEGORIES = {
  women: ["Clothes", "Shoes", "Accessories"],
  men: ["Clothes", "Shoes", "Accessories"],
  kid: ["Clothes", "Shoes", "Accessories"],
  beauty: ["Skincare", "Haircare", "Makeup"],
};

export function tokenize(name) {
  return String(name || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function matchesType(name, type) {
  const n = String(name || "").toLowerCase().trim();
  const key = String(type || "").toLowerCase().trim();
  if (!n || !key) return false;
  if (n === key) return true;
  const aliases = TYPE_ALIASES[key] || [key];
  if (aliases.some((a) => n === a)) return true;
  if (aliases.some((a) => n.startsWith(`${a} `) || n.endsWith(` ${a}`))) return true;
  const tokens = tokenize(name);
  return aliases.some((a) => tokens.includes(a));
}

export function buildCategoryTree(categories) {
  const nodes = new Map();
  (Array.isArray(categories) ? categories : []).forEach((c) => {
    nodes.set(c.id, { ...c, children: [] });
  });
  const roots = [];
  nodes.forEach((node) => {
    const parentId = node.parentCategoryId;
    const parent = parentId != null ? nodes.get(parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export function findTypeRoot(roots, type) {
  if (!Array.isArray(roots)) return null;
  return roots.find((r) => matchesType(r.categoryName, type)) || null;
}

export function collectDescendantIds(node, into = new Set()) {
  if (!node) return into;
  into.add(node.id);
  for (const child of node.children || []) {
    collectDescendantIds(child, into);
  }
  return into;
}

export function findByName(node, name) {
  if (!node) return null;
  if (matchesType(node.categoryName, name)) return node;
  const tokens = tokenize(name);
  if (
    tokens.length > 0 &&
    tokens.every((t) => tokenize(node.categoryName).includes(t))
  ) {
    return node;
  }
  for (const child of node.children || []) {
    const hit = findByName(child, name);
    if (hit) return hit;
  }
  return null;
}

// The subcategory rows shown in the navbar dropdown / filter sidebar
// for a given type. Falls back to the spec's default rows when the
// backend tree has no children under that type yet.
export function rowsForType(roots, type) {
  const root = findTypeRoot(roots, type);
  if (!root || !root.children || root.children.length === 0) {
    return (DEFAULT_SUBCATEGORIES[String(type).toLowerCase()] || []).map((name) => ({
      name,
      isDefault: true,
    }));
  }
  return root.children.map((c) => ({ name: c.categoryName, isDefault: false }));
}

export function isDefaultRow(row) {
  return !!(row && row.isDefault);
}

export function productInType(product, roots, type) {
  const root = findTypeRoot(roots, type);
  if (!root) return false;
  return collectDescendantIds(root).has(product.categoryId ?? product.category?.id);
}

export function productInSubcategory(product, roots, type, subcategory) {
  if (!subcategory) return productInType(product, roots, type);
  const root = findTypeRoot(roots, type);
  if (!root) return false;
  const child = findByName(root, subcategory);
  if (!child) return false;
  return collectDescendantIds(child).has(product.categoryId ?? product.category?.id);
}

export function labelForType(roots, type, subcategory) {
  const root = findTypeRoot(roots, type);
  if (!root) return String(type || "").replace(/^\w/, (c) => c.toUpperCase());
  if (!subcategory) return root.categoryName;
  const child = findByName(root, subcategory);
  return child ? child.categoryName : String(subcategory);
}