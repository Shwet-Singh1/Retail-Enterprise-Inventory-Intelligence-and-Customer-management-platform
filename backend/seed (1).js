// One-off script to populate the database with demo data.
// Run with: npm run seed  (from the backend folder)
// Safe to re-run - it wipes existing Products/Users first (only in this collection),
// so don't run it against a database you care about keeping.

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Product = require("./models/Product");
const User = require("./models/User");

// Real keyword-matched stock photos via LoremFlickr (free, no API key).
// `lock` pins each product to the SAME photo every time (no reshuffling on
// refresh) - each product gets a unique lock number so no two collide.
let lockCounter = 1000;
const stockPhoto = (keyword) => {
  lockCounter += 1;
  return `https://loremflickr.com/600/600/${keyword}?lock=${lockCounter}`;
};

// [name, description, price, stock, lowStockThreshold, sku, photoKeyword]
const RAW_PRODUCTS = {
  Electronics: [
    ["Wireless Mechanical Keyboard", "Compact 75% layout mechanical keyboard with hot-swappable switches and Bluetooth + USB-C connectivity.", 4499, 35, 10, "ELEC-KB-001", "keyboard"],
    ["Noise Cancelling Headphones", "Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.", 7999, 20, 8, "ELEC-HP-002", "headphones"],
    ["USB-C Fast Charger (65W)", "Compact GaN charger with 65W output, compatible with laptops and phones.", 1899, 60, 15, "ELEC-CH-003", "phonecharger"],
    ["Portable Bluetooth Speaker", "Waterproof speaker with 12-hour playtime and punchy bass for outdoor use.", 2999, 6, 10, "ELEC-SPK-004", "bluetoothspeaker"],
    ["Fitness Smart Watch", "Heart-rate and sleep tracking, 7-day battery, compatible with iOS and Android.", 3999, 0, 10, "ELEC-SW-005", "smartwatch"],
  ],
  Apparel: [
    ["Men's Cotton Casual Shirt", "Breathable 100% cotton shirt, regular fit, machine washable.", 1299, 45, 10, "APP-SH-001", "mensshirt"],
    ["Women's Running Shoes", "Lightweight running shoes with cushioned sole, breathable mesh upper.", 3499, 8, 10, "APP-SH-002", "runningshoes"],
    ["Denim Jacket", "Classic unisex denim jacket, mid-wash, button front.", 2599, 25, 8, "APP-JK-003", "denimjacket"],
    ["Cotton Hoodie", "Heavyweight fleece hoodie with kangaroo pocket, unisex sizing.", 1899, 30, 10, "APP-HD-004", "hoodie"],
    ["Ankle Socks (3-Pack)", "Breathable cotton-blend ankle socks, cushioned sole.", 499, 70, 15, "APP-SK-005", "socks"],
  ],
  "Home & Kitchen": [
    ["Non-Stick Cookware Set (5-Piece)", "Induction-friendly non-stick cookware set with tempered glass lids.", 3299, 18, 5, "HOME-CK-001", "cookwareset"],
    ["Electric Kettle (1.5L)", "Stainless steel electric kettle with auto shut-off, 1500W.", 1499, 40, 10, "HOME-KT-002", "electrickettle"],
    ["Memory Foam Pillow", "Ergonomic cervical support pillow with cooling gel layer.", 999, 5, 10, "HOME-PL-003", "pillow"],
    ["Handheld Stick Blender", "3-in-1 immersion blender with whisk and chopper attachments.", 1799, 22, 8, "HOME-BL-004", "handblender"],
    ["Dinner Set (16-Piece)", "Stoneware dinner set for 4, microwave and dishwasher safe.", 2799, 0, 6, "HOME-DN-005", "dinnerware"],
  ],
  "Sports & Fitness": [
    ["Yoga Mat (6mm)", "Non-slip textured yoga mat with carry strap, 6mm thickness.", 899, 50, 15, "SPRT-YM-001", "yogamat"],
    ["Adjustable Dumbbell Set (10kg)", "Pair of adjustable dumbbells, 2.5kg to 10kg per hand.", 5499, 12, 5, "SPRT-DB-002", "dumbbells"],
    ["Insulated Water Bottle (1L)", "Double-wall stainless steel bottle, keeps drinks cold for 24 hours.", 799, 0, 10, "SPRT-WB-003", "waterbottle"],
    ["Resistance Bands Set", "5 resistance levels with door anchor and carry bag.", 699, 45, 10, "SPRT-RB-004", "resistancebands"],
    ["Football (Size 5)", "Match-quality synthetic leather football, all-weather use.", 1199, 9, 10, "SPRT-FB-005", "soccerball"],
  ],
  Books: [
    ["The Silent Orchard", "A quiet literary novel about family and memory across three generations.", 399, 25, 8, "BOOK-FIC-001", "novelbook"],
    ["Everyday Indian Cooking", "120 regional recipes for the modern home kitchen.", 599, 18, 6, "BOOK-CK-002", "cookbook"],
    ["Atomic Focus", "A practical guide to deep work and building better habits.", 449, 30, 8, "BOOK-SH-003", "selfhelpbook"],
    ["The Startup Playbook", "Frameworks for early-stage product and go-to-market decisions.", 549, 4, 8, "BOOK-BIZ-004", "businessbook"],
  ],
  "Beauty & Personal Care": [
    ["Gentle Foaming Face Wash", "Sulfate-free daily cleanser for all skin types, 150ml.", 349, 55, 15, "BEAU-FW-001", "facewash"],
    ["Argan Oil Shampoo", "Sulfate-free shampoo for dry and frizzy hair, 300ml.", 429, 40, 10, "BEAU-SH-002", "shampoobottle"],
    ["Signature Eau de Parfum", "Long-lasting unisex fragrance, woody-citrus notes, 50ml.", 1899, 3, 6, "BEAU-PF-003", "perfumebottle"],
    ["Vitamin C Serum", "Brightening face serum with 10% vitamin C, 30ml.", 699, 20, 8, "BEAU-SR-004", "skincareserum"],
  ],
  Groceries: [
    ["Arabica Coffee Beans (500g)", "Single-origin medium roast, whole bean.", 649, 35, 10, "GROC-CF-001", "coffeebeans"],
    ["Cold-Pressed Olive Oil (1L)", "Extra virgin, first cold press, glass bottle.", 899, 28, 8, "GROC-OL-002", "oliveoilbottle"],
    ["Multigrain Breakfast Cereal", "High-fibre cereal blend, no added sugar, 500g.", 299, 0, 10, "GROC-CR-003", "cereal"],
    ["Organic Honey (500g)", "Raw, unprocessed, single-source honey.", 449, 42, 10, "GROC-HN-004", "honeyjar"],
  ],
  "Toys & Games": [
    ["Wooden Building Blocks Set", "100-piece natural wood blocks for open-ended play, ages 3+.", 1299, 15, 6, "TOY-BLK-001", "woodenblocks"],
    ["Strategy Board Game", "2-4 player strategy game, 45-60 min playtime, ages 10+.", 1599, 7, 8, "TOY-BG-002", "boardgame"],
    ["Remote Control Car", "1:18 scale RC car, rechargeable battery, 20km/h top speed.", 2299, 11, 6, "TOY-RC-003", "rccar"],
    ["Wooden Puzzle Cube Set", "6-piece brain teaser puzzle set for ages 8+.", 499, 33, 10, "TOY-PZ-004", "puzzlecube"],
  ],
};

const demoProducts = Object.entries(RAW_PRODUCTS).flatMap(([category, items]) =>
  items.map(([name, description, price, stock, lowStockThreshold, sku, keyword]) => ({
    name,
    description,
    category,
    price,
    stock,
    lowStockThreshold,
    sku,
    imageUrl: stockPhoto(keyword),
  }))
);

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

    const categoryCount = Object.keys(RAW_PRODUCTS).length;
    console.log("\nSeed complete.");
    console.log(`  Products inserted: ${demoProducts.length} across ${categoryCount} categories`);
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
