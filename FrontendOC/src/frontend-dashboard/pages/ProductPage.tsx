import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Upload, X, Percent, BadgePercent } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, formatPrice, getInitials } from '@/shared/utils/cn'
import { productsApi } from '@/shared/api/products.api'
import { categoriesApi } from '@/shared/api/categories.api'
import { useCategories } from '@/shared/hooks/useCategories'
import type { Product, Category } from '@/shared/types'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Badge } from '@/shared/components/ui/Badge'
import { Skeleton } from '@/shared/components/ui/Skeleton'

const productSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be at least 0'),
  stockQuantity: z.coerce.number().min(0, 'Stock must be at least 0'),
  categoryId: z.coerce.number().min(1, 'Please select a category'),
  size: z.string(),
  color: z.string(),
  material: z.string(),
})

type ProductFormValues = z.infer<typeof productSchema>

const PAGE_SIZE = 8

function stockBadge(stock: number) {
  if (stock === 0) return <Badge variant="danger">Out of stock</Badge>
  if (stock < 10) return <Badge variant="warning">{stock} left</Badge>
  return <Badge variant="success">{stock}</Badge>
}

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingProduct: Product | null
  categories: Category[]
  onSaved: () => void
}

function ProductFormModal({ isOpen, onClose, editingProduct, categories, onSaved }: ProductFormModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(editingProduct?.image ?? null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      categoryId: editingProduct?.category.id ?? 0,
      size: '',
      color: '',
      material: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        reset({
          productName: editingProduct.productName,
          description: editingProduct.description,
          price: editingProduct.price,
          stockQuantity: editingProduct.stockQuantity,
          categoryId: editingProduct.category.id,
          size: editingProduct.size ?? '',
          color: editingProduct.color ?? '',
          material: editingProduct.material ?? '',
        })
        setImagePreview(editingProduct.image ?? null)
      } else {
        reset({
          productName: '',
          description: '',
          price: 0,
          stockQuantity: 0,
          categoryId: 0,
          size: '',
          color: '',
          material: '',
        })
        setImagePreview(null)
      }
      setImageFile(null)
    }
  }, [isOpen, editingProduct, reset])

  const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const categoryOptions = useMemo(() => {
    const sorted = [...categories].sort(
      (a, b) => (a.parentCategoryId ?? 0) - (b.parentCategoryId ?? 0)
    )
    return sorted
  }, [categories])

  const onSubmit = async (values: ProductFormValues) => {
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('productName', values.productName)
      formData.append('description', values.description)
      formData.append('price', String(values.price))
      formData.append('stockQuantity', String(values.stockQuantity))
      formData.append('categoryId', String(values.categoryId))
      formData.append('size', values.size)
      formData.append('color', values.color)
      formData.append('material', values.material)
      if (imageFile) {
        formData.append('file', imageFile)
      }

      if (editingProduct) {
        await productsApi.update(editingProduct.id, formData)
        toast.success('Product updated')
      } else {
        await productsApi.create(formData)
        toast.success('Product created')
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
    <Modal isOpen={isOpen} onClose={onClose} title={editingProduct ? 'Edit Product' : 'Create Product'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Product Name</label>
            <input className={inputClass} {...register('productName')} placeholder="e.g. Cotton T-Shirt" />
            {errors.productName && <p className="mt-1 text-xs text-red-500">{errors.productName.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              className={cn(inputClass, 'appearance-none')}
              {...register('categoryId')}
              defaultValue=""
            >
              <option value="" disabled>Select category</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parentCategoryId !== null ? `— ${c.categoryName}` : c.categoryName}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            className={cn(inputClass, 'min-h-[90px] resize-y')}
            {...register('description')}
            placeholder="Product description..."
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Price ($)</label>
            <input className={cn(inputClass, 'appearance-none')} type="number" step="0.01" {...register('price')} />
            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Stock Quantity</label>
            <input className={cn(inputClass, 'appearance-none')} type="number" {...register('stockQuantity')} />
            {errors.stockQuantity && <p className="mt-1 text-xs text-red-500">{errors.stockQuantity.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Size</label>
            <input className={inputClass} {...register('size')} placeholder="S, M, L (comma separated)" />
          </div>
          <div>
            <label className={labelClass}>Color</label>
            <input className={inputClass} {...register('color')} placeholder="e.g. Blue" />
          </div>
          <div>
            <label className={labelClass}>Material</label>
            <input className={inputClass} {...register('material')} placeholder="e.g. Cotton" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Product Image</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-24 h-24 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-surface-400 gap-1">
                  <Upload size={20} />
                  <span className="text-[10px]">No image</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 cursor-pointer transition-colors">
                <Upload size={16} />
                Choose file
                <input type="file" accept="image/*" className="hidden" onChange={onSelectImage} />
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null)
                    setImageFile(null)
                  }}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"
                >
                  <X size={14} /> Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={submitting}>
            {editingProduct ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

type DiscountTarget =
  | { type: 'product'; product: Product }
  | { type: 'category'; categoryId: number; categoryName: string }

interface DiscountModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  target: DiscountTarget | null
  targetCount?: number
}

function DiscountModal({ isOpen, onClose, onSaved, target, targetCount = 0 }: DiscountModalProps) {
  const [percent, setPercent] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && target) {
      setPercent(
        target.type === 'product' ? (target.product.discountPercentage ?? 0) : 0
      )
    }
  }, [isOpen, target])

  const basePrice = target?.type === 'product' ? target.product.price : null
  const salePrice = basePrice != null ? Number((basePrice * (1 - percent / 100)).toFixed(2)) : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!target) return
    setSubmitting(true)
    try {
      if (target.type === 'product') {
        await productsApi.updateDiscount(target.product.id, percent)
        toast.success(`Discount set to ${percent}% for "${target.product.productName}"`)
      } else {
        await productsApi.updateDiscountByCategory(target.categoryId, percent)
        toast.success(`Discount set to ${percent}% for all ${targetCount} product(s) in ${target.categoryName}`)
      }
      onClose()
      onSaved()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'Failed to update discount')
    } finally {
      setSubmitting(false)
    }
  }

  const title = target
    ? target.type === 'product'
      ? 'Set Discount'
      : `Discount All ${target.categoryName}`
    : 'Set Discount'

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-surface-900 border text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-aqua/30 focus:border-brand-aqua transition-all'
  const labelClass = 'block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {target?.type === 'category' && (
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Applies to all {targetCount} product(s) in {target.categoryName} (including subcategories).
          </p>
        )}
        {target?.type === 'product' && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-500">
              <Percent size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-surface-900 dark:text-white">
                {target.product.productName}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Current price: {formatPrice(target.product.price)}
                {target.product.discountPercentage > 0 && (
                  <>
                    {' '}
                    (currently {target.product.discountPercentage}% off →{' '}
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {formatPrice(target.product.salePrice ?? target.product.price)}
                    </span>
                    )
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        <div>
          <label className={labelClass}>Discount (%)</label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="100"
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            className={cn(inputClass, 'appearance-none')}
          />
          <p className="mt-1.5 text-xs text-surface-500 dark:text-surface-400">
            {percent <= 0
              ? 'No discount — product sells at the regular price.'
              : percent >= 100
                ? 'Product will be free (100% discount).'
                : basePrice != null
                  ? `Sale price becomes ${formatPrice(salePrice as number)} (you save ${formatPrice(basePrice - (salePrice as number))}).`
                  : 'This discount will apply to every product in this category.'}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="warning" isLoading={submitting} disabled={percent < 0 || percent > 100}>
            {percent === 0 ? 'Remove Discount' : 'Apply Discount'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function ProductPage() {
  const { topLevel, getSubcategories } = useCategories()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [discountTarget, setDiscountTarget] = useState<DiscountTarget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [parentTab, setParentTab] = useState<string>('all')
  const [childFilter, setChildFilter] = useState<string>('all')

  const fetchData = async () => {
    setLoading(true)
    const [productsRes, categoriesRes] = await Promise.allSettled([
      productsApi.getAll(),
      categoriesApi.getAll(),
    ])
    if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data)
    if (categoriesRes.status === 'fulfilled') setCategories(categoriesRes.value.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const activeSubcategories = useMemo(() => {
    if (parentTab === 'all') return []
    return getSubcategories(Number(parentTab))
  }, [parentTab, getSubcategories])

  const activeParentName = useMemo(() => {
    if (parentTab === 'all') return ''
    const cat = topLevel.find((c) => c.id === Number(parentTab))
    return cat?.categoryName ?? ''
  }, [parentTab, topLevel])

  const filtered = useMemo(() => {
    let result = products

    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter((p) => p.productName.toLowerCase().includes(q))
    }

    if (parentTab !== 'all') {
      const parentId = Number(parentTab)
      const subIds = getSubcategories(parentId).map((s) => s.id)
      const validIds = [parentId, ...subIds]
      result = result.filter((p) => validIds.includes(p.category.id))
    }

    if (childFilter !== 'all') {
      const childId = Number(childFilter)
      result = result.filter((p) => p.category.id === childId)
    }

    return result
  }, [products, search, parentTab, childFilter, getSubcategories])

  const discountTargetCount = useMemo(() => {
    if (!discountTarget || discountTarget.type !== 'category') return 0
    const parentId = discountTarget.categoryId
    const subIds = getSubcategories(parentId).map((s) => s.id)
    const validIds = [parentId, ...subIds]
    return products.filter((p) => validIds.includes(p.category.id)).length
  }, [discountTarget, products, getSubcategories])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const openCreate = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditingProduct(p)
    setModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await productsApi.delete(deleteTarget.id)
      toast.success('Product deleted')
      setDeleteTarget(null)
      await fetchData()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Products</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Manage your product catalog</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={18} />
          Create Product
        </Button>
      </div>

      {/* Parent category tabs */}
      <div className="flex gap-2 p-1 w-fit rounded-xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
        <button
          type="button"
          onClick={() => { setParentTab('all'); setChildFilter('all'); setPage(1) }}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
            parentTab === 'all'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white'
          )}
        >
          All Products
        </button>
        {topLevel.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => { setParentTab(String(cat.id)); setChildFilter('all'); setPage(1) }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
              parentTab === String(cat.id)
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white'
            )}
          >
            {cat.categoryName}
          </button>
        ))}
      </div>

      {/* Child category chips */}
      {parentTab !== 'all' && activeSubcategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { setChildFilter('all'); setPage(1) }}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 active:scale-95',
              childFilter === 'all'
                ? 'bg-brand-aqua text-white border-brand-aqua shadow-md shadow-brand-aqua/20'
                : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-brand-aqua/50 hover:text-brand-aqua dark:hover:border-brand-aqua/50 dark:hover:text-brand-aqua'
            )}
          >
            All {activeParentName}
          </button>
          {activeSubcategories.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => { setChildFilter(String(sub.id)); setPage(1) }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 active:scale-95',
                childFilter === String(sub.id)
                  ? 'bg-brand-aqua text-white border-brand-aqua shadow-md shadow-brand-aqua/20'
                  : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-brand-aqua/50 hover:text-brand-aqua dark:hover:border-brand-aqua/50 dark:hover:text-brand-aqua'
              )}
            >
              {sub.categoryName}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-aqua/30 focus:border-brand-aqua transition-all"
          />
        </div>
        {parentTab !== 'all' && (
          <Button variant="warning" onClick={() => setDiscountTarget({ type: 'category', categoryId: Number(parentTab), categoryName: activeParentName })}>
            <BadgePercent size={18} />
            Discount All {activeParentName}
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-800">
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Image</th>
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Name</th>
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Category</th>
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Price</th>
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Stock</th>
                    <th className="text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p) => (
                    <tr key={p.id} className="border-b border-surface-200 dark:border-surface-800/50 last:border-0 hover:bg-surface-100 dark:hover:bg-surface-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800">
                          {p.image ? (
                            <img src={p.image} alt={p.productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-surface-500 text-xs font-bold">
                              {getInitials(p.productName)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-surface-900 dark:text-white">{p.productName}</td>
                      <td className="py-3 px-4 text-sm text-surface-500 dark:text-surface-400">{p.category?.categoryName ?? '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-surface-900 dark:text-white">
                            {formatPrice(p.discountPercentage > 0 ? (p.salePrice ?? p.price) : p.price)}
                          </span>
                          {p.discountPercentage > 0 && p.salePrice !== undefined && (
                            <>
                              <span className="text-xs text-surface-400 line-through">{formatPrice(p.price)}</span>
                              <span className="w-fit rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-500">-{p.discountPercentage}%</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{stockBadge(p.stockQuantity)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDiscountTarget({ type: 'product', product: p })}
                            className="p-2 rounded-lg text-surface-500 hover:text-yellow-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors"
                            title={p.discountPercentage > 0 ? `Edit discount (${p.discountPercentage}%)` : 'Set discount'}
                          >
                            <Percent size={16} />
                          </button>
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 rounded-lg text-surface-500 hover:text-brand-aqua hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-2 rounded-lg text-surface-500 hover:text-red-400 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-14 px-4 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800 text-surface-400">
                            <Search size={20} />
                          </div>
                          <p className="text-sm font-semibold text-surface-900 dark:text-white">
                            {childFilter !== 'all'
                              ? `No products found in ${(activeSubcategories.find((s) => s.id === Number(childFilter))?.categoryName ?? childFilter)}`
                              : parentTab !== 'all'
                                ? `No products found in ${activeParentName}`
                                : 'No products found'}
                          </p>
                          {parentTab !== 'all' && (
                            <button
                              type="button"
                              onClick={openCreate}
                              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-aqua transition-colors hover:brightness-110"
                            >
                              <Plus size={16} />
                              Add Product to {childFilter !== 'all'
                                ? (activeSubcategories.find((s) => s.id === Number(childFilter))?.categoryName ?? activeParentName)
                                : activeParentName}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-800">
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  Page {current} of {totalPages}
                </p>
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

      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingProduct={editingProduct}
        categories={categories}
        onSaved={fetchData}
      />

      <DiscountModal
        isOpen={!!discountTarget}
        onClose={() => setDiscountTarget(null)}
        onSaved={fetchData}
        target={discountTarget}
        targetCount={discountTargetCount}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.productName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleting}
      />
    </div>
  )
}
