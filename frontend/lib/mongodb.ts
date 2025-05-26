import mongoose from 'mongoose';

// 防止在開發時重複連接到數據庫
let isConnected = false;

export const connectToDatabase = async () => {
  try {
    // 檢查是否已連接
    if (isConnected) {
      return;
    }

    // 使用環境變量中的連接字符串，如果未定義則使用本地數據庫
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vocabulary-app';
    
    // 連接到 MongoDB
    await mongoose.connect(mongoURI);
    
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}; 