const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notification.controller');
const { asyncHandler, authUser } = require('../auth/checkAuth');

router.get('/', authUser, asyncHandler(notificationController.getNotifications));
router.patch('/:notifId/read', authUser, asyncHandler(notificationController.markAsRead));
router.patch('/read-all', authUser, asyncHandler(notificationController.markAllAsRead));
router.delete('/:notifId', authUser, asyncHandler(notificationController.deleteNotification));
router.delete('/', authUser, asyncHandler(notificationController.clearAll));

module.exports = router;
