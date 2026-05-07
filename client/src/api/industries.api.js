import axiosInstance from './axios';

export const industriesAPI = {
    getAll: () => axiosInstance.get('/api/industries/list'),
};
