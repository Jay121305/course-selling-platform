const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const asyncHandler = require("../middlewares/asyncHandler");

const getAdminStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalCourses, totalEnrollments, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Enrollment.aggregate([
      { $group: { _id: null, total: { $sum: "$payment.amount" } } }
    ])
  ]);

  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

  res.json({
    stats: { totalUsers, totalCourses, totalEnrollments, totalRevenue }
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 });

  res.json({ users });
});

const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find()
    .populate("educator", "name email")
    .sort({ createdAt: -1 });

  res.json({ courses });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot delete admin users");
  }

  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User removed" });
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: "Course removed" });
});

module.exports = {
  getAdminStats,
  getAllUsers,
  getAllCourses,
  deleteUser,
  deleteCourse
};
