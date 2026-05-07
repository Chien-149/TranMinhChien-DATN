import axiosInstance from './axios';

export const authAPI = {
    register: (data) => axiosInstance.post('/api/users/register', data),
    login: (data) => axiosInstance.post('/api/users/login', data),
    loginGoogle: (token) => axiosInstance.post('/api/users/login-google', { token }),
    logout: () => axiosInstance.post('/api/users/logout'),
    getMe: () => axiosInstance.get('/api/users/auth'),
    forgotPassword: (email) => axiosInstance.post('/api/users/forgot-password', { email }),
    resetPassword: (data) => axiosInstance.post('/api/users/reset-password', data),
    updateProfile: (data) => axiosInstance.put('/api/users/update', data),
    uploadAvatar: (formData) =>
        axiosInstance.post('/api/users/upload-avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};
