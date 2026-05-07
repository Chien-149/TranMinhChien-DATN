import axiosInstance from '../api/axios';

// ---- Job Bookmark (Favourite) ----
export const requestToggleFavourite = (jobId) =>
    axiosInstance.post('/api/favourite/create', { jobId }).then((r) => r.data);

export const requestGetMyFavourites = () =>
    axiosInstance.get('/api/favourite/get-favourite-by-user-id').then((r) => r.data);

export const requestRemoveFavourite = (jobId) =>
    axiosInstance.post('/api/favourite/create', { jobId }).then((r) => r.data); // same toggle

// ---- Company Follow ----
export const requestToggleFollow = (companyId) =>
    axiosInstance.post('/api/company-follow/toggle', { companyId }).then((r) => r.data);

export const requestCheckFollow = (companyId) =>
    axiosInstance.get(`/api/company-follow/check/${companyId}`).then((r) => r.data);

export const requestGetFollowedCompanies = () =>
    axiosInstance.get('/api/company-follow/following').then((r) => r.data);

export const requestGetFollowerCount = (companyId) =>
    axiosInstance.get(`/api/company-follow/count/${companyId}`).then((r) => r.data);
