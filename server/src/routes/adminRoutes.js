const express = require("express");

const {
  getAdminStats,
  getAllUsers,
  getAllCourses,
  deleteUser,
  deleteCourse
} = require("../controllers/adminController");
const { protect, requireRole } = require("../middlewares/auth");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.get("/courses", getAllCourses);
router.delete("/users/:id", deleteUser);
router.delete("/courses/:id", deleteCourse);

module.exports = router;
