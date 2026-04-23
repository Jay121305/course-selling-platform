const Review = require("../models/Review");
const Enrollment = require("../models/Enrollment");
const asyncHandler = require("../middlewares/asyncHandler");

const createReview = asyncHandler(async (req, res) => {
  const { courseId, rating, comment } = req.body;

  if (!courseId || !rating) {
    res.status(400);
    throw new Error("courseId and rating are required");
  }

  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating must be between 1 and 5");
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: courseId
  });

  if (!enrollment) {
    res.status(403);
    throw new Error("You must be enrolled in this course to leave a review");
  }

  const existingReview = await Review.findOne({
    student: req.user._id,
    course: courseId
  });

  if (existingReview) {
    res.status(409);
    throw new Error("You have already reviewed this course");
  }

  const review = await Review.create({
    student: req.user._id,
    course: courseId,
    rating: Number(rating),
    comment: String(comment || "").trim()
  });

  const populated = await Review.findById(review._id).populate("student", "name");

  res.status(201).json({ message: "Review added", review: populated });
});

const getReviewsForCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const reviews = await Review.find({ course: courseId })
    .populate("student", "name")
    .sort({ createdAt: -1 });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews === 0
      ? 0
      : Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10
        ) / 10;

  res.json({ reviews, averageRating, totalReviews });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  if (review.student.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this review");
  }

  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: "Review deleted" });
});

module.exports = { createReview, getReviewsForCourse, deleteReview };
