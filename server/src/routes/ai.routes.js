const express = require('express');
const router = express.Router();
const aiController = require('../controller/ai.controller');
const { asyncHandler, authUser } = require('../auth/checkAuth');

// ==================== PUBLIC ROUTES ====================
// AI gợi ý việc làm phù hợp với CV
router.post('/recommend-jobs', asyncHandler(aiController.recommendJobs));

// AI review CV
router.post('/review-cv', asyncHandler(aiController.reviewCV));

// AI chatbot tư vấn nghề nghiệp (public, nhưng có thể lưu lịch sử nếu đăng nhập)
router.post('/chat', asyncHandler(aiController.chat));

// ==================== PROTECTED ROUTES ====================
// Lấy lịch sử chat của user
router.get('/chat/history', authUser, asyncHandler(aiController.getChatHistory));

// Lấy chi tiết 1 chat
router.get('/chat/:chatId', authUser, asyncHandler(aiController.getChatById));

// Tạo chat mới
router.post('/chat/new', authUser, asyncHandler(aiController.createNewChat));

// Xóa chat
router.delete('/chat/:chatId', authUser, asyncHandler(aiController.deleteChat));

// Xóa tất cả lịch sử chat
router.delete('/chat', authUser, asyncHandler(aiController.clearAllChats));

// AI tạo Job Description (chỉ cho employer)
router.post('/generate-jd', authUser, asyncHandler(aiController.generateJD));

module.exports = router;
