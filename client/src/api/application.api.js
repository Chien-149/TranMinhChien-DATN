import axiosInstance from './axios';

export const applicationAPI = {
    applyForJob: (formData) => {
        return axiosInstance.post('/api/applications/apply', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    getJobsByUser: () => {
        return axiosInstance.get('/api/applications/user');
    },
    // the rest will be implemented when needed by the employer dashboard
};
