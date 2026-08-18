const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Tracks units sold - used for "top selling" dashboard stat
    unitsSold: {
      type: Number,
      default: 0,
    },
    // Customer self-listing support. submittedBy is null for products added
    // by an admin through the normal admin panel - those are auto-approved.
    // Products a customer submits themselves start as "pending" and only
    // show up in the public catalog once an admin approves them.
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvalStatus: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved",
    },
  },
  { timestamps: true }
);

// Virtual flag - true if stock is at/below threshold
productSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.lowStockThreshold;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
