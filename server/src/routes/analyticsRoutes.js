const express = require("express");

const { getEducatorDashboard } = require("../controllers/analyticsController");
const { protect, requireRole } = require("../middlewares/auth");

const router = express.Router();

router.get("/educator/dashboard", protect, requireRole("educator"), getEducatorDashboard);

module.exports = router;
