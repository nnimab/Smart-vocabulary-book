import { Request, Response } from 'express';
import { Word, IWord } from '../models/Word';
import { VocabularyBook } from '../models/VocabularyBook';
import mongoose from 'mongoose';

// 根據單字本獲取單字
export const getWordsByBook = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    
    const book = await VocabularyBook.findById(bookId).populate('words');
    if (!book) {
      return res.status(404).json({ message: '找不到單字本' });
    }
    
    res.status(200).json({ words: book.words });
  } catch (error) {
    console.error('獲取單字時出錯:', error);
    res.status(500).json({ message: '獲取單字失敗' });
  }
};

// 獲取待復習的單字
export const getWordsForReview = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    
    // 查找該用戶所有需要復習的單字
    const books = await VocabularyBook.find({ user: userId }).populate({
      path: 'words',
      match: { 
        nextReviewAt: { $lte: now },
        isKnown: false
      }
    });
    
    // 收集所有需要復習的單字
    const wordsToReview: IWord[] = [];
    books.forEach(book => {
      if (book.words && Array.isArray(book.words)) {
        wordsToReview.push(...(book.words as IWord[]));
      }
    });
    
    // 按照複習日期排序
    wordsToReview.sort((a, b) => {
      if (!a.nextReviewAt) return 1;
      if (!b.nextReviewAt) return -1;
      return a.nextReviewAt.getTime() - b.nextReviewAt.getTime();
    });
    
    res.status(200).json({ wordsToReview });
  } catch (error) {
    console.error('獲取待復習單字時出錯:', error);
    res.status(500).json({ message: '獲取待復習單字失敗' });
  }
};

// 創建單字
export const createWord = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const wordData = req.body;
    
    const book = await VocabularyBook.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: '找不到單字本' });
    }
    
    const newWord = new Word(wordData);
    await newWord.save();
    
    // 添加單字到單字本
    book.words.push(newWord._id);
    await book.save();
    
    res.status(201).json({ word: newWord });
  } catch (error) {
    console.error('創建單字時出錯:', error);
    res.status(500).json({ message: '創建單字失敗' });
  }
};

// 批量導入單字
export const importWords = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { bookId } = req.params;
    const wordsData = req.body.words;
    
    if (!Array.isArray(wordsData) || wordsData.length === 0) {
      return res.status(400).json({ message: '無效的單字數據' });
    }
    
    const book = await VocabularyBook.findById(bookId).session(session);
    if (!book) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: '找不到單字本' });
    }
    
    // 批量創建單字
    const newWords = await Word.create(wordsData, { session });
    
    // 添加所有單字ID到單字本
    const wordIds = newWords.map(word => word._id);
    book.words.push(...wordIds);
    await book.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({ 
      message: `成功導入 ${newWords.length} 個單字`,
      words: newWords 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('批量導入單字時出錯:', error);
    res.status(500).json({ message: '批量導入單字失敗' });
  }
};

// 更新單字熟悉度
export const updateWordFamiliarity = async (req: Request, res: Response) => {
  try {
    const { wordId } = req.params;
    const { isKnown, reviewTime } = req.body;
    
    const word = await Word.findById(wordId);
    if (!word) {
      return res.status(404).json({ message: '找不到單字' });
    }
    
    // 更新單字狀態
    word.isKnown = isKnown;
    word.lastReviewedAt = new Date();
    word.reviewCount += 1;
    
    // 添加狀態歷史
    word.statusHistory.push({
      status: isKnown ? 'known' : 'unknown',
      date: new Date()
    });
    
    // 如果標記為不認識，增加錯誤計數
    if (!isKnown) {
      word.incorrectCount += 1;
      // 如果之前已經熟悉，降低熟悉度
      if (word.familiarity > 0) {
        word.familiarity = Math.max(0, word.familiarity - 1);
      }
    } else {
      // 增加熟悉度
      if (word.familiarity < 5) {
        word.familiarity += 1;
      }
    }
    
    // 根據艾賓浩斯曲線更新下次複習時間
    word.updateNextReviewTime();
    
    await word.save();
    
    res.status(200).json({ 
      message: '成功更新單字熟悉度',
      word 
    });
  } catch (error) {
    console.error('更新單字熟悉度時出錯:', error);
    res.status(500).json({ message: '更新單字熟悉度失敗' });
  }
};

// 刪除單字
export const deleteWord = async (req: Request, res: Response) => {
  try {
    const { wordId, bookId } = req.params;
    
    // 從單字本中移除單字
    const book = await VocabularyBook.findById(bookId);
    if (book) {
      book.words = book.words.filter(id => id.toString() !== wordId);
      await book.save();
    }
    
    // 刪除單字
    await Word.findByIdAndDelete(wordId);
    
    res.status(200).json({ message: '單字已成功刪除' });
  } catch (error) {
    console.error('刪除單字時出錯:', error);
    res.status(500).json({ message: '刪除單字失敗' });
  }
}; 