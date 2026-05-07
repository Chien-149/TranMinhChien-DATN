import { useState, useCallback } from 'react';
import { message } from 'antd';
import {
    requestGetAllCVs,
    requestGetCVById,
    requestCreateCV,
    requestUpdateCV,
    requestDeleteCV,
    requestCloneCV,
    requestSetDefaultCV,
    requestExportPDFById,
    downloadPDFBlob,
} from '../../../config/cvRequest';

/**
 * Hook để quản lý CV từ backend (cho user đã đăng nhập)
 */
export function useCVApi() {
    const [cvList, setCvList] = useState([]);
    const [currentCV, setCurrentCV] = useState(null);
    const [loading, setLoading] = useState(false);

    // Lấy tất cả CV
    const fetchAllCVs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await requestGetAllCVs();
            setCvList(res.metadata || []);
            return res.metadata;
        } catch (error) {
            console.error('Fetch CVs failed:', error);
            message.error('Không thể tải danh sách CV');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Lấy CV theo ID
    const fetchCVById = useCallback(async (cvId) => {
        setLoading(true);
        try {
            const res = await requestGetCVById(cvId);
            setCurrentCV(res.metadata);
            return res.metadata;
        } catch (error) {
            console.error('Fetch CV failed:', error);
            message.error('Không thể tải CV');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Tạo CV mới
    const createCV = useCallback(
        async (cvData) => {
            setLoading(true);
            try {
                const res = await requestCreateCV(cvData);
                message.success('Đã tạo CV mới');
                await fetchAllCVs(); // Refresh list
                return res.metadata;
            } catch (error) {
                console.error('Create CV failed:', error);
                message.error('Không thể tạo CV');
                return null;
            } finally {
                setLoading(false);
            }
        },
        [fetchAllCVs],
    );

    // Cập nhật CV
    const updateCV = useCallback(async (cvId, cvData) => {
        try {
            const res = await requestUpdateCV(cvId, cvData);
            message.success('Đã lưu CV');
            return res.metadata;
        } catch (error) {
            console.error('Update CV failed:', error);
            message.error('Không thể lưu CV');
            return null;
        }
    }, []);

    // Xóa CV
    const deleteCV = useCallback(
        async (cvId) => {
            setLoading(true);
            try {
                await requestDeleteCV(cvId);
                message.success('Đã xóa CV');
                await fetchAllCVs(); // Refresh list
                return true;
            } catch (error) {
                console.error('Delete CV failed:', error);
                message.error('Không thể xóa CV');
                return false;
            } finally {
                setLoading(false);
            }
        },
        [fetchAllCVs],
    );

    // Clone CV
    const cloneCV = useCallback(
        async (cvId) => {
            setLoading(true);
            try {
                const res = await requestCloneCV(cvId);
                message.success('Đã sao chép CV');
                await fetchAllCVs(); // Refresh list
                return res.metadata;
            } catch (error) {
                console.error('Clone CV failed:', error);
                message.error('Không thể sao chép CV');
                return null;
            } finally {
                setLoading(false);
            }
        },
        [fetchAllCVs],
    );

    // Set CV mặc định
    const setDefaultCV = useCallback(
        async (cvId) => {
            try {
                const res = await requestSetDefaultCV(cvId);
                message.success('Đã đặt làm CV mặc định');
                await fetchAllCVs(); // Refresh list
                return res.metadata;
            } catch (error) {
                console.error('Set default CV failed:', error);
                message.error('Không thể đặt CV mặc định');
                return null;
            }
        },
        [fetchAllCVs],
    );

    // Xuất PDF
    const exportPDF = useCallback(async (cvId, template, filename) => {
        setLoading(true);
        try {
            const blob = await requestExportPDFById(cvId, template);
            downloadPDFBlob(blob, filename || 'cv.pdf');
            message.success('Đã xuất PDF thành công');
            return true;
        } catch (error) {
            console.error('Export PDF failed:', error);
            message.error('Không thể xuất PDF');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        cvList,
        currentCV,
        loading,
        fetchAllCVs,
        fetchCVById,
        createCV,
        updateCV,
        deleteCV,
        cloneCV,
        setDefaultCV,
        exportPDF,
        setCurrentCV,
    };
}

export default useCVApi;
