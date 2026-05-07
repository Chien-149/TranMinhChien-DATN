const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const User = require('../models/users.model');
const Company = require('../models/company.model');

const socketService = require('../utils/socket.service');

class MessageService {
    async createMessage(conversationId, senderId, senderType, content) {
        // Tạo tin nhắn mới
        const message = new Message({
            conversation: conversationId,
            sender: senderId,
            senderType: senderType,
            content,
        });
        await message.save();

        // Cập nhật lastMessage của conversation
        await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id });

        // Populate sender dựa trên senderType
        await this.populateMessageSender(message);

        // Lấy conversation để emit socket cho người nhận
        const conversation = await Conversation.findById(conversationId);

        // Emit socket cho tất cả người nhận
        for (const member of conversation.members) {
            if (member.memberId.toString() !== senderId.toString()) {
                let receiverSocketId = null;

                if (member.memberType === 'user') {
                    // Nếu là user thì emit trực tiếp tới userId
                    receiverSocketId = member.memberId.toString();
                } else if (member.memberType === 'company') {
                    // Nếu là company thì tìm userId của company owner
                    const company = await Company.findById(member.memberId);
                    if (company && company.userId) {
                        receiverSocketId = company.userId.toString();
                    }
                }

                if (receiverSocketId) {
                    socketService.emitMessage(receiverSocketId, 'new_message', message);
                }
            }
        }

        return message;
    }

    // Helper để populate sender của message
    async populateMessageSender(message) {
        if (message.senderType === 'user') {
            const user = await User.findById(message.sender).select('fullName avatar email _id');
            message._doc.sender = user;
        } else if (message.senderType === 'company') {
            const company = await Company.findById(message.sender).select('companyName companyLogo _id');
            message._doc.sender = company;
        }
        return message;
    }

    async updateMessageIsRead(conversationId, senderId) {
        // Cập nhật tất cả tin nhắn chưa đọc từ sender thành đã đọc
        const result = await Message.updateMany(
            {
                conversation: conversationId,
                isRead: false,
                sender: senderId,
            },
            { isRead: true },
        );

        return { modifiedCount: result.modifiedCount };
    }

    async getMessagesByConversationId(conversationId, userId) {
        // Kiểm tra user có tham gia conversation không
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        // Kiểm tra userId có trong members không
        const isMember = conversation.members.some((m) => m.memberId.toString() === userId.toString());
        if (!isMember) {
            throw new Error('Access denied');
        }

        // Lấy tất cả message
        const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });

        // Populate sender cho mỗi message
        for (const message of messages) {
            await this.populateMessageSender(message);
        }

        return messages;
    }
}

module.exports = new MessageService();
