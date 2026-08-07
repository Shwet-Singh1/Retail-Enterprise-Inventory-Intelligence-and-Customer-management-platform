// One-off script to populate the database with demo data.
// Run with: npm run seed  (from the backend folder)
// Safe to re-run - it wipes existing Products/Users first (only in this collection),
// so don't run it against a database you care about keeping.

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Product = require("./models/Product");
const User = require("./models/User");

const demoProducts = [
  {
    name: "Wireless Mechanical Keyboard",
    description: "Compact 75% layout mechanical keyboard with hot-swappable switches and Bluetooth + USB-C connectivity.",
    category: "Electronics",
    price: 4499,
    stock: 35,
    lowStockThreshold: 10,
    sku: "ELEC-KB-001",
  },
  {
    name: "Noise Cancelling Headphones",
    description: "Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.",
    category: "Electronics",
    price: 7999,
    stock: 20,
    lowStockThreshold: 8,
    sku: "ELEC-HP-002",
  },
  {
    name: "USB-C Fast Charger (65W)",
    description: "Compact GaN charger with 65W output, compatible with laptops and phones.",
    category: "Electronics",
    price: 1899,
    stock: 60,
    lowStockThreshold: 15,
    sku: "ELEC-CH-003",
  },
  {
    name: "Men's Cotton Casual Shirt",
    description: "Breathable 100% cotton shirt, regular fit, machine washable.",
    category: "Apparel",
    price: 1299,
    stock: 45,
    lowStockThreshold: 10,
    sku: "APP-SH-001",
  },
  {
    name: "Women's Running Shoes",
    description: "Lightweight running shoes with cushioned sole, breathable mesh upper.",
    category: "Apparel",
    price: 3499,
    stock: 8,
    lowStockThreshold: 10,
    sku: "APP-SH-002",
  },
  {
    name: "Denim Jacket",
    description: "Classic unisex denim jacket, mid-wash, button front.",
    category: "Apparel",
    price: 2599,
    stock: 25,
    lowStockThreshold: 8,
    sku: "APP-JK-003",
  },
  {
    name: "Non-Stick Cookware Set (5-Piece)",
    description: "Induction-friendly non-stick cookware set with tempered glass lids.",
    category: "Home & Kitchen",
    price: 3299,
    stock: 18,
    lowStockThreshold: 5,
    sku: "HOME-CK-001",
  },
  {
    name: "Electric Kettle (1.5L)",
    description: "Stainless steel electric kettle with auto shut-off, 1500W.",
    category: "Home & Kitchen",
    price: 1499,
    stock: 40,
    lowStockThreshold: 10,
    sku: "HOME-KT-002",
  },
  {
    name: "Memory Foam Pillow",
    description: "Ergonomic cervical support pillow with cooling gel layer.",
    category: "Home & Kitchen",
    price: 999,
    stock: 5,
    lowStockThreshold: 10,
    sku: "HOME-PL-003",
  },
  {
    name: "Yoga Mat (6mm)",
    description: "Non-slip textured yoga mat with carry strap, 6mm thickness.",
    category: "Sports & Fitness",
    price: 899,
    stock: 50,
    lowStockThreshold: 15,
    sku: "SPRT-YM-001",
  },
  {
    name: "Adjustable Dumbbell Set (10kg)",
    description: "Pair of adjustable dumbbells, 2.5kg to 10kg per hand.",
    category: "Sports & Fitness",
    price: 5499,
    stock: 12,
    lowStockThreshold: 5,
    sku: "SPRT-DB-002",
  },
  {
    name: "Insulated Water Bottle (1L)",
    description: "Double-wall stainless steel bottle, keeps drinks cold for 24 hours.",
    category: "Sports & Fitness",
    price: 799,
    stock: 0,
    lowStockThreshold: 10,
    sku: "SPRT-WB-003",
  },
];

const demoUsers = [
  {
    name: "Admin User",
    email: "admin@retaildemo.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Demo Customer",
    email: "customer@retaildemo.com",
    password: "customer123",
    role: "customer",
  },
];

const seed = async () => {
  await connectDB();

  try {
    console.log("Clearing existing products and demo users...");
    await Product.deleteMany({});
    await User.deleteMany({ email: { $in: demoUsers.map((u) => u.email) } });

    console.log("Inserting demo products...");
    await Product.insertMany(demoProducts);

    console.log("Creating demo accounts...");
    // Use .create() (not insertMany) so the User model's pre-save password hash hook runs
    for (const u of demoUsers) {
      await User.create(u);
    }

    console.log("\nSeed complete.");
    console.log(`  Products inserted: ${demoProducts.length}`);
    console.log("  Demo accounts:");
    demoUsers.forEach((u) => console.log(`    ${u.role.padEnd(9)} ${u.email} / ${u.password}`));
    console.log("\nChange or remove these demo accounts before any real deployment.");
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seed();
