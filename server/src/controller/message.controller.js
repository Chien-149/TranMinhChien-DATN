const { OK } = require('../core/success.response');
const Company = require('../models/company.model');
const MessageService = require('../services/message.service');

class MessageController {
    async createMessage(req, res) {
        const { id } = req.user;
        const { conversationId, content, senderType } = req.body;

        // Nếu senderType là company, lấy companyId từ user
        let senderId = id;
        let type = senderType || 'user';

        if (senderType === 'company') {
            const company = await Company.findOne({ userId: id });
            if (company) {
                senderId = company._id;
            }
        }

        const message = await MessageService.createMessage(conversationId, senderId, type, content);
        new OK({
            message: 'success',
            metadata: message,
        }).send(res);
    }

    async getMessagesByConversationId(req, res) {
        const { conversationId } = req.params;
        const { id } = req.user;

        // Kiểm tra xem user là company owner không
        const company = await Company.findOne({ userId: id });
        const checkId = company ? company._id : id;

        const messages = await MessageService.getMessagesByConversationId(conversationId, checkId);
        new OK({
            message: 'success',
            metadata: messages,
        }).send(res);
    }

    async updateMessageIsRead(req, res) {
        const { conversationId, sender } = req.body;
        const messages = await MessageService.updateMessageIsRead(conversationId, sender);
        new OK({ message: 'success', metadata: messages }).send(res);
    }
}

module.exports = new MessageController();
