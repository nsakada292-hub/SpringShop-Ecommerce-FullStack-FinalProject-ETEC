import React, { useState } from 'react';
import { Category } from '../../types';
import { useCategories } from '../../hooks/useCategories';
import { categoryApi } from '../../api/categoryApi';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Spinner } from '../../components/common/Spinner';
import { Plus, Edit2, Trash2, FolderTree, CornerDownRight } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { categories, topLevelCategories, getSubcategories, loading, refreshCategories } = useCategories();
  const { success, error } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleOpenAdd = (parentId: number | null = null) => {
    setEditingCategory(null);
    setCategoryName('');
    setDescription('');
    setParentCategoryId(parentId);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.categoryName);
    setDescription(category.description || '');
    setParentCategoryId(category.parentCategoryId);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      error('Category name is required');
      return;
    }

    setFormLoading(true);
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, {
          categoryName: categoryName.trim(),
          description: description.trim(),
          parentCategoryId,
        });
        success(`Category "${categoryName}" updated successfully.`);
      } else {
        await categoryApi.create({
          categoryName: categoryName.trim(),
          description: description.trim(),
          parentCategoryId,
        });
        success(`Category "${categoryName}" created successfully.`);
      }
      setIsModalOpen(false);
      refreshCategories();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to save category.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setDeleteLoading(true);
    try {
      await categoryApi.delete(categoryToDelete.id);
      success(`Category "${categoryToDelete.categoryName}" deleted.`);
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      refreshCategories();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to delete category.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Category Taxonomy
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Organize departments, parent collections, and nested shop subcategories.
          </p>
        </div>
        <Button variant="primary" onClick={() => handleOpenAdd(null)} className="flex items-center gap-1.5 shadow-xs">
          <Plus className="w-4 h-4" />
          <span>Add Top-Level Category</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-xs text-zinc-400">Loading category tree...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topLevelCategories.map(parent => {
            const subcats = getSubcategories(parent.id);
            return (
              <div
                key={parent.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden"
              >
                {/* Parent Row */}
                <div className="p-4 bg-zinc-50/70 dark:bg-zinc-800/50 flex items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#009dff]/15 text-[#009dff] flex items-center justify-center font-bold">
                      <FolderTree className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {parent.categoryName}
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        {parent.description || 'Top-level department'} • {subcats.length} subcategories
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAdd(parent.id)}
                      className="text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Sub</span>
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(parent)}
                      className="p-1.5 text-zinc-400 hover:text-[#009dff] hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryToDelete(parent);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {subcats.length > 0 && (
                  <div className="p-2 divide-y divide-zinc-100 dark:divide-zinc-800">
                    {subcats.map(sub => (
                      <div
                        key={sub.id}
                        className="py-2.5 px-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 rounded-xl"
                      >
                        <div className="flex items-center gap-2 pl-4">
                          <CornerDownRight className="w-4 h-4 text-zinc-400" />
                          <div>
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                              {sub.categoryName}
                            </p>
                            <p className="text-[10px] text-zinc-400">
                              Slug: /{sub.categoryName.toLowerCase()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(sub)}
                            className="p-1.5 text-zinc-400 hover:text-[#009dff] hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded-lg transition-colors"
                            title="Edit Subcategory"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryToDelete(sub);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                            title="Delete Subcategory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? `Edit Category: ${editingCategory.categoryName}` : 'Add Category'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category Title"
            required
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g. Footwear or Leather Loafers"
          />

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Parent Category (Optional for subcategory)
            </label>
            <select
              value={parentCategoryId || ''}
              onChange={(e) => setParentCategoryId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-[#009dff]"
            >
              <option value="">None (Top-Level Category)</option>
              {topLevelCategories.map(p => (
                <option key={p.id} value={p.id}>{p.categoryName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short blurb shown on hero banners..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-4 focus:ring-[#009dff]/20 focus:border-[#009dff]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={formLoading}>
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to remove "${categoryToDelete?.categoryName}"? Any products assigned to this category will need reassignment.`}
        confirmText="Delete Category"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
};
