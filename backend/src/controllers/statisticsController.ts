import { Request, Response } from 'express';
import { StudySession } from '../models/StudySession';
import { Word } from '../models/Word';
import { VocabularyBook } from '../models/VocabularyBook';
import mongoose from 'mongoose';

// 獲取學習統計概況
export const getOverallStatistics = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // 獲取用戶的所有學習數據
    const sessions = await StudySession.find({ user: userId });
    const books = await VocabularyBook.find({ user: userId });
    
    // 統計總單字量
    const totalWords = books.reduce((sum, book) => sum + book.totalWords, 0);
    const knownWords = books.reduce((sum, book) => sum + book.knownWords, 0);
    const unknownWords = books.reduce((sum, book) => sum + book.unknownWords, 0);
    
    // 計算學習時間
    const totalStudyTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    
    // 計算學習天數和連續學習天數
    const studyDays = new Set();
    let currentStreak = 0;
    let longestStreak = 0;
    let lastStudyDate: Date | null = null;
    
    // 按日期排序會話
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    
    for (const session of sortedSessions) {
      const dateStr = new Date(session.startTime).toISOString().split('T')[0];
      studyDays.add(dateStr);
      
      // 檢查連續學習天數
      if (lastStudyDate) {
        const current = new Date(session.startTime);
        const last = new Date(lastStudyDate);
        current.setHours(0, 0, 0, 0);
        last.setHours(0, 0, 0, 0);
        
        // 如果是連續一天，增加連續計數
        const diffDays = (current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          // 不連續，重設計數器
          currentStreak = 1;
        }
        
        // 更新最長連續天數
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      } else {
        currentStreak = 1;
      }
      
      lastStudyDate = session.startTime;
    }
    
    // 計算每日平均學習單詞量
    const averageWordsPerDay = studyDays.size > 0 
      ? (totalWords / studyDays.size).toFixed(1) 
      : 0;
    
    // 計算掌握率
    const masteryRate = totalWords > 0 
      ? Math.round((knownWords / totalWords) * 100) 
      : 0;
    
    res.status(200).json({
      totalWords,
      knownWords,
      unknownWords,
      masteryRate,
      totalStudyTime,
      studyDays: studyDays.size,
      longestStreak,
      currentStreak,
      averageWordsPerDay
    });
  } catch (error) {
    console.error('獲取學習統計時出錯:', error);
    res.status(500).json({ message: '獲取學習統計失敗' });
  }
};

// 獲取活動熱圖數據
export const getActivityHeatmap = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { timeframe = 'year' } = req.query;
    
    // 設置時間範圍
    const startDate = new Date();
    switch (timeframe) {
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
      default:
        startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    // 查詢時間範圍內的所有學習會話
    const sessions = await StudySession.find({
      user: userId,
      startTime: { $gte: startDate }
    });
    
    // 統計每天的學習活動（單詞數量）
    const activityData: Record<string, number> = {};
    
    for (const session of sessions) {
      const dateStr = new Date(session.startTime).toISOString().split('T')[0];
      
      if (!activityData[dateStr]) {
        activityData[dateStr] = 0;
      }
      
      activityData[dateStr] += session.totalWords;
    }
    
    res.status(200).json({ activityData });
  } catch (error) {
    console.error('獲取活動熱圖數據時出錯:', error);
    res.status(500).json({ message: '獲取活動熱圖數據失敗' });
  }
};

// 獲取學習進度數據（按月）
export const getMonthlyProgress = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // 獲取過去12個月的數據
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);
    
    // 查詢這段時間內的學習會話
    const sessions = await StudySession.find({
      user: userId,
      startTime: { $gte: startDate, $lte: endDate }
    });
    
    // 按月分組統計
    const monthlyData: Record<string, { learned: number, mastered: number }> = {};
    
    // 初始化每個月的資料結構
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const monthKey = date.toISOString().slice(0, 7); // 格式: YYYY-MM
      monthlyData[monthKey] = { learned: 0, mastered: 0 };
    }
    
    // 統計數據
    for (const session of sessions) {
      const monthKey = session.startTime.toISOString().slice(0, 7);
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].learned += session.totalWords;
        monthlyData[monthKey].mastered += session.knownWords;
      }
    }
    
    // 轉換為前端需要的格式
    const monthlyProgress = Object.entries(monthlyData).map(([month, data]) => {
      const date = new Date(month);
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        learned: data.learned,
        mastered: data.mastered
      };
    });
    
    // 按時間順序排序
    monthlyProgress.sort((a, b) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });
    
    res.status(200).json({ monthlyProgress });
  } catch (error) {
    console.error('獲取月度進度數據時出錯:', error);
    res.status(500).json({ message: '獲取月度進度數據失敗' });
  }
};

// 獲取艾賓浩斯遺忘曲線數據
export const getMemoryCurveData = async (req: Request, res: Response) => {
  try {
    // 標準艾賓浩斯遺忘曲線數據點
    const standardCurve = [
      { day: 0, retention: 100 },
      { day: 1, retention: 70 },
      { day: 2, retention: 60 },
      { day: 4, retention: 50 },
      { day: 7, retention: 40 },
      { day: 14, retention: 30 },
      { day: 30, retention: 20 },
      { day: 60, retention: 15 },
      { day: 90, retention: 10 }
    ];
    
    const { userId } = req.params;
    
    // 獲取用戶的實際記憶數據
    const words = await Word.find({
      // 找出所有有學習歷史的單詞
      statusHistory: { $exists: true, $not: { $size: 0 } }
    });
    
    // 計算實際記憶保留率
    const retentionData: Record<number, { correct: number, total: number }> = {};
    
    // 初始化間隔天數的數據
    const intervals = [1, 2, 4, 7, 14, 30, 60, 90];
    for (const interval of intervals) {
      retentionData[interval] = { correct: 0, total: 0 };
    }
    
    // 分析每個單詞的學習歷史
    for (const word of words) {
      if (!word.statusHistory || word.statusHistory.length < 2) continue;
      
      const history = [...word.statusHistory].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // 計算每個複習間隔的記憶保留率
      for (let i = 1; i < history.length; i++) {
        const prevReview = new Date(history[i-1].date);
        const currentReview = new Date(history[i].date);
        const daysDiff = Math.round((currentReview.getTime() - prevReview.getTime()) / (1000 * 60 * 60 * 24));
        
        // 找到最接近的間隔
        const closestInterval = intervals.reduce((prev, curr) => 
          Math.abs(curr - daysDiff) < Math.abs(prev - daysDiff) ? curr : prev
        );
        
        // 如果間隔在合理範圍內
        if (Math.abs(closestInterval - daysDiff) <= closestInterval * 0.3) {
          retentionData[closestInterval].total += 1;
          
          // 如果記住了，增加正確計數
          if (history[i].status === 'known') {
            retentionData[closestInterval].correct += 1;
          }
        }
      }
    }
    
    // 計算每個間隔的記憶保留率
    const userCurve = intervals.map(interval => {
      const data = retentionData[interval];
      const retention = data.total > 0 
        ? Math.round((data.correct / data.total) * 100) 
        : null;
      
      return { day: interval, retention: retention || standardCurve.find(p => p.day === interval)?.retention || 0 };
    });
    
    // 為 day 0 添加 100% 的保留率
    userCurve.unshift({ day: 0, retention: 100 });
    
    // 排序
    userCurve.sort((a, b) => a.day - b.day);
    
    res.status(200).json({
      standardCurve,
      userCurve
    });
  } catch (error) {
    console.error('獲取記憶曲線數據時出錯:', error);
    res.status(500).json({ message: '獲取記憶曲線數據失敗' });
  }
}; 