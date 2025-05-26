import mongoose, { Schema, Document, Model } from 'mongoose';

// 單字介面
export interface IWord extends Document {
  id: string;
  word: string;
  definition: string;
  createdAt: Date;
  updatedAt: Date;
}

// 單字本介面
export interface IVocabularyBook extends Document {
  id: string;
  name: string;
  words: IWord[];
  createdAt: Date;
  updatedAt: Date;
}

// 用戶介面
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  books: IVocabularyBook[];
  currentBookId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 單字 Schema
const WordSchema = new Schema<IWord>(
  {
    id: { type: String, required: true },
    word: { type: String, required: true },
    definition: { type: String, required: true },
  },
  { timestamps: true }
);

// 單字本 Schema
const VocabularyBookSchema = new Schema<IVocabularyBook>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    words: [WordSchema],
  },
  { timestamps: true }
);

// 用戶 Schema
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    books: [VocabularyBookSchema],
    currentBookId: { type: String, default: null },
  },
  { timestamps: true }
);

// 檢查模型是否已經存在，避免在開發模式下重複定義
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 