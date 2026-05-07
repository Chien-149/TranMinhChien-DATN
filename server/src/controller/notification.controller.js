const { OK } = require('../core/success.response');
const Notification = require('../models/notification.model');

class NotificationController {
    // Get all notifications for current user
    async getNotifications(req, res) {
        const { id: userId } = req.user;
        const { limit = 20, skip = 0 } = req.query;

        const [notifications, total, unread] = await Promise.all([
            Notification.find({ userId })
                .sort({ createdAt: -1 })
                .limit(Number(limit))
                .skip(Number(skip))
                .lean(),
            Notification.countDocuments({ userId }),
            Notification.countDocuments({ userId, isRead: false }),
        ]);

        return new OK({
            message: 'success',
            metadata: { notifications, total, unread },
        }).send(res);
    }

    // Mark a single notification as read
    async markAsRead(req, res) {
        const { id: userId } = req.user;
        const { notifId } = req.params;

        await Notification.findOneAndUpdate({ _id: notifId, userId }, { isRead: true });

        return new OK({ message: 'Đã đánh dấu đọc' }).send(res);
    }

    // Mark all as read
    async markAllAsRead(req, res) {
        const { id: userId } = req.user;
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });
        return new OK({ message: 'Đã đánh dấu tất cả là đã đọc' }).send(res);
    }

    // Delete a notification
    async deleteNotification(req, res) {
        const { id: userId } = req.user;
        const { notifId } = req.params;
        await Notification.findOneAndDelete({ _id: notifId, userId });
        return new OK({ message: 'Đã xóa thông báo' }).send(res);
    }

    // Clear all notifications
    async clearAll(req, res) {
        const { id: userId } = req.user;
        await Notification.deleteMany({ userId });
        return new OK({ message: 'Đã xóa tất cả thông báo' }).send(res);
    }
}

module.exports = new NotificationController();
