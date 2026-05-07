const mongoose = require('mongoose');

const aiChatSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        messages: [
            {
                role: {
                    type: String,
                    enum: ['user', 'assistant'],
                    required: true,
                },
                content: {
                    type: String,
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        title: {
            type: String,
            default: 'Cuộc trò chuyện mới',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

// Index cho tìm kiếm nhanh
aiChatSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AIChat', aiChatSchema);
