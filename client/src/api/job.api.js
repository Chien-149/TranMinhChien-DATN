import axiosInstance from './axios';

export const jobAPI = {
    search: (params) => axiosInstance.get('/api/jobs/search', { params }),
    getList: () => axiosInstance.get('/api/jobs/list'),
    getById: (id, incrementView = false) =>
        axiosInstance.get(`/api/jobs/detail/${id}`, { params: { incrementView } }),
    getLocations: () => axiosInstance.get('/api/jobs/locations'),
    getDashboardStats: () => axiosInstance.get('/api/jobs/dashboard-stats'),
    // Employer
    getCompanyJobs: (params) => axiosInstance.get('/api/jobs', { params }),
    createJob: (data) => axiosInstance.post('/api/jobs', data),
    updateJob: (id, data) => axiosInstance.put(`/api/jobs/${id}`, data),
    deleteJob: (id) => axiosInstance.delete(`/api/jobs/${id}`),
    toggleStatus: (id) => axiosInstance.patch(`/api/jobs/${id}/toggle-status`),
    duplicateJob: (id) => axiosInstance.post(`/api/jobs/${id}/duplicate`),
    boostJob: (id, packageId) => axiosInstance.post(`/api/jobs/${id}/boost`, { packageId }),
};
