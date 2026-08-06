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
