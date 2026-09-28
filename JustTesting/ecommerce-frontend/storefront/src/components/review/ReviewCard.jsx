import RatingStars from "./RatingStars";

export default function ReviewCard({ review }) {
  const customerName = review.customerName || review.userName || review.customer?.name || "Anonymous";
  const createdAt = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "";

  return (
    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-full bg-lagoon-gradient flex items-center justify-center text-white text-sm font-bold">
            {customerName[0]?.toUpperCase()}
          </span>
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {customerName}
          </span>
        </div>
        {createdAt && <span className="text-xs text-slate-400">{createdAt}</span>}
      </div>
      <RatingStars rating={review.rating || 0} />
      {review.subject && (
        <h4 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
          {review.subject}
        </h4>
      )}
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
        {review.comment || review.content || ""}
      </p>
    </div>
  );
}
