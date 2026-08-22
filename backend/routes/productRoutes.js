const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  getDashboardStats,
  submitListing,
  getMyListings,
  deleteMyListing,
  getPendingListings,
  reviewListing,
  getCategories,
} = require("../controllers/productController");
const { getProductReviews, submitReview, deleteReview } = require("../controllers/reviewController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getProducts);
router.get("/categories", getCategories);

// Admin dashboard stats - must be defined BEFORE /:id to avoid route collision
router.get("/dashboard/stats", protect, adminOnly, getDashboardStats);

// Admin - every product regardless of approval status
router.get("/admin/all", protect, adminOnly, getAllProductsAdmin);

// Customer self-listing - submit a product to sell, view/delete own listings
router.post("/listings", protect, submitListing);
router.get("/listings/mine", protect, getMyListings);
router.delete("/listings/:id", protect, deleteMyListing);

// Admin - review queue for pending customer listings
router.get("/listings/pending", protect, adminOnly, getPendingListings);
router.put("/listings/:id/review", protect, adminOnly, reviewListing);

router.get("/:id", getProductById);

// Reviews - public to read, logged-in customers to write/delete their own
router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", protect, submitReview);
router.delete("/:id/reviews", protect, deleteReview);

// Admin only routes
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
