import express from 'express';
import * as wordController from '../controllers/wordController';
import * as vocabularyBookController from '../controllers/vocabularyBookController';
import * as studySessionController from '../controllers/studySessionController';
import * as statisticsController from '../controllers/statisticsController';

const router = express.Router();

// 單字本相關路由
router.get('/books/user/:userId', vocabularyBookController.getUserBooks);
router.get('/books/:bookId', vocabularyBookController.getBookDetails);
router.post('/books', vocabularyBookController.createBook);
router.put('/books/:bookId', vocabularyBookController.updateBook);
router.delete('/books/:bookId', vocabularyBookController.deleteBook);
router.get('/books/current/:userId', vocabularyBookController.getCurrentBook);
router.post('/books/current/:userId', vocabularyBookController.setCurrentBook);

// 單字相關路由
router.get('/words/book/:bookId', wordController.getWordsByBook);
router.get('/words/review/:userId', wordController.getWordsForReview);
router.post('/words/book/:bookId', wordController.createWord);
router.post('/words/import/book/:bookId', wordController.importWords);
router.put('/words/:wordId/familiarity', wordController.updateWordFamiliarity);
router.delete('/words/:wordId/book/:bookId', wordController.deleteWord);

// 學習會話相關路由
router.post('/sessions/start', studySessionController.startSession);
router.post('/sessions/:sessionId/word', studySessionController.recordWordResult);
router.put('/sessions/:sessionId/end', studySessionController.endSession);
router.get('/sessions/user/:userId', studySessionController.getUserSessions);
router.get('/sessions/:sessionId', studySessionController.getSessionDetails);

// 統計相關路由
router.get('/statistics/:userId/overall', statisticsController.getOverallStatistics);
router.get('/statistics/:userId/activity', statisticsController.getActivityHeatmap);
router.get('/statistics/:userId/progress', statisticsController.getMonthlyProgress);
router.get('/statistics/:userId/memory-curve', statisticsController.getMemoryCurveData);

export default router; 