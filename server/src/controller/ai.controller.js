const { OK, CREATED } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');
const aiService = require('../services/ai.service');
const aiChatService = require('../services/aiChat.service');

class AIController {
    // Gợi ý việc làm phù hợp với CV
    async recommendJobs(req, res) {
        const { cvText } = req.body;

        if (!cvText || cvText.trim().length < 50) {
            throw new BadRequestError('Vui lòng nhập nội dung CV (ít nhất 50 ký tự)');
        }

        const result = await aiService.recommendJobs(cvText);

        return new OK({
            message: 'AI đã phân tích CV và gợi ý việc làm phù hợp',
            metadata: result,
        }).send(res);
    }

    // Review CV và gợi ý cải thiện
    async reviewCV(req, res) {
        const { cvText } = req.body;

        if (!cvText || cvText.trim().length < 50) {
            throw new BadRequestError('Vui lòng nhập nội dung CV (ít nhất 50 ký tự)');
        }

        const result = await aiService.reviewCV(cvText);

        return new OK({
            message: 'AI đã review CV của bạn',
            metadata: result,
        }).send(res);
    }

    // Chatbot tư vấn nghề nghiệp (có lưu lịch sử)
    async chat(req, res) {
        const { message, chatId } = req.body;
        const userId = req.user?.id;

        if (!message || message.trim().length === 0) {
            throw new BadRequestError('Vui lòng nhập tin nhắn');
        }

        // Nếu user đã đăng nhập, lưu lịch sử
        let chat = null;
        let history = [];

        if (userId) {
            // Lấy hoặc tạo chat session
            if (chatId) {
                chat = await aiChatService.getChatById(chatId, userId);
            }
            if (!chat) {
                chat = await aiChatService.getOrCreateChat(userId);
            }

            // Lấy history từ chat
            history = chat.messages.slice(-10).map((m) => ({
                role: m.role,
                content: m.content,
            }));

            // Thêm message của user
            await aiChatService.addMessage(chat._id, 'user', message);
        }

        // Gọi AI
        const response = await aiService.chat(message, history);

        // Lưu response của AI
        if (userId && chat) {
            await aiChatService.addMessage(chat._id, 'assistant', response);
        }

        return new OK({
            message: 'OK',
            metadata: {
                response,
                chatId: chat?._id,
            },
        }).send(res);
    }

    // Lấy lịch sử chat của user
    async getChatHistory(req, res) {
        const userId = req.user.id;
        const history = await aiChatService.getChatHistory(userId);

        return new OK({
            message: 'Lấy lịch sử chat thành công',
            metadata: history,
        }).send(res);
    }

    // Lấy chi tiết 1 chat
    async getChatById(req, res) {
        const userId = req.user.id;
        const { chatId } = req.params;

        const chat = await aiChatService.getChatById(chatId, userId);

        if (!chat) {
            throw new BadRequestError('Không tìm thấy cuộc trò chuyện');
        }

        return new OK({
            message: 'OK',
            metadata: chat,
        }).send(res);
    }

    // Tạo chat mới
    async createNewChat(req, res) {
        const userId = req.user.id;
        const chat = await aiChatService.createNewChat(userId);

        return new CREATED({
            message: 'Đã tạo cuộc trò chuyện mới',
            metadata: chat,
        }).send(res);
    }

    // Xóa chat
    async deleteChat(req, res) {
        const userId = req.user.id;
        const { chatId } = req.params;

        await aiChatService.deleteChat(chatId, userId);

        return new OK({
            message: 'Đã xóa cuộc trò chuyện',
        }).send(res);
    }

    // Xóa tất cả chat
    async clearAllChats(req, res) {
        const userId = req.user.id;
        await aiChatService.clearAllChats(userId);

        return new OK({
            message: 'Đã xóa tất cả lịch sử chat',
        }).send(res);
    }

    // Tạo Job Description
    async generateJD(req, res) {
        const { position, skills, salary, description } = req.body;

        if (!position || !skills) {
            throw new BadRequestError('Vui lòng nhập vị trí và kỹ năng yêu cầu');
        }

        const result = await aiService.generateJD({ position, skills, salary, description });

        return new OK({
            message: 'AI đã tạo Job Description',
            metadata: result,
        }).send(res);
    }
}

module.exports = new AIController();
