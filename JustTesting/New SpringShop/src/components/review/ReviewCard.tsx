import React from 'react';
import { Review } from '../../types';
import { Star } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
      <div>
        {/* Rating Stars */}
        <div className="flex items-center gap-1 mb-2.5">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              className={`w-3.5 h-3.5 ${
                star <= review.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-zinc-300 dark:text-zinc-700'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed mb-4">
          "{review.comment}"
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400">
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
          {review.userName || 'Verified Buyer'}
        </span>
        <span>
          {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
};
