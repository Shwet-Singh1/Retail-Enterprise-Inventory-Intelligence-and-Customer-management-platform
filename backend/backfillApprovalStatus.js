// backfillApprovalStatus.js
// Run once from your backend folder: node backfillApprovalStatus.js
// Sets approvalStatus: "approved" on any product that doesn't have the field yet
// (i.e. your original seeded catalog, created before the self-listing feature).

require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const result = await Product.updateMany(
    { approvalStatus: { $exists: false } },
    { $set: { approvalStatus: "approved" } }
  );

  console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
