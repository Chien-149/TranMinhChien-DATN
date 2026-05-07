import axiosInstance from './axios';

export const adminAPI = {
    // Dashboard
    getStats: () => axiosInstance.get('/api/admin/stats'),

    // Users
    getAllUsers: (params = {}) => axiosInstance.get('/api/users/admin/users', { params }),
    updateUser: (id, data) => axiosInstance.put(`/api/users/admin/users/${id}`, data),
    deleteUser: (id) => axiosInstance.delete(`/api/users/admin/users/${id}`),

    // Companies
    getAllCompanies: (params = {}) => axiosInstance.get('/api/company/list', { params }),
    updateCompanyStatus: (id, status) => axiosInstance.put(`/api/company/update/${id}`, { status }),

    // Jobs
    getAllJobs: (params = {}) => axiosInstance.get('/api/jobs/admin', { params }),
    updateJobStatus: (id, status) => axiosInstance.put(`/api/jobs/update/${id}`, { status }),

    // Industries
    getAllIndustries: () => axiosInstance.get('/api/industries/list'),
    createIndustry: (formData) =>
        axiosInstance.post('/api/industries/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    // Packages (gói dịch vụ)
    getAllPackages: () => axiosInstance.get('/api/packages/list'),
    createPackage: (data) => axiosInstance.post('/api/packages/create', data),

    // Blog
    getAllBlogs: () => axiosInstance.get('/api/blog/get-all'),
    createBlog: (data) => axiosInstance.post('/api/blog/create', data),
    updateBlog: (data) => axiosInstance.post('/api/blog/update', data),
    deleteBlog: (id) => axiosInstance.post('/api/blog/delete', { id }),
    uploadBlogImage: (formData) =>
        axiosInstance.post('/api/blog/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};
