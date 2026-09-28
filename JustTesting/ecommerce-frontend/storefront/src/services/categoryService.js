import api from "./api";
import { buildCategoryTree } from "../utils/categoryUtils";

let treeCache = null;

export const getCategories = () => api.get("/categories");

export const getCategory = (id) => api.get(`/categories/${id}`);

export const getTopLevelCategories = () => api.get("/categories/top-level");

export const getSubcategories = (categoryId) =>
  api.get(`/categories/${categoryId}/subcategories`);

// Category tree with children built from parentCategoryId. Cached for
// the session so navbar dropdowns, the filter sidebar and the category
// pages all share one consistent view.
export const getCategoryTree = async (refresh = false) => {
  if (treeCache && !refresh) return treeCache;
  const res = await api.get("/categories");
  treeCache = buildCategoryTree(res.data);
  return treeCache;
};

export const resetCategoryCache = () => {
  treeCache = null;
};