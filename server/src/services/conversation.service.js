const { BadRequestError } = require('../core/error.response');
const Conversation = require('../models/conversation.model');
const User = require('../models/users.model');
const Company = require('../models/company.model');
const Message = require('../models/message.model');

const socketService = require('../utils/socket.service');

class ConversationService {
    // Tạo conversation giữa user và company
    async createConversation(userId, companyId) {
        // Tìm xem đã tồn tại conversation giữa user và company chưa
        let conversation = await Conversation.findOne({
            $and: [{ 'members.memberId': userId }, { 'members.memberId': companyId }],
        });

        // Nếu không có thì tạo mới
        if (!conversation) {
            conversation = await Conversation.create({
                members: [
                    { memberId: userId, memberType: 'user' },
                    { memberId: companyId, memberType: 'company' },
                ],
            });

            // Populate members after creation
            conversation = await this.populateConversation(conversation);

            // Emit new conversation to both user and company
            socketService.emitNewConversation(userId.toString(), 'new_conversation', conversation);
            socketService.emitNewConversation(companyId.toString(), 'new_conversation', conversation);
        }

        return conversation;
    }

    // Helper function để populate conversation members
    async populateConversation(conversation) {
        const populatedMembers = [];

        for (const member of conversation.members) {
            let memberData = null;
            if (member.memberType === 'user') {
                memberData = await User.findById(member.memberId).select('fullName avatar isOnline _id');
            } else if (member.memberType === 'company') {
                memberData = await Company.findById(member.memberId).select('companyName companyLogo _id userId');
            }

            populatedMembers.push({
                ...member.toObject(),
                memberData,
            });
        }

        conversation._doc.members = populatedMembers;
        return conversation;
    }

    // Lấy danh sách conversations của user hoặc company
    async getConversationsByUser(userId, userType = 'user') {
        const conversations = await Conversation.find({
            'members.memberId': userId,
        })
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        // Populate members và đếm unread cho mỗi conversation
        for (const conversation of conversations) {
            await this.populateConversation(conversation);

            // Đếm số tin nhắn chưa đọc
            const unreadCount = await Message.countDocuments({
                conversation: conversation._id,
                isRead: false,
                sender: { $ne: userId },
            });
            conversation._doc.unreadCount = unreadCount;
        }

        return conversations;
    }

    // Lấy conversation theo ID
    async getConversationById(conversationId) {
        const conversation = await Conversation.findById(conversationId).populate('lastMessage');
        if (!conversation) {
            throw new BadRequestError('Conversation not found');
        }
        await this.populateConversation(conversation);
        return conversation;
    }
}

module.exports = new ConversationService();
