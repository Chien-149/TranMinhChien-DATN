import axiosInstance from '../api/axios';

export const requestGetNotifications = (params = {}) =>
    axiosInstance.get('/api/notifications', { params }).then((r) => r.data);

export const requestMarkAsRead = (notifId) =>
    axiosInstance.patch(`/api/notifications/${notifId}/read`).then((r) => r.data);

export const requestMarkAllAsRead = () =>
    axiosInstance.patch('/api/notifications/read-all').then((r) => r.data);

export const requestDeleteNotification = (notifId) =>
    axiosInstance.delete(`/api/notifications/${notifId}`).then((r) => r.data);

export const requestClearAllNotifications = () =>
    axiosInstance.delete('/api/notifications').then((r) => r.data);

export const requestMarkCVViewed = (applicationId) =>
    axiosInstance.post(`/api/applications/${applicationId}/viewed`).then((r) => r.data);
