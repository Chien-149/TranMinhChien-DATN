import { apiClient } from './axiosClient';

const apiMessage = '/api/message';

export const requestCreateMessage = async (data) => {
    const res = await apiClient.post(`${apiMessage}/create`, data);
    return res.data;
};

export const requestGetMessageByConversationId = async (conversationId) => {
    const res = await apiClient.get(`${apiMessage}/get/${conversationId}`);
    return res.data;
};

export const requestUpdateMessageIsRead = async (data) => {
    const res = await apiClient.post(`${apiMessage}/update-message-is-read`, data);
    return res.data;
};
