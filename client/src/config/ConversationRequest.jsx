import { request } from './request';
import { apiClient } from './axiosClient';

const apiConversation = '/api/conversation';

export const requestCreateConversation = async (data) => {
    const res = await apiClient.post(`${apiConversation}/create`, data);
    return res.data;
};

export const requestGetAllConversation = async () => {
    const res = await apiClient.get(`${apiConversation}/list`);
    return res.data;
};
