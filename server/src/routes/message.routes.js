const express = require('express');
const router = express.Router();

const { asyncHandler, authAdmin, authUser } = require('../auth/checkAuth');

const messageController = require('../controller/message.controller');

router.post('/create', authUser, asyncHandler(messageController.createMessage));
router.post('/update-message-is-read', authUser, asyncHandler(messageController.updateMessageIsRead));
router.get('/get/:conversationId', authUser, asyncHandler(messageController.getMessagesByConversationId));

module.exports = router;
