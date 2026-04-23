const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    youtubeUrl: {
      type: String,
      required: true,
      trim: true
    },
    summary: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: "General"
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    thumbnailUrl: {
      type: String,
      default: ""
    },
    educator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    chapters: {
      type: [chapterSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "A course must have at least one chapter"
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
