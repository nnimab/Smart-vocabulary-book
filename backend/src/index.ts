import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';

// 載入環境變數
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vocabulary-app';

// 中間件
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api', apiRoutes);

// 健康檢查端點
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '服務運行正常' });
});

// 錯誤處理中間件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: process.env.NODE_ENV === 'production' ? '伺服器錯誤' : err.message,
  });
});

// 連接到MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('已成功連接到MongoDB');
    
    // 啟動服務器
    app.listen(PORT, () => {
      console.log(`伺服器運行在 http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('連接MongoDB失敗:', err);
    process.exit(1);
  });

// 處理未捕獲的異常
process.on('uncaughtException', (err) => {
  console.error('未捕獲的異常:', err);
  process.exit(1);
});

// 處理未處理的Promise拒絕
process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的Promise拒絕:', reason);
});

export default app; 