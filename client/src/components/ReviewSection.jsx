import { useEffect, useState } from "react";

import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import StarRating from "./StarRating";

const ReviewSection = ({ courseId, isEnrolled }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isStudent = user?.role === "student";
  const hasReviewed = reviews.some(
    (r) => r.student?._id === (user?.id || user?._id)
  );

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reviews/course/${courseId}`);
      setReviews(response.data.reviews || []);
      setAverageRating(response.data.averageRating || 0);
      setTotalReviews(response.data.totalReviews || 0);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const onSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.post("/reviews", { courseId, rating, comment });
      setRating(0);
      setComment("");
      await fetchReviews();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const onDeleteReview = async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      await fetchReviews();
    } catch {
      // silent fail
    }
  };

  return (
    <div className="reviews-section panel">
      <div className="row-between wrap">
        <h3>⭐ Reviews & Ratings</h3>
        {totalReviews > 0 && (
          <div className="rating-summary">
            <span className="rating-number">{averageRating}</span>
            <StarRating value={Math.round(averageRating)} readonly size="sm" />
            <span className="muted">({totalReviews} review{totalReviews !== 1 ? "s" : ""})</span>
          </div>
        )}
      </div>

      {/* Review Form */}
      {isAuthenticated && isStudent && isEnrolled && !hasReviewed && (
        <form className="review-form" onSubmit={onSubmitReview}>
          <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>Leave a Review</p>
          <div>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this course..."
            rows={3}
          />
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {/* Review List */}
      {loading ? (
        <div className="skeleton" style={{ height: 80, marginTop: "1rem" }} />
      ) : reviews.length === 0 ? (
        <p className="muted" style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span className="review-author">{review.student?.name || "Anonymous"}</span>
                  <StarRating value={review.rating} readonly size="sm" />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  {(review.student?._id === (user?.id || user?._id) || user?.role === "admin") && (
                    <button
                      className="btn btn-danger btn-sm"
                      type="button"
                      onClick={() => onDeleteReview(review._id)}
                      style={{ padding: "0.2rem 0.5rem", fontSize: "0.72rem" }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              {review.comment && <p className="review-comment">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
