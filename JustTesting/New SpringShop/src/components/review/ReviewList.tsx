import React, { useState } from 'react';
import { Review } from '../../types';
import { ReviewCard } from './ReviewCard';
import { AddReviewModal } from './AddReviewModal';
import { Button } from '../common/Button';
import { Star, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ReviewListProps {
  productId?: number;
  reviews: Review[];
  averageRating?: number;
  onReviewAdded?: () => void;
  title?: string;
  subtitle?: string;
  allowAdd?: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  productId,
  reviews,
  averageRating = 5,
  onReviewAdded,
  title = 'Real Customer Feedback',
  subtitle = 'Verified purchases and product thoughts from our community',
  allowAdd = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
            {averageRating > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold">
                <Star className="w-3 h-3 fill-current" />
                <span>{averageRating.toFixed(1)} / 5</span>
              </div>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>

        {allowAdd && productId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Write a Review</span>
          </Button>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-400">No reviews yet for this product. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {allowAdd && productId && (
        <AddReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productId={productId}
          onSuccess={() => {
            setIsModalOpen(false);
            if (onReviewAdded) onReviewAdded();
          }}
        />
      )}
    </section>
  );
};
