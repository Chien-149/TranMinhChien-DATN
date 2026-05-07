import { apiClient } from './axiosClient';

const aiApi = '/api/ai';

// Gợi ý việc làm phù hợp với CV
export const requestRecommendJobs = async (cvText) => {
    const res = await apiClient.post(`${aiApi}/recommend-jobs`, { cvText });
    return res.data;
};

// Review CV
export const requestReviewCV = async (cvText) => {
    const res = await apiClient.post(`${aiApi}/review-cv`, { cvText });
    return res.data;
};

// Chatbot AI (có lưu lịch sử nếu đăng nhập)
export const requestAIChat = async (message, chatId = null) => {
    const res = await apiClient.post(`${aiApi}/chat`, { message, chatId });
    return res.data;
};

// Lấy lịch sử chat
export const requestGetChatHistory = async () => {
    const res = await apiClient.get(`${aiApi}/chat/history`);
    return res.data;
};

// Lấy chi tiết 1 chat
export const requestGetChatById = async (chatId) => {
    const res = await apiClient.get(`${aiApi}/chat/${chatId}`);
    return res.data;
};

// Tạo chat mới
export const requestCreateNewChat = async () => {
    const res = await apiClient.post(`${aiApi}/chat/new`);
    return res.data;
};

// Xóa chat
export const requestDeleteChat = async (chatId) => {
    const res = await apiClient.delete(`${aiApi}/chat/${chatId}`);
    return res.data;
};

// Xóa tất cả lịch sử
export const requestClearAllChats = async () => {
    const res = await apiClient.delete(`${aiApi}/chat`);
    return res.data;
};

// Tạo Job Description
export const requestGenerateJD = async (jobInfo) => {
    const res = await apiClient.post(`${aiApi}/generate-jd`, jobInfo);
    return res.data;
};
