// One-off script to populate the database with demo data.
// Run with: npm run seed  (from the backend folder)
// Safe to re-run - it wipes existing Products/Users first (only in this collection),
// so don't run it against a database you care about keeping.
//
// Requires a free Pexels API key in your .env as PEXELS_API_KEY, so each
// product gets a real, relevant photo instead of a placeholder. Get one at
// pexels.com/api (free, instant, no card needed).

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Product = require("./models/Product");
const User = require("./models/User");

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// Neutral fallback tile (used only if a Pexels lookup fails for some reason,
// so the seed never breaks entirely over one flaky request).
const FALLBACK_IMAGE = (name) =>
  `https://placehold.co/600x600/6b6559/faf7f1?text=${encodeURIComponent(name)}&font=roboto`;

const fetchProductImage = async (keyword, name) => {
  if (!PEXELS_API_KEY) return FALLBACK_IMAGE(name);
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1&orientation=square`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    if (!res.ok) return FALLBACK_IMAGE(name);
    const data = await res.json();
    const photo = data.photos?.[0];
    return photo?.src?.large || FALLBACK_IMAGE(name);
  } catch {
    return FALLBACK_IMAGE(name);
  }
};

// [name, description, price, stock, lowStockThreshold, sku, photoKeyword]
const RAW_PRODUCTS = {
  Electronics: [
    ["Wireless Mechanical Keyboard", "Compact 75% layout mechanical keyboard with hot-swappable switches and Bluetooth + USB-C connectivity.", 4499, 35, 10, "ELEC-KB-001", "mechanical keyboard"],
    ["Noise Cancelling Headphones", "Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.", 7999, 20, 8, "ELEC-HP-002", "headphones"],
    ["USB-C Fast Charger (65W)", "Compact GaN charger with 65W output, compatible with laptops and phones.", 1899, 60, 15, "ELEC-CH-003", "phone charger"],
    ["Portable Bluetooth Speaker", "Waterproof speaker with 12-hour playtime and punchy bass for outdoor use.", 2999, 6, 10, "ELEC-SPK-004", "bluetooth speaker"],
    ["Fitness Smart Watch", "Heart-rate and sleep tracking, 7-day battery, compatible with iOS and Android.", 3999, 0, 10, "ELEC-SW-005", "smart watch"],
  ],
  Apparel: [
    ["Men's Cotton Casual Shirt", "Breathable 100% cotton shirt, regular fit, machine washable.", 1299, 45, 10, "APP-SH-001", "mens shirt folded"],
    ["Women's Running Shoes", "Lightweight running shoes with cushioned sole, breathable mesh upper.", 3499, 8, 10, "APP-SH-002", "running shoes"],
    ["Denim Jacket", "Classic unisex denim jacket, mid-wash, button front.", 2599, 25, 8, "APP-JK-003", "denim jacket"],
    ["Cotton Hoodie", "Heavyweight fleece hoodie with kangaroo pocket, unisex sizing.", 1899, 30, 10, "APP-HD-004", "hoodie folded"],
    ["Ankle Socks (3-Pack)", "Breathable cotton-blend ankle socks, cushioned sole.", 499, 70, 15, "APP-SK-005", "socks pair"],
  ],
  "Home & Kitchen": [
    ["Non-Stick Cookware Set (5-Piece)", "Induction-friendly non-stick cookware set with tempered glass lids.", 3299, 18, 5, "HOME-CK-001", "cookware set pots"],
    ["Electric Kettle (1.5L)", "Stainless steel electric kettle with auto shut-off, 1500W.", 1499, 40, 10, "HOME-KT-002", "electric kettle"],
    ["Memory Foam Pillow", "Ergonomic cervical support pillow with cooling gel layer.", 999, 5, 10, "HOME-PL-003", "pillow"],
    ["Handheld Stick Blender", "3-in-1 immersion blender with whisk and chopper attachments.", 1799, 22, 8, "HOME-BL-004", "hand blender kitchen"],
    ["Dinner Set (16-Piece)", "Stoneware dinner set for 4, microwave and dishwasher safe.", 2799, 0, 6, "HOME-DN-005", "dinner plate set"],
  ],
  "Sports & Fitness": [
    ["Yoga Mat (6mm)", "Non-slip textured yoga mat with carry strap, 6mm thickness.", 899, 50, 15, "SPRT-YM-001", "yoga mat rolled"],
    ["Adjustable Dumbbell Set (10kg)", "Pair of adjustable dumbbells, 2.5kg to 10kg per hand.", 5499, 12, 5, "SPRT-DB-002", "dumbbells"],
    ["Insulated Water Bottle (1L)", "Double-wall stainless steel bottle, keeps drinks cold for 24 hours.", 799, 0, 10, "SPRT-WB-003", "steel water bottle"],
    ["Resistance Bands Set", "5 resistance levels with door anchor and carry bag.", 699, 45, 10, "SPRT-RB-004", "resistance bands"],
    ["Football (Size 5)", "Match-quality synthetic leather football, all-weather use.", 1199, 9, 10, "SPRT-FB-005", "soccer ball"],
  ],
  Books: [
    ["The Silent Orchard", "A quiet literary novel about family and memory across three generations.", 399, 25, 8, "BOOK-FIC-001", "novel book cover"],
    ["Everyday Indian Cooking", "120 regional recipes for the modern home kitchen.", 599, 18, 6, "BOOK-CK-002", "cookbook"],
    ["Atomic Focus", "A practical guide to deep work and building better habits.", 449, 30, 8, "BOOK-SH-003", "self help book"],
    ["The Startup Playbook", "Frameworks for early-stage product and go-to-market decisions.", 549, 4, 8, "BOOK-BIZ-004", "business book"],
  ],
  "Beauty & Personal Care": [
    ["Gentle Foaming Face Wash", "Sulfate-free daily cleanser for all skin types, 150ml.", 349, 55, 15, "BEAU-FW-001", "face wash bottle"],
    ["Argan Oil Shampoo", "Sulfate-free shampoo for dry and frizzy hair, 300ml.", 429, 40, 10, "BEAU-SH-002", "shampoo bottle"],
    ["Signature Eau de Parfum", "Long-lasting unisex fragrance, woody-citrus notes, 50ml.", 1899, 3, 6, "BEAU-PF-003", "perfume bottle"],
    ["Vitamin C Serum", "Brightening face serum with 10% vitamin C, 30ml.", 699, 20, 8, "BEAU-SR-004", "serum dropper bottle"],
  ],
  Groceries: [
    ["Arabica Coffee Beans (500g)", "Single-origin medium roast, whole bean.", 649, 35, 10, "GROC-CF-001", "coffee beans bag"],
    ["Cold-Pressed Olive Oil (1L)", "Extra virgin, first cold press, glass bottle.", 899, 28, 8, "GROC-OL-002", "olive oil bottle"],
    ["Multigrain Breakfast Cereal", "High-fibre cereal blend, no added sugar, 500g.", 299, 0, 10, "GROC-CR-003", "cereal box"],
    ["Organic Honey (500g)", "Raw, unprocessed, single-source honey.", 449, 42, 10, "GROC-HN-004", "honey jar"],
  ],
  "Toys & Games": [
    ["Wooden Building Blocks Set", "100-piece natural wood blocks for open-ended play, ages 3+.", 1299, 15, 6, "TOY-BLK-001", "wooden building blocks"],
    ["Strategy Board Game", "2-4 player strategy game, 45-60 min playtime, ages 10+.", 1599, 7, 8, "TOY-BG-002", "board game box"],
    ["Remote Control Car", "1:18 scale RC car, rechargeable battery, 20km/h top speed.", 2299, 11, 6, "TOY-RC-003", "remote control car toy"],
    ["Wooden Puzzle Cube Set", "6-piece brain teaser puzzle set for ages 8+.", 499, 33, 10, "TOY-PZ-004", "wooden puzzle cube"],
  ],
};

const seed = async () => {
  await connectDB();

  try {
    console.log("Clearing existing products and demo users...");
    await Product.deleteMany({});

    const demoUsers = [
      { name: "Admin User", email: "admin@retaildemo.com", password: "admin123", role: "admin" },
      { name: "Demo Customer", email: "customer@retaildemo.com", password: "customer123", role: "customer" },
    ];
    await User.deleteMany({ email: { $in: demoUsers.map((u) => u.email) } });

    if (!PEXELS_API_KEY) {
      console.log(
        "\n  No PEXELS_API_KEY found in .env - products will use plain fallback tiles instead of real photos.\n  Get a free key at pexels.com/api and add PEXELS_API_KEY=... to backend/.env, then re-run this script.\n"
      );
    }

    console.log("Fetching product photos and inserting products (this takes a bit longer than before)...");
    const flatEntries = Object.entries(RAW_PRODUCTS).flatMap(([category, items]) =>
      items.map(([name, description, price, stock, lowStockThreshold, sku, keyword]) => ({
        category,
        name,
        description,
        price,
        stock,
        lowStockThreshold,
        sku,
        keyword,
      }))
    );

    const demoProducts = [];
    for (const entry of flatEntries) {
      const imageUrl = await fetchProductImage(entry.keyword, entry.name);
      demoProducts.push({
        name: entry.name,
        description: entry.description,
        category: entry.category,
        price: entry.price,
        stock: entry.stock,
        lowStockThreshold: entry.lowStockThreshold,
        sku: entry.sku,
        imageUrl,
      });
      process.stdout.write(".");
    }
    console.log("");

    await Product.insertMany(demoProducts);

    console.log("Creating demo accounts...");
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
