const AIChat = require('../models/aiChat.model');

class AIChatService {
    // Lấy hoặc tạo chat session cho user
    async getOrCreateChat(userId) {
        // Tìm chat đang active
        let chat = await AIChat.findOne({ userId, isActive: true }).sort({ updatedAt: -1 });

        if (!chat) {
            // Tạo chat mới
            chat = await AIChat.create({
                userId,
                messages: [
                    {
                        role: 'assistant',
                        content:
                            'Xin chào! 👋 Tôi là AI tư vấn nghề nghiệp.\n\nTôi có thể giúp bạn:\n• Gợi ý việc làm phù hợp\n• Định hướng nghề nghiệp\n• Tư vấn kỹ năng cần học\n• Giải đáp thắc mắc về CV\n\nBạn cần hỗ trợ gì?',
                    },
                ],
            });
        }

        return chat;
    }

    // Thêm message vào chat
    async addMessage(chatId, role, content) {
        const chat = await AIChat.findByIdAndUpdate(
            chatId,
            {
                $push: {
                    messages: { role, content, timestamp: new Date() },
                },
            },
            { new: true },
        );

        // Cập nhật title nếu là message đầu tiên của user
        if (role === 'user' && chat.messages.filter((m) => m.role === 'user').length === 1) {
            chat.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
            await chat.save();
        }

        return chat;
    }

    // Lấy lịch sử chat của user
    async getChatHistory(userId) {
        const chats = await AIChat.find({ userId })
            .sort({ updatedAt: -1 })
            .select('title messages createdAt updatedAt isActive')
            .limit(20);

        return chats.map((chat) => ({
            _id: chat._id,
            title: chat.title,
            lastMessage: chat.messages[chat.messages.length - 1]?.content || '',
            messageCount: chat.messages.length,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            isActive: chat.isActive,
        }));
    }

    // Lấy chi tiết 1 chat
    async getChatById(chatId, userId) {
        const chat = await AIChat.findOne({ _id: chatId, userId });
        return chat;
    }

    // Tạo chat mới
    async createNewChat(userId) {
        // Đánh dấu tất cả chat cũ là inactive
        await AIChat.updateMany({ userId }, { isActive: false });

        // Tạo chat mới
        const chat = await AIChat.create({
            userId,
            messages: [
                {
                    role: 'assistant',
                    content: 'Xin chào! 👋 Bạn cần hỗ trợ gì?',
                },
            ],
        });

        return chat;
    }

    // Xóa chat
    async deleteChat(chatId, userId) {
        const result = await AIChat.findOneAndDelete({ _id: chatId, userId });
        return result;
    }

    // Xóa tất cả chat của user
    async clearAllChats(userId) {
        const result = await AIChat.deleteMany({ userId });
        return result;
    }
}

module.exports = new AIChatService();
