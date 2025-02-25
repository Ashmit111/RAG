import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables.");
  }

  const connectionState = mongoose.connection.readyState;

  if (connectionState === 1) {
    console.log("✅ Already connected to MongoDB");
    return;
  }

  if (connectionState === 2) {
    console.log("⏳ MongoDB connection in progress...");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "embed",
      bufferCommands: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Wait 30s before giving up
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log("✅ Successfully connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw new Error(`MongoDB connection failed: ${err.message}`);
  }
};

export default connect;
