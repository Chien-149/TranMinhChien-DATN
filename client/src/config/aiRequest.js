import axiosInstance from '../api/axios';

export const requestReviewCV = async (cvText) => {
    const res = await axiosInstance.post('/api/ai/review-cv', { cvText });
    return res.data;
};

export const requestRecommendJobs = async (cvText) => {
    const res = await axiosInstance.post('/api/ai/recommend-jobs', { cvText });
    return res.data;
};
