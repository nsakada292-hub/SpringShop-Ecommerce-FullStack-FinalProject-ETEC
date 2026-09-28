import React, { useEffect, useState, useMemo } from 'react';
import { Product, Category } from '../../types';
import { productApi } from '../../api/productApi';
import { useCategories } from '../../hooks/useCategories';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  ArrowUpDown,
  Image as ImageIcon,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { categories } = useCategories();
  const { success, error } = useToast();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    productName: '',
    categoryId: 1,
    price: 49.00,
    stockQuantity: 25,
    description: '',
    image: '',
    sizes: 'XS, S, M, L, XL',
    color: 'Sand, Olive, Charcoal',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Delete Confirm Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getAll();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = p.productName.toLowerCase().includes(q) ||
          p.category.categoryName.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedCategory !== 'all' && p.category.id !== Number(selectedCategory)) {
        return false;
      }
      if (stockFilter === 'in-stock' && p.stockQuantity <= 0) return false;
      if (stockFilter === 'low-stock' && (p.stockQuantity <= 0 || p.stockQuantity > 15)) return false;
      if (stockFilter === 'out-of-stock' && p.stockQuantity > 0) return false;
      return true;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      productName: '',
      categoryId: categories[0]?.id || 1,
      price: 59.00,
      stockQuantity: 30,
      description: '',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      sizes: 'XS, S, M, L, XL',
      color: 'Navy, Beige, Black',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      categoryId: product.category.id,
      price: product.price,
      stockQuantity: product.stockQuantity,
      description: product.description,
      image: product.image,
      sizes: product.sizes,
      color: product.color,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim()) {
      error('Product title is required.');
      return;
    }

    setFormLoading(true);
    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, {
          ...formData,
          price: Number(formData.price),
          stockQuantity: Number(formData.stockQuantity),
          categoryId: Number(formData.categoryId),
        });
        success(`Product "${formData.productName}" updated successfully.`);
      } else {
        await productApi.create({
          ...formData,
          price: Number(formData.price),
          stockQuantity: Number(formData.stockQuantity),
          categoryId: Number(formData.categoryId),
        });
        success(`Product "${formData.productName}" created and published.`);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to save product.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    try {
      await productApi.delete(productToDelete.id);
      success(`Product "${productToDelete.productName}" deleted.`);
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Catalog Inventory
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage product variants, price points, SKU stock levels, and media.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal} className="flex items-center gap-1.5 shadow-xs">
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, SKU, department..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800/80 border border-transparent focus:border-[#009dff] focus:bg-white dark:focus:bg-zinc-900 rounded-xl outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-transparent focus:border-[#009dff] text-zinc-800 dark:text-zinc-200 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.categoryName}</option>
            ))}
          </select>

          {/* Stock Level Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-transparent focus:border-[#009dff] text-zinc-800 dark:text-zinc-200 outline-none"
          >
            <option value="all">All Inventory</option>
            <option value="in-stock">In Stock (&gt;15)</option>
            <option value="low-stock">Low Stock (≤15)</option>
            <option value="out-of-stock">Sold Out (0)</option>
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-xs text-zinc-400">Loading catalog items...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-400">
            No products match your search and filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Level</th>
                  <th className="py-3.5 px-4">Sizes / Colors</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredProducts.map(product => {
                  const isLow = product.stockQuantity > 0 && product.stockQuantity <= 15;
                  const isOut = product.stockQuantity === 0;

                  return (
                    <tr key={product.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.productName}
                            className="w-10 h-12 object-cover rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800"
                          />
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 max-w-xs">
                              {product.productName}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-mono">
                              SKU-00{product.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-medium text-[11px]">
                          {product.category.categoryName}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        ${product.price.toFixed(2)}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isOut ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                          isLow ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                          'bg-[#4ce600]/15 text-[#00e000]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-[#00e000]'
                          }`} />
                          {product.stockQuantity} units
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[11px] text-zinc-500 max-w-xs truncate">
                        {product.sizes} • {product.color}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 text-zinc-400 hover:text-[#009dff] hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setProductToDelete(product);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit: ${editingProduct.productName}` : 'Add New Product'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <Input
            label="Product Name"
            required
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            placeholder="e.g. Classic Oversized Linen Blazer"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-[#009dff]"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                ))}
              </select>
            </div>

            <Input
              label="Price ($ USD)"
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            />

            <Input
              label="Initial Inventory Units"
              type="number"
              required
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Sizes (Comma separated)"
              value={formData.sizes}
              onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
              placeholder="e.g. XS, S, M, L, XL"
            />
            <Input
              label="Colors (Comma separated)"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="e.g. Charcoal, Ivory, Camel"
            />
          </div>

          <Input
            label="Image URL"
            type="url"
            required
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Product Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Artisan stitching, breathability, washing tips, tailored fit..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-4 focus:ring-[#009dff]/20 focus:border-[#009dff]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={formLoading}>
              {editingProduct ? 'Save Changes' : 'Publish Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Product Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.productName}"? This action removes the SKU and all stock records permanently.`}
        confirmText="Delete Product"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
};
