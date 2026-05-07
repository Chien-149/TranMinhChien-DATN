import axiosInstance from '../api/axios';

export const requestGetAllCVs = async () => {
    const res = await axiosInstance.get('/api/cv');
    return res.data;
};

export const requestGetCVById = async (id) => {
    const res = await axiosInstance.get(`/api/cv/${id}`);
    return res.data;
};

export const requestCreateCV = async (data) => {
    const res = await axiosInstance.post('/api/cv', data);
    return res.data;
};

export const requestUpdateCV = async (id, data) => {
    const res = await axiosInstance.put(`/api/cv/${id}`, data);
    return res.data;
};

export const requestDeleteCV = async (id) => {
    const res = await axiosInstance.delete(`/api/cv/${id}`);
    return res.data;
};

export const requestCloneCV = async (id) => {
    const res = await axiosInstance.post(`/api/cv/${id}/clone`);
    return res.data;
};

export const requestSetDefaultCV = async (id) => {
    const res = await axiosInstance.patch(`/api/cv/${id}/default`);
    return res.data;
};

export const requestExportPDFById = async (id, template) => {
    const res = await axiosInstance.get(`/api/cv/${id}/export-pdf?template=${template}`, {
        responseType: 'blob',
    });
    return res.data;
};

export const requestExportPDFDirect = async (cvData, template) => {
    // Attempting direct export by sending data
    const res = await axiosInstance.post(`/api/cv/export-pdf?template=${template}`, cvData, {
        responseType: 'blob',
    });
    return res.data;
};

export const requestUploadCVAvatar = async (id, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await axiosInstance.post(`/api/cv/${id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

export const downloadPDFBlob = (blob, filename) => {
    const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
