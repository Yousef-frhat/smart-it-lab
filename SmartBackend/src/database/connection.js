import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI is not set in environment variables.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    console.error("   Make sure MongoDB is running and MONGO_URI is correct.");
    process.exit(1);
  }

  // Log unexpected disconnections after initial connect
  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected. Reconnecting automatically...");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("✅ MongoDB reconnected.");
  });
};
