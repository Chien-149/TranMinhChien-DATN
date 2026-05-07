import axiosInstance from './axios';

export const companyAPI = {
    getAll: (params) => axiosInstance.get('/api/company/list', { params }),
    getById: (id) => axiosInstance.get(`/api/company/${id}`),
    // Employer
    getMyCompany: () => axiosInstance.get('/api/company/me'),
    updateCompany: (data) => axiosInstance.put('/api/company/me', data),
    uploadLogo: (formData) =>
        axiosInstance.put('/api/company/me/logo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    uploadCover: (data) => axiosInstance.put('/api/company/me/cover', data),
    getDashboard: (params) => axiosInstance.get('/api/company/dashboard', { params }),
    create: (formData) =>
        axiosInstance.post('/api/company/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    // Jobs
    getMyJobs: (params = {}) => axiosInstance.get('/api/jobs', { params }),
    createJob: (data) => axiosInstance.post('/api/jobs', data),
    updateJob: (id, data) => axiosInstance.put(`/api/jobs/${id}`, data),
    deleteJob: (id) => axiosInstance.delete(`/api/jobs/${id}`),
    toggleJobStatus: (id) => axiosInstance.patch(`/api/jobs/${id}/toggle-status`),

    // Packages
    getPackages: () => axiosInstance.get('/api/packages/list'),
    boostJob: (data) => axiosInstance.post('/api/packages/up-to-job', data),

    // Wallet
    getWallet: () => axiosInstance.get('/api/wallet'),
    getTransactions: (params = {}) => axiosInstance.get('/api/packages/transaction', { params }),
    getTopUpPackages: () => axiosInstance.get('/api/wallet/topup-packages'),
    createTopUp: (data) => axiosInstance.post('/api/packages/payment', data),
    cancelTopUp: (id) => axiosInstance.delete(`/api/wallet/topup/${id}`),
};
