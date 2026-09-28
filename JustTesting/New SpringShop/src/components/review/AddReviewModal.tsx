import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { reviewApi } from '../../api/reviewApi';
import { useToast } from '../../context/ToastContext';
import { Star } from 'lucide-react';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  onSuccess: () => void;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      error('Please write a brief comment');
      return;
    }
    setLoading(true);
    try {
      await reviewApi.create({ productId, rating, comment: comment.trim() });
      success('Review submitted successfully! Thank you for your feedback.');
      setComment('');
      setRating(5);
      onSuccess();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to submit review. You may have already reviewed this product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Write a Customer Review" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
            Overall Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform cursor-pointer"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-zinc-300 dark:text-zinc-600'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 ml-2">
              {rating} of 5 stars
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
            Your Review
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Describe fit, material quality, stitching, texture, and how it holds up..."
            required
            className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-[#009dff]/20 focus:border-[#009dff] transition-all"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading}>
            Publish Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
