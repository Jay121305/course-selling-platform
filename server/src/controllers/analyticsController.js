const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const asyncHandler = require("../middlewares/asyncHandler");

const getEducatorDashboard = asyncHandler(async (req, res) => {
  const educatorId = req.user._id;

  const courses = await Course.find({ educator: educatorId }).select(
    "title price createdAt"
  );
  const courseIds = courses.map((course) => course._id);

  const enrollments = await Enrollment.find({
    course: { $in: courseIds }
  }).select("course payment.amount progress.completedPercent");

  const totalCourses = courses.length;
  const totalStudents = enrollments.length;
  const totalRevenue = enrollments.reduce(
    (sum, enrollment) => sum + (enrollment.payment?.amount || 0),
    0
  );
  const avgCompletion =
    totalStudents === 0
      ? 0
      : Math.round(
          enrollments.reduce(
            (sum, enrollment) => sum + (enrollment.progress?.completedPercent || 0),
            0
          ) / totalStudents
        );

  const courseBreakdown = courses
    .map((course) => {
      const relatedEnrollments = enrollments.filter(
        (enrollment) => enrollment.course.toString() === course._id.toString()
      );
      const courseRevenue = relatedEnrollments.reduce(
        (sum, enrollment) => sum + (enrollment.payment?.amount || 0),
        0
      );
      const courseAvgCompletion =
        relatedEnrollments.length === 0
          ? 0
          : Math.round(
              relatedEnrollments.reduce(
                (sum, enrollment) =>
                  sum + (enrollment.progress?.completedPercent || 0),
                0
              ) / relatedEnrollments.length
            );

      return {
        courseId: course._id,
        title: course.title,
        price: course.price,
        enrollments: relatedEnrollments.length,
        revenue: courseRevenue,
        avgCompletion: courseAvgCompletion
      };
    })
    .sort((a, b) => b.enrollments - a.enrollments);

  res.json({
    metrics: {
      totalCourses,
      totalStudents,
      totalRevenue,
      avgCompletion
    },
    courseBreakdown
  });
});

module.exports = {
  getEducatorDashboard
};
