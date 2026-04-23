const express = require("express");

const {
  createReview,
  getReviewsForCourse,
  deleteReview
} = require("../controllers/reviewController");
const { protect, requireRole } = require("../middlewares/auth");

const router = express.Router();

router.get("/course/:courseId", getReviewsForCourse);
router.post("/", protect, requireRole("student"), createReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
