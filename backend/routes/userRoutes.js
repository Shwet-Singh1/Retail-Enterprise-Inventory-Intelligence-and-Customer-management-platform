const express = require("express");
const router = express.Router();
const { getAllUsers } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, adminOnly, getAllUsers);

module.exports = router;
