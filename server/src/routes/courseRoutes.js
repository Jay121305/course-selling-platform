const express = require("express");

const {
  createCourse,
  listCourses,
  getCourseById,
  getMyCourses,
  updateCourse
} = require("../controllers/courseController");
const { protect, optionalProtect, requireRole } = require("../middlewares/auth");

const router = express.Router();

router.get("/", listCourses);
router.get("/educator/mine", protect, requireRole("educator"), getMyCourses);
router.post("/", protect, requireRole("educator"), createCourse);
router.put("/:id", protect, requireRole("educator"), updateCourse);
router.get("/:id", optionalProtect, getCourseById);

module.exports = router;
