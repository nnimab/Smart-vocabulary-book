import { Request, Response } from 'express';
import { StudySession } from '../models/StudySession';
import { Word } from '../models/Word';
import { VocabularyBook } from '../models/VocabularyBook';
import mongoose from 'mongoose';

// 開始新的學習會話
export const startSession = async (req: Request, res: Response) => {
  try {
    const { userId, bookId } = req.body;
    
    // 檢查單字本是否存在
    const book = await VocabularyBook.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: '找不到單字本' });
    }
    
    // 創建新的學習會話
    const newSession = new StudySession({
      user: userId,
      book: bookId,
      startTime: new Date(),
      wordResults: [],
    });
    
    await newSession.save();
    
    // 更新單字本的最後學習時間
    book.lastStudied = new Date();
    await book.save();
    
    res.status(201).json({ 
      message: '學習會話已開始',
      sessionId: newSession._id 
    });
  } catch (error) {
    console.error('開始學習會話時出錯:', error);
    res.status(500).json({ message: '開始學習會話失敗' });
  }
};

// 在學習會話中記錄單字結果
export const recordWordResult = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { wordId, known, timeSpent } = req.body;
    
    // 獲取學習會話
    const session = await StudySession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: '找不到學習會話' });
    }
    
    // 檢查單字是否存在
    const word = await Word.findById(wordId);
    if (!word) {
      return res.status(404).json({ message: '找不到單字' });
    }
    
    // 添加單字學習結果
    session.addWordResult(wordId, known, timeSpent);
    await session.save();
    
    // 更新單字的熟悉度
    word.isKnown = known;
    word.lastReviewedAt = new Date();
    word.reviewCount += 1;
    
    // 添加狀態變化歷史
    word.statusHistory.push({
      status: known ? 'known' : 'unknown',
      date: new Date()
    });
    
    // 更新熟悉度等級
    if (known) {
      // 如果熟悉，增加熟悉度
      if (word.familiarity < 5) {
        word.familiarity += 1;
      }
    } else {
      // 如果不熟悉，降低熟悉度並增加錯誤計數
      word.incorrectCount += 1;
      if (word.familiarity > 0) {
        word.familiarity = Math.max(0, word.familiarity - 1);
      }
    }
    
    // 計算下次複習時間
    word.updateNextReviewTime();
    
    await word.save();
    
    res.status(200).json({ 
      message: '單字學習結果已記錄',
      wordStatus: {
        isKnown: word.isKnown,
        familiarity: word.familiarity,
        nextReviewAt: word.nextReviewAt
      }
    });
  } catch (error) {
    console.error('記錄單字結果時出錯:', error);
    res.status(500).json({ message: '記錄單字結果失敗' });
  }
};

// 結束學習會話
export const endSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    // 獲取學習會話
    const session = await StudySession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: '找不到學習會話' });
    }
    
    // 結束會話並計算統計數據
    session.endSession();
    await session.save();
    
    // 更新相關單字本的統計數據
    const book = await VocabularyBook.findById(session.book);
    if (book) {
      // 重新計算已知和未知單字數量
      await book.updateStats();
      await book.save();
    }
    
    res.status(200).json({ 
      message: '學習會話已結束',
      stats: {
        duration: session.duration,
        totalWords: session.totalWords,
        knownWords: session.knownWords,
        unknownWords: session.unknownWords
      }
    });
  } catch (error) {
    console.error('結束學習會話時出錯:', error);
    res.status(500).json({ message: '結束學習會話失敗' });
  }
};

// 獲取用戶的學習會話歷史
export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 10, skip = 0 } = req.query;
    
    // 查詢用戶的學習會話
    const sessions = await StudySession.find({ user: userId })
      .sort({ startTime: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate('book', 'name');
    
    // 獲取會話總數（用於分頁）
    const total = await StudySession.countDocuments({ user: userId });
    
    res.status(200).json({ 
      sessions,
      total,
      page: {
        limit: Number(limit),
        skip: Number(skip),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('獲取學習會話歷史時出錯:', error);
    res.status(500).json({ message: '獲取學習會話歷史失敗' });
  }
};

// 獲取學習會話詳情
export const getSessionDetails = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    // 獲取學習會話並填充單字和單字本信息
    const session = await StudySession.findById(sessionId)
      .populate('book')
      .populate('wordResults.word');
    
    if (!session) {
      return res.status(404).json({ message: '找不到學習會話' });
    }
    
    res.status(200).json({ session });
  } catch (error) {
    console.error('獲取學習會話詳情時出錯:', error);
    res.status(500).json({ message: '獲取學習會話詳情失敗' });
  }
}; 