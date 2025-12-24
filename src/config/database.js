import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri =
      "mongodb+srv://admin:2VynNygpdv37GzRf@cluster0.otbvyzk.mongodb.net/hasan-enterprises";

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true,
    });
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
