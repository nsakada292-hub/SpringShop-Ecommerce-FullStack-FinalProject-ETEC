import { useState, useEffect } from 'react';
import { Category } from '../types';
import { categoryApi } from '../api/categoryApi';

let cachedCategories: Category[] | null = null;
let fetchPromise: Promise<Category[]> | null = null;

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(cachedCategories || []);
  const [loading, setLoading] = useState<boolean>(!cachedCategories);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async (forceRefresh = false) => {
    if (!forceRefresh && cachedCategories) {
      setCategories(cachedCategories);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      if (!fetchPromise || forceRefresh) {
        fetchPromise = categoryApi.getAll();
      }
      const data = await fetchPromise;
      cachedCategories = data;
      setCategories(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
      fetchPromise = null;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const topLevelCategories = categories.filter(c => c.parentCategoryId === null);

  const getSubcategories = (parentId: number) => {
    return categories.filter(c => c.parentCategoryId === parentId);
  };

  const getCategoryTree = () => {
    const tree: { [key: string]: { parent: Category; subcategories: Category[] } } = {};
    topLevelCategories.forEach(parent => {
      const key = parent.categoryName.toLowerCase();
      tree[key] = {
        parent,
        subcategories: getSubcategories(parent.id)
      };
    });
    return tree;
  };

  return {
    categories,
    topLevelCategories,
    getSubcategories,
    getCategoryTree,
    loading,
    error,
    refreshCategories: () => fetchCategories(true)
  };
}
