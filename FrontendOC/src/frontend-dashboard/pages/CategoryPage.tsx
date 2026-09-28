import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/shared/utils/cn'
import { categoriesApi } from '@/shared/api/categories.api'
import type { Category } from '@/shared/types'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Skeleton } from '@/shared/components/ui/Skeleton'

const categorySchema = z.object({
  categoryName: z.string().min(1, 'Category name is required'),
  parentCategoryId: z.coerce.number().optional(),
  description: z.string(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

const PAGE_SIZE = 8

interface CategoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingCategory: Category | null
  topLevelCategories: Category[]
  onSaved: () => void
}

function CategoryFormModal({ isOpen, onClose, editingCategory, topLevelCategories, onSaved }: CategoryFormModalProps) {
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { categoryName: '', parentCategoryId: 0, description: '' },
  })

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        reset({
          categoryName: editingCategory.categoryName,
          parentCategoryId: editingCategory.parentCategoryId ?? 0,
          description: editingCategory.description ?? '',
        })
      } else {
        reset({ categoryName: '', parentCategoryId: 0, description: '' })
      }
    }
  }, [isOpen, editingCategory, reset])

  const onSubmit = async (values: CategoryFormValues) => {
    setSubmitting(true)
    try {
      const payload = {
        categoryName: values.categoryName,
        parentCategoryId: values.parentCategoryId || null,
        description: values.description,
      }
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, payload)
        toast.success('Category updated')
      } else {
        await categoriesApi.create(payload)
        toast.success('Category created')
      }
      onClose()
      onSaved()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-surface-900 border text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-aqua/30 focus:border-brand-aqua transition-all'
  const labelClass = 'block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingCategory ? 'Edit Category' : 'Create Category'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelClass}>Category Name</label>
          <input className={inputClass} {...register('categoryName')} placeholder="e.g. Apparel" />
          {errors.categoryName && <p className="mt-1 text-xs text-red-500">{errors.categoryName.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Parent Category</label>
          <select className={cn(inputClass, 'appearance-none')} {...register('parentCategoryId')}>
            <option value={0}>None (top-level)</option>
            {topLevelCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.categoryName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            className={cn(inputClass, 'min-h-[80px] resize-y')}
            {...register('description')}
            placeholder="Category description..."
          />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={submitting}>
            {editingCategory ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await categoriesApi.getAll()
      setCategories(data)
    } catch {
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const topLevelCategories = useMemo(
    () => categories.filter((c) => c.parentCategoryId === null),
    [categories]
  )

  const categoryName = (id: number | null | undefined): string => {
    if (!id) return '-'
    const c = categories.find((x) => x.id === id)
    return c ? c.categoryName : `#${id}`
  }

  const getSubcategories = (parentId: number) =>
    categories.filter((c) => c.parentCategoryId === parentId)

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list: Category[] = []
    topLevelCategories.forEach((top) => {
      list.push(top)
      categories
        .filter((c) => c.parentCategoryId === top.id)
        .forEach((sub) => list.push(sub))
    })
    const orphans = categories.filter((c) => c.parentCategoryId !== null && !topLevelCategories.some((t) => t.id === c.parentCategoryId))
    orphans.forEach((o) => list.push(o))
    if (!q) return list
    return list.filter((c) => {
      const parent = c.parentCategoryId != null ? categories.find((x) => x.id === c.parentCategoryId) : null
      const parentName = parent ? parent.categoryName : ''
      return c.categoryName.toLowerCase().includes(q) || parentName.toLowerCase().includes(q)
    })
  }, [categories, topLevelCategories, search])

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const paged = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const openCreate = () => {
    setEditingCategory(null)
    setModalOpen(true)
  }

  const openEdit = (c: Category) => {
    setEditingCategory(c)
    setModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await categoriesApi.delete(deleteTarget.id)
      toast.success('Category deleted')
      setDeleteTarget(null)
      await fetchData()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'Failed to delete category')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Categories</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Organize your product catalog with categories</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={18} />
          Create Category
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-aqua/30 focus:border-brand-aqua transition-all"
        />
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-800">
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">ID</th>
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Name</th>
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Parent</th>
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Description</th>
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Subcategories</th>
                    <th className="text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((c) => {
                    const sub = getSubcategories(c.id)
                    const isSub = c.parentCategoryId !== null
                    return (
                      <tr key={c.id} className="border-b border-surface-200 dark:border-surface-800/50 last:border-0 hover:bg-surface-100 dark:hover:bg-surface-800/30 transition-colors">
                        <td className="py-3 px-4 text-sm text-surface-500">#{c.id}</td>
                        <td className="py-3 px-4">
                          <span className={cn('text-sm font-medium', isSub ? 'text-surface-600 pl-4 dark:text-surface-300' : 'text-surface-900 dark:text-white')}>
                            {isSub && <span className="mr-1 text-surface-500">└</span>}
                            {c.categoryName}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-surface-500 dark:text-surface-400">{categoryName(c.parentCategoryId)}</td>
                        <td className="py-3 px-4 text-sm text-surface-500 dark:text-surface-400 max-w-[280px] truncate">{c.description ?? '-'}</td>
                        <td className="py-3 px-4 text-sm text-surface-500 dark:text-surface-400">{sub.length > 0 ? sub.length : '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(c)}
                              className="p-2 rounded-lg text-surface-500 hover:text-brand-aqua hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(c)}
                              className="p-2 rounded-lg text-surface-500 hover:text-red-400 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-surface-500 dark:text-surface-400 text-sm">
                        No categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-800">
                <p className="text-sm text-surface-500 dark:text-surface-400">Page {current} of {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={current === 1}
                    className="p-2 rounded-lg text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={current === totalPages}
                    className="p-2 rounded-lg text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CategoryFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingCategory={editingCategory}
        topLevelCategories={topLevelCategories}
        onSaved={fetchData}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.categoryName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleting}
      />
    </div>
  )
}
