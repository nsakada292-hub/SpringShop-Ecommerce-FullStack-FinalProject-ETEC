import { useState, useEffect, useCallback } from 'react'
import type { Category } from '@/shared/types'
import { categoriesApi } from '@/shared/api/categories.api'

let cachedCategories: Category[] | null = null

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(cachedCategories ?? [])
  const [isLoading, setIsLoading] = useState(!cachedCategories)

  const fetchCategories = useCallback(async () => {
    if (cachedCategories) {
      setCategories(cachedCategories)
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
      const { data } = await categoriesApi.getAll()
      cachedCategories = data
      setCategories(data)
    } catch {
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const topLevel = categories.filter((c) => c.parentCategoryId === null)

  const getSubcategories = (parentId: number): Category[] =>
    categories.filter((c) => c.parentCategoryId === parentId)

  const refresh = async () => {
    cachedCategories = null
    await fetchCategories()
  }

  return { categories, topLevel, getSubcategories, isLoading, refresh }
}
