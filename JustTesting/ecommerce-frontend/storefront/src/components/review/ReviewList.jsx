import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getReviewsForProduct } from "../../services/reviewService";
import ReviewCard from "./ReviewCard";
import Loader from "../common/Loader";

export default function ReviewList({ productId }) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) {
      setLoading(false);
      setReviews([]);
      return undefined;
    }
    setLoading(true);
    getReviewsForProduct(productId)
      .then((res) => {
        if (active) setReviews(res.data || []);
      })
      .catch(() => {
        if (active) setReviews([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-slate-400 py-4">
        <Link to="/sign-in" className="text-brand.blue dark:text-brand.aqua font-medium">
          Sign in
        </Link>{" "}
        to view and write reviews.
      </p>
    );
  }

  if (loading) return <Loader />;
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-4">No reviews yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
