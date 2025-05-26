import mongoose, { Document, Schema, Types } from 'mongoose';
import { IWord } from './Word';

export interface IVocabularyBook extends Document {
  name: string;
  description?: string;
  user: Types.ObjectId;
  words: Types.ObjectId[] | IWord[];
  // 學習進度統計
  totalWords: number;
  knownWords: number;
  unknownWords: number;
  lastStudied?: Date;
  createdAt: Date;
  updatedAt: Date;
  // 分類標籤
  tags?: string[];
}

const VocabularyBookSchema = new Schema<IVocabularyBook>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    words: [{
      type: Schema.Types.ObjectId,
      ref: 'Word',
    }],
    totalWords: {
      type: Number,
      default: 0,
    },
    knownWords: {
      type: Number,
      default: 0,
    },
    unknownWords: {
      type: Number,
      default: 0,
    },
    lastStudied: {
      type: Date,
    },
    tags: [{
      type: String,
    }],
  },
  { timestamps: true }
);

// 每當添加或刪除單字時更新統計
VocabularyBookSchema.methods.updateStats = async function() {
  if (this.words && this.words.length > 0) {
    try {
      // 確保所有單字都被填充
      if (!this.populated('words')) {
        await this.populate('words');
      }
      
      const filledWords = this.words as IWord[];
      this.totalWords = filledWords.length;
      this.knownWords = filledWords.filter(word => word.isKnown).length;
      this.unknownWords = this.totalWords - this.knownWords;
    } catch (error) {
      console.error('更新單字本統計時出錯:', error);
    }
  } else {
    this.totalWords = 0;
    this.knownWords = 0;
    this.unknownWords = 0;
  }
};

// 保存前更新統計
VocabularyBookSchema.pre('save', async function(next) {
  try {
    await this.updateStats();
    next();
  } catch (error: any) {
    next(error);
  }
});

export const VocabularyBook = mongoose.model<IVocabularyBook>('VocabularyBook', VocabularyBookSchema); 