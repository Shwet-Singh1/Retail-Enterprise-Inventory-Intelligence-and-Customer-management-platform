const express = require("express");
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart } = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

// All cart routes require login
router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:productId", updateCartItem);
router.delete("/:productId", removeFromCart);

module.exports = router;
