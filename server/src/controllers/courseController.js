const Course = require("../models/Course");
const asyncHandler = require("../middlewares/asyncHandler");
const { isYouTubeUrl } = require("../utils/youtube");

const normalizeChapters = (chapters) => {
  if (!Array.isArray(chapters) || chapters.length === 0) {
    const error = new Error("At least one chapter is required");
    error.statusCode = 400;
    throw error;
  }

  return chapters.map((chapter, index) => {
    const title = String(chapter?.title || "").trim();
    const youtubeUrl = String(chapter?.youtubeUrl || "").trim();

    if (!title || !youtubeUrl) {
      const error = new Error(
        `Chapter ${index + 1} must include title and YouTube URL`
      );
      error.statusCode = 400;
      throw error;
    }

    if (!isYouTubeUrl(youtubeUrl)) {
      const error = new Error(`Chapter ${index + 1} has an invalid YouTube URL`);
      error.statusCode = 400;
      throw error;
    }

    return {
      title,
      youtubeUrl,
      summary: String(chapter?.summary || "").trim()
    };
  });
};

const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, price, thumbnailUrl, chapters } = req.body;

  if (!title || !description || price === undefined || price === null) {
    res.status(400);
    throw new Error("Title, description, and price are required");
  }

  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice) || numericPrice < 0) {
    res.status(400);
    throw new Error("Price must be a valid non-negative number");
  }

  const normalizedChapters = normalizeChapters(chapters);

  const course = await Course.create({
    title: String(title).trim(),
    description: String(description).trim(),
    category: String(category || "General").trim() || "General",
    price: numericPrice,
    thumbnailUrl: String(thumbnailUrl || "").trim(),
    chapters: normalizedChapters,
    educator: req.user._id
  });

  const populatedCourse = await Course.findById(course._id).populate(
    "educator",
    "name email"
  );

  res.status(201).json({
    message: "Course created successfully",
    course: populatedCourse
  });
});

const listCourses = asyncHandler(async (req, res) => {
  const search = String(req.query.search || "").trim();
  const filter = search
    ? {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } }
        ]
      }
    : {};

  const courses = await Course.find(filter)
    .populate("educator", "name")
    .sort({ createdAt: -1 });

  res.json({ courses });
});

const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate("educator", "name");

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  res.json({ course });
});

const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ educator: req.user._id }).sort({
    createdAt: -1
  });

  res.json({ courses });
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (course.educator.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can update only your own courses");
  }

  const { title, description, category, price, thumbnailUrl, chapters } = req.body;

  if (title !== undefined) {
    course.title = String(title).trim();
  }
  if (description !== undefined) {
    course.description = String(description).trim();
  }
  if (category !== undefined) {
    course.category = String(category).trim() || "General";
  }
  if (price !== undefined) {
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      res.status(400);
      throw new Error("Price must be a valid non-negative number");
    }
    course.price = numericPrice;
  }
  if (thumbnailUrl !== undefined) {
    course.thumbnailUrl = String(thumbnailUrl).trim();
  }
  if (chapters !== undefined) {
    course.chapters = normalizeChapters(chapters);
  }

  await course.save();

  const populatedCourse = await Course.findById(course._id).populate(
    "educator",
    "name email"
  );

  res.json({
    message: "Course updated successfully",
    course: populatedCourse
  });
});

module.exports = {
  createCourse,
  listCourses,
  getCourseById,
  getMyCourses,
  updateCourse
};
