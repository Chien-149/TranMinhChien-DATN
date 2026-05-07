const { getIO, connectedUsers } = require('../socket');

const emitToUser = (userId, event, data) => {
    const socketId = connectedUsers.get(userId.toString());
    if (socketId) {
        getIO().to(socketId).emit(event, data);
    }
};

const emitToAll = (event, data) => {
    getIO().emit(event, data);
};

const socketService = {
    emitUsersWatchingProduct: (event, data) => {
        emitToAll(event, data);
    },

    emitNewConversation: (userId, event, data) => {
        emitToUser(userId, event, data);
    },

    emitMessage: (userId, event, data) => {
        emitToUser(userId, event, data);
    },

    emitNewUserMessage: (userId, event, data) => {
        emitToUser(userId, event, data);
    },

    emitNotification: (userId, event, data) => {
        emitToUser(userId, event, data);
    },

    emitToFavourite: (userId, event, data) => {
        emitToUser(userId, event, data);
    },
};

module.exports = socketService;
