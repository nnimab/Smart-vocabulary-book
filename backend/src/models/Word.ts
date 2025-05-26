import mongoose, { Document, Schema } from 'mongoose';

export interface IWord extends Document {
  word: string;
  definition: string;
  examples?: string[];
  pronunciation?: string;
  createdAt: Date;
  updatedAt: Date;
  // 新增熟悉度相關欄位
  familiarity: number; // 0-5 熟悉度等級
  reviewCount: number; // 複習次數
  lastReviewedAt?: Date; // 上次複習時間
  nextReviewAt?: Date; // 下次推薦複習時間
  isKnown: boolean; // 是否已掌握
  incorrectCount: number; // 回答錯誤次數
  statusHistory: { // 狀態變化歷史
    status: 'known' | 'unknown'; // 熟悉/不熟悉
    date: Date;
  }[];
}

const WordSchema = new Schema<IWord>(
  {
    word: {
      type: String,
      required: true,
      trim: true,
    },
    definition: {
      type: String,
      required: true,
    },
    examples: [{
      type: String,
    }],
    pronunciation: {
      type: String,
    },
    familiarity: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    lastReviewedAt: {
      type: Date,
    },
    nextReviewAt: {
      type: Date,
    },
    isKnown: {
      type: Boolean,
      default: false,
    },
    incorrectCount: {
      type: Number,
      default: 0,
    },
    statusHistory: [{
      status: {
        type: String,
        enum: ['known', 'unknown'],
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  { timestamps: true }
);

// 計算下次複習時間（根據艾賓浩斯遺忘曲線）
WordSchema.methods.updateNextReviewTime = function(): void {
  const intervals = [1, 2, 4, 7, 15, 30]; // 間隔天數：1, 2, 4, 7, 15, 30天
  
  // 基於當前複習次數選擇間隔（最多使用最後一個間隔）
  const intervalIndex = Math.min(this.reviewCount, intervals.length - 1);
  const interval = intervals[intervalIndex];
  
  // 設置下次複習時間
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  this.nextReviewAt = nextDate;
};

export const Word = mongoose.model<IWord>('Word', WordSchema); 