/**
 * Notification Service
 * Centralized helper to create a notification in DB + emit it via Socket.IO
 */
const Notification = require('../models/notification.model');

/**
 * @param {object} opts
 * @param {string|ObjectId} opts.userId   - Recipient user ID
 * @param {'cv_viewed'|'application_status'|'job_match'} opts.type
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {object} [opts.meta]           - Extra metadata (jobId, companyId, etc.)
 */
async function createAndEmitNotification({ userId, type, title, message, meta = {} }) {
    try {
        const notif = await Notification.create({ userId, type, title, message, meta });

        // Emit in real time if user is online
        try {
            const { getIO, connectedUsers } = require('../socket');
            const io = getIO();
            const socketId = connectedUsers.get(userId.toString());
            if (socketId) {
                io.to(socketId).emit('new_notification', notif);
            }
        } catch {
            // Socket may not be initialized (e.g. in tests) – silently skip
        }

        return notif;
    } catch (err) {
        console.error('createAndEmitNotification error:', err.message);
    }
}

module.exports = { createAndEmitNotification };
