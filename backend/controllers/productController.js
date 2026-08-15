const Product = require("../models/Product");
const Order = require("../models/Order");

// @route GET /api/products
// Public - supports ?category= & ?search= query params
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/products
// Admin only
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Invalid product data", error: error.message });
  }
};

// @route PUT /api/products/:id
// Admin only
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: "Invalid update data", error: error.message });
  }
};

// @route DELETE /api/products/:id
// Admin only
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/products/dashboard/stats
// Admin only - powers the admin dashboard cards and charts
const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();

    const allProducts = await Product.find();
    const lowStockProducts = allProducts.filter((p) => p.stock <= p.lowStockThreshold);

    const topSelling = await Product.find().sort({ unitsSold: -1 }).limit(5);

    // Orders/revenue totals - cancelled orders don't count as real revenue
    const revenueMatch = { status: { $ne: "cancelled" } };
    const totalOrders = await Order.countDocuments();
    const revenueAgg = await Order.aggregate([
      { $match: revenueMatch },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Revenue for the last 14 days, one point per day (filled with 0 for
    // days with no orders so the line chart doesn't have gaps)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const dailyAgg = await Order.aggregate([
      { $match: { ...revenueMatch, createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);
    const dailyMap = {};
    dailyAgg.forEach((d) => {
      dailyMap[d._id] = d.revenue;
    });
    const revenueByDay = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      revenueByDay.push({
        date: key,
        label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        revenue: dailyMap[key] || 0,
      });
    }

    // Revenue broken down by product category, via the items snapshot on
    // each order joined back to the product's current category
    const salesByCategoryAgg = await Order.aggregate([
      { $match: revenueMatch },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$productInfo.category", "Other"] },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
    ]);
    const salesByCategory = salesByCategoryAgg.map((c) => ({ category: c._id, revenue: c.revenue }));

    res.json({
      totalProducts,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      topSelling,
      totalOrders,
      totalRevenue,
      revenueByDay,
      salesByCategory,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getDashboardStats,
};
