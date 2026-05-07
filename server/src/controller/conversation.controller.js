const ConversationService = require('../services/conversation.service');
const Company = require('../models/company.model');

const { OK } = require('../core/success.response');

class ConversationController {
    // User tạo conversation với Company
    async createConversation(req, res) {
        const { id } = req.user;
        const { _id: companyId } = req.body;

        const conversation = await ConversationService.createConversation(id, companyId);
        new OK({ message: 'success', metadata: conversation }).send(res);
    }

    // Lấy conversations cho user hoặc company
    async getConversationsByUser(req, res) {
        const { id } = req.user;

        // Kiểm tra xem user là company owner không
        const company = await Company.findOne({ userId: id });
        const checkId = company ? company._id : id;
        const userType = company ? 'company' : 'user';

        const conversation = await ConversationService.getConversationsByUser(checkId, userType);
        new OK({ message: 'success', metadata: conversation }).send(res);
    }

    async getConversationById(req, res) {
        const { conversationId } = req.params;
        const conversation = await ConversationService.getConversationById(conversationId);
        new OK({ message: 'success', metadata: conversation }).send(res);
    }
}

module.exports = new ConversationController();
