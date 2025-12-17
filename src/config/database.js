import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hasan_enterprises';
    
    if (mongoUri.includes('mongodb+srv://') && !mongoUri.includes('.mongodb.net/hasan_enterprises')) {
      mongoUri = mongoUri.replace('.mongodb.net/', '.mongodb.net/hasan_enterprises');
    }
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
};

export default connectDB;
