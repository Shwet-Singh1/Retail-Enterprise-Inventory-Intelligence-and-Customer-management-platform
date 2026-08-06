const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getDashboardStats,
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getProducts);

// Admin dashboard stats - must be defined BEFORE /:id to avoid route collision
router.get("/dashboard/stats", protect, adminOnly, getDashboardStats);

router.get("/:id", getProductById);

// Admin only routes
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
