const User = require("../models/User");
const Order = require("../models/Order");

// @route GET /api/users
// Admin only - lists all customers with their order count and total spend,
// so the admin can see who's actually buying, not just who's registered.
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    // Aggregate order count + total spend per user in one query rather than
    // N+1 queries per user
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
        },
      },
    ]);
    const statsByUser = {};
    orderStats.forEach((s) => {
      statsByUser[s._id.toString()] = { orderCount: s.orderCount, totalSpent: s.totalSpent };
    });

    const enriched = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      orderCount: statsByUser[u._id.toString()]?.orderCount || 0,
      totalSpent: statsByUser[u._id.toString()]?.totalSpent || 0,
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAllUsers };
