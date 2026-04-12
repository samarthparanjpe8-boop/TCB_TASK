import "dotenv/config";
import mongoose from "mongoose";
import { config } from "../config.js";
import { User } from "../models/User.js";
const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
    console.error("Usage: npm run promote-teacher -- <email>");
    process.exit(1);
}
await mongoose.connect(config.mongoUri);
const u = await User.findOne({ email });
if (!u) {
    console.error("User not found. They must call GET /api/v1/me once after signing in, or be created as a student first.");
    process.exit(1);
}
u.role = "teacher";
await u.save();
console.log(`Promoted ${email} to teacher`);
await mongoose.disconnect();
