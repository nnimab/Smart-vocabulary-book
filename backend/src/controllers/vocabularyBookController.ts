import { Request, Response } from 'express';
import { VocabularyBook } from '../models/VocabularyBook';
import { Word } from '../models/Word';
import mongoose from 'mongoose';

// 獲取用戶所有單字本
export const getUserBooks = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const books = await VocabularyBook.find({ user: userId })
      .sort({ updatedAt: -1 });
    
    res.status(200).json({ books });
  } catch (error) {
    console.error('獲取單字本時出錯:', error);
    res.status(500).json({ message: '獲取單字本失敗' });
  }
};

// 獲取單字本詳情
export const getBookDetails = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    
    const book = await VocabularyBook.findById(bookId)
      .populate('words');
    
    if (!book) {
      return res.status(404).json({ message: '找不到單字本' });
    }
    
    res.status(200).json({ book });
  } catch (error) {
    console.error('獲取單字本詳情時出錯:', error);
    res.status(500).json({ message: '獲取單字本詳情失敗' });
  }
};

// 創建單字本
export const createBook = async (req: Request, res: Response) => {
  try {
    const { name, description, userId, tags } = req.body;
    
    const newBook = new VocabularyBook({
      name,
      description,
      user: userId,
      tags,
      words: [],
      totalWords: 0,
      knownWords: 0,
      unknownWords: 0
    });
    
    await newBook.save();
    
    res.status(201).json({ book: newBook });
  } catch (error) {
    console.error('創建單字本時出錯:', error);
    res.status(500).json({ message: '創建單字本失敗' });
  }
};

// 更新單字本
export const updateBook = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const updateData = req.body;
    
    const book = await VocabularyBook.findById(bookId);
    
    if (!book) {
      return res.status(404).json({ message: '找不到單字本' });
    }
    
    // 更新單字本屬性
    if (updateData.name) book.name = updateData.name;
    if (updateData.description) book.description = updateData.description;
    if (updateData.tags) book.tags = updateData.tags;
    
    await book.save();
    
    res.status(200).json({ book });
  } catch (error) {
    console.error('更新單字本時出錯:', error);
    res.status(500).json({ message: '更新單字本失敗' });
  }
};

// 刪除單字本
export const deleteBook = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { bookId } = req.params;
    const { deleteWords = false } = req.query;
    
    // 找到單字本
    const book = await VocabularyBook.findById(bookId).session(session);
    
    if (!book) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: '找不到單字本' });
    }
    
    // 如果需要刪除所有單字
    if (deleteWords === 'true') {
      await Word.deleteMany({ _id: { $in: book.words } }).session(session);
    }
    
    // 刪除單字本
    await VocabularyBook.findByIdAndDelete(bookId).session(session);
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({ message: '單字本已成功刪除' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('刪除單字本時出錯:', error);
    res.status(500).json({ message: '刪除單字本失敗' });
  }
};

// 獲取用戶當前選中的單字本
export const getCurrentBook = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { currentBookId } = req.query;
    
    // 如果有指定當前單字本，則獲取該單字本
    if (currentBookId) {
      const book = await VocabularyBook.findOne({
        _id: currentBookId,
        user: userId
      }).populate('words');
      
      if (book) {
        return res.status(200).json({ currentBook: book });
      }
    }
    
    // 否則獲取用戶最新的單字本
    const latestBook = await VocabularyBook.findOne({ user: userId })
      .sort({ updatedAt: -1 })
      .populate('words');
    
    if (!latestBook) {
      return res.status(404).json({ message: '找不到單字本' });
    }
    
    res.status(200).json({ currentBook: latestBook });
  } catch (error) {
    console.error('獲取當前單字本時出錯:', error);
    res.status(500).json({ message: '獲取當前單字本失敗' });
  }
};

// 設置用戶當前選中的單字本
export const setCurrentBook = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { bookId } = req.body;
    
    // 檢查單字本是否存在且屬於該用戶
    const book = await VocabularyBook.findOne({
      _id: bookId,
      user: userId
    });
    
    if (!book) {
      return res.status(404).json({ message: '找不到單字本或沒有訪問權限' });
    }
    
    // 這裡可以將用戶的當前單字本ID保存到某處
    // 例如用戶設置表或其他存儲
    
    res.status(200).json({ currentBookId: bookId });
  } catch (error) {
    console.error('設置當前單字本時出錯:', error);
    res.status(500).json({ message: '設置當前單字本失敗' });
  }
}; 