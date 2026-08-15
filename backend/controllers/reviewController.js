const Review = require("../models/Review");

// @route GET /api/products/:id/reviews
// Public - returns all reviews for a product plus the average rating
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const averageRating =
      reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    res.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/products/:id/reviews
// Logged-in customers only - one review per user per product. Resubmitting
// updates the existing review (rating + comment) rather than duplicating it.
const submitReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const review = await Review.findOneAndUpdate(
      { product: req.params.id, user: req.user._id },
      { rating, comment: comment || "", product: req.params.id, user: req.user._id },
      { new: true, upsert: true, runValidators: true }
    ).populate("user", "name");

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: "Could not submit review", error: error.message });
  }
};

// @route DELETE /api/products/:id/reviews
// Logged-in - lets a user remove their own review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ product: req.params.id, user: req.user._id });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getProductReviews, submitReview, deleteReview };
