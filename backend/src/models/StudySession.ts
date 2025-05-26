import mongoose, { Document, Schema, Types } from 'mongoose';

// 單詞學習結果
interface IWordResult {
  word: Types.ObjectId;
  known: boolean;
  timeSpent: number; // 花費時間（毫秒）
  reviewedAt: Date;
}

// 學習會話模型
export interface IStudySession extends Document {
  user: Types.ObjectId;
  book: Types.ObjectId;
  startTime: Date;
  endTime?: Date; 
  duration: number; // 持續時間（毫秒）
  totalWords: number;
  knownWords: number;
  unknownWords: number;
  wordResults: IWordResult[];
  createdAt: Date;
  updatedAt: Date;
}

const WordResultSchema = new Schema<IWordResult>({
  word: {
    type: Schema.Types.ObjectId,
    ref: 'Word',
    required: true,
  },
  known: {
    type: Boolean,
    required: true,
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0,
  },
  reviewedAt: {
    type: Date,
    default: Date.now,
  },
});

const StudySessionSchema = new Schema<IStudySession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: 'VocabularyBook',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
      default: 0,
    },
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
    wordResults: [WordResultSchema],
  },
  { timestamps: true }
);

// 結束學習會話
StudySessionSchema.methods.endSession = function() {
  this.endTime = new Date();
  // 計算會話持續時間
  this.duration = this.endTime.getTime() - this.startTime.getTime();
  
  // 計算統計信息
  this.totalWords = this.wordResults.length;
  this.knownWords = this.wordResults.filter(result => result.known).length;
  this.unknownWords = this.totalWords - this.knownWords;
};

// 添加單詞學習結果
StudySessionSchema.methods.addWordResult = function(wordId: Types.ObjectId, known: boolean, timeSpent: number) {
  this.wordResults.push({
    word: wordId,
    known,
    timeSpent,
    reviewedAt: new Date(),
  });
};

export const StudySession = mongoose.model<IStudySession>('StudySession', StudySessionSchema); 