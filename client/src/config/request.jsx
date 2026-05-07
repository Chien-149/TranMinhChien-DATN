import axios from 'axios';

export const request = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    timeout: 60000, // 60 seconds for PDF generation
});
