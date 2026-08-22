const Product = require("../models/Product");
const Order = require("../models/Order");

// @route GET /api/products
// Public - supports ?category= & ?search= query params. Only shows approved
// listings - a customer's pending or rejected self-submitted product never
// appears here.
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { approvalStatus: "approved" };

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    // Pagination - defaults keep old behavior reasonable for small catalogs,
    // caps page size so a bad ?limit= can't force a huge query
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      totalItems: total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/products/categories
// Public - distinct category list across ALL approved products, independent
// of pagination, so the Shop filter dropdown always shows every category
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { approvalStatus: "approved" });
    res.json(categories.sort());
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/products/admin/all
// Admin only - every product regardless of approval status, so the admin
// product table (and the pending-listings queue) can see everything.
const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("submittedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("submittedBy", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/products/listings
// Logged-in customers - submit a product to sell. Always starts "pending"
// regardless of what the client sends, so a customer can't self-approve.
const submitListing = async (req, res) => {
  try {
    const { name, description, category, price, stock, imageUrl, sku } = req.body;

    const product = await Product.create({
      name,
      description,
      category,
      price,
      stock,
      imageUrl,
      sku: sku || undefined,
      submittedBy: req.user._id,
      approvalStatus: "pending",
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Invalid listing data", error: error.message });
  }
};

// @route GET /api/products/listings/mine
// Logged-in customers - their own submitted listings, any status
const getMyListings = async (req, res) => {
  try {
    const listings = await Product.find({ submittedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route DELETE /api/products/listings/:id
// Logged-in customers - can only delete their own listing
const deleteMyListing = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, submittedBy: req.user._id });
    if (!product) return res.status(404).json({ message: "Listing not found" });
    await product.deleteOne();
    res.json({ message: "Listing deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/products/listings/pending
// Admin only - the review queue
const getPendingListings = async (req, res) => {
  try {
    const listings = await Product.find({ approvalStatus: "pending" })
      .populate("submittedBy", "name email")
      .sort({ createdAt: 1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route PUT /api/products/listings/:id/review
// Admin only - approve or reject a pending customer listing
const reviewListing = async (req, res) => {
  try {
    const { decision } = req.body; // "approved" | "rejected"
    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "decision must be 'approved' or 'rejected'" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: decision },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Listing not found" });
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
    const liveFilter = { approvalStatus: "approved" };
    const totalProducts = await Product.countDocuments(liveFilter);

    const allProducts = await Product.find(liveFilter);
    const lowStockProducts = allProducts.filter((p) => p.stock <= p.lowStockThreshold);

    const topSelling = await Product.find(liveFilter).sort({ unitsSold: -1 }).limit(5);

    const pendingListingsCount = await Product.countDocuments({ approvalStatus: "pending" });

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
      pendingListingsCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getProducts,
  getCategories,
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
};
