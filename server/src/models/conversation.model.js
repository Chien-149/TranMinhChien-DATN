const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'members.memberType',
    },
    memberType: {
        type: String,
        enum: ['user', 'company'],
        required: true,
    },
});

const conversationSchema = new mongoose.Schema(
    {
        members: [memberSchema],
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'message',
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('conversation', conversationSchema);
