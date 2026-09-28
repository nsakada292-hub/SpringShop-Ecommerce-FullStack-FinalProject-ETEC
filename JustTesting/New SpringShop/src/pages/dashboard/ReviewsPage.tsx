import React, { useEffect, useState } from 'react';
import { Review } from '../../types';
import { reviewApi } from '../../api/reviewApi';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Spinner } from '../../components/common/Spinner';
import { Star, Trash2, MessageSquare } from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewApi.getAll();
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;
    setDeleteLoading(true);
    try {
      await reviewApi.delete(reviewToDelete.id);
      success('Review removed successfully.');
      setIsDeleteDialogOpen(false);
      setReviewToDelete(null);
      fetchReviews();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Customer Review Moderation
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Monitor feedback scores, inspect ratings, and moderate inappropriate product submissions.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-xs text-zinc-400">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-400">
            No customer reviews found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Reviewer</th>
                  <th className="py-3.5 px-4">Product ID</th>
                  <th className="py-3.5 px-4">Feedback Commentary</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {reviews.map(r => (
                  <tr key={r.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-amber-500">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 mr-1">{r.rating}.0</span>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      {r.user.name}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-mono">
                      #{r.productId}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300 max-w-md">
                      <p className="line-clamp-2">{r.comment}</p>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setReviewToDelete(r);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer Review"
        message="Are you sure you want to permanently delete this customer review? This will recalculate the product's average score."
        confirmText="Delete Review"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
};
