import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "./config.js";
import { User } from "./models/User.js";

/** Creates the first admin account: ADMIN_EMAIL + ADMIN_PASSWORD env vars. */
async function seed() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (8+ chars) to seed.");
    process.exit(1);
  }
  await mongoose.connect(config.mongoUri);
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log("Admin already exists:", email);
  } else {
    await User.create({
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "admin",
      displayName: "Administrator",
    });
    console.log("✓ Admin created:", email);
  }
  await mongoose.disconnect();
}

seed();
