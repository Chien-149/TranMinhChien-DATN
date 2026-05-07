import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button, Tooltip, Dropdown, message, Modal, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Download,
    RotateCcw,
    FileJson,
    Upload,
    ZoomIn,
    ZoomOut,
    Settings,
    ChevronLeft,
    ChevronRight,
    Save,
    ArrowLeft,
} from 'lucide-react';
import Cookies from 'js-cookie';

import useCVData from './hooks/useCVData';
import useCVApi from './hooks/useCVApi';
import CVForm from './components/CVForm';
import TemplateSelector from './components/TemplateSelector';
import AIAssistantPanel from './components/AIAssistantPanel';
import { getTemplate } from './templates';
import { requestExportPDFDirect, downloadPDFBlob } from '../../config/cvRequest';

export default function CVBuilder() {
    const { cvId } = useParams();
    const navigate = useNavigate();
    const isLoggedIn = Cookies.get('logged') === '1';
    const isEditMode = !!cvId;

    const {
        cv,
        setCv,
        selectedTemplate,
        setSelectedTemplate,
        updateField,
        addItem,
        updateItem,
        removeItem,
        resetCV,
        importCV,
        exportCV,
    } = useCVData();

    const { fetchCVById, createCV, updateCV, loading: apiLoading } = useCVApi();

    const previewRef = useRef(null);
    const fileInputRef = useRef(null);
    const [zoom, setZoom] = useState(0.7);
    const [exporting, setExporting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Load CV from backend if editing
    useEffect(() => {
        if (isEditMode && isLoggedIn) {
            fetchCVById(cvId).then((data) => {
                if (data) {
                    setCv(data);
                    setSelectedTemplate(data.template || 'modern');
                }
            });
        }
    }, [cvId, isEditMode, isLoggedIn]);

    // Save CV to backend
    const handleSaveCV = useCallback(async () => {
        if (!isLoggedIn) {
            message.warning('Vui lòng đăng nhập để lưu CV');
            return;
        }

        setSaving(true);
        try {
            // Loại bỏ _id và các trường MongoDB khỏi data
            const { _id, createdAt, updatedAt, __v, userId, ...cleanData } = cv;

            let avatarFile = null;
            if (cleanData.profile?.avatarFile) {
                avatarFile = cleanData.profile.avatarFile;
                delete cleanData.profile.avatarFile;
                // Đảm bảo không gửi object URL lên database
                if (cleanData.profile.avatar && cleanData.profile.avatar.startsWith('blob:')) {
                    delete cleanData.profile.avatar;
                }
            }

            const cvData = { ...cleanData, template: selectedTemplate };

            let finalCvId = cvId;

            if (isEditMode) {
                await updateCV(cvId, cvData);
            } else {
                const newCV = await createCV(cvData);
                if (newCV?._id) {
                    finalCvId = newCV._id;
                }
            }

            // Nếu có avatarFile, tiến hành upload riêng cho CV này
            if (finalCvId && avatarFile) {
                try {
                    const { requestUploadCVAvatar } = await import('../../config/cvRequest');
                    await requestUploadCVAvatar(finalCvId, avatarFile);
                } catch (err) {
                    console.error('Upload avatar failed after save:', err);
                }
            }

            if (!isEditMode && finalCvId) {
                navigate(`/cv/edit/${finalCvId}`, { replace: true });
            }
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    }, [cv, selectedTemplate, isEditMode, cvId, isLoggedIn, updateCV, createCV, navigate]);

    // Get current template component
    const TemplateComponent = getTemplate(selectedTemplate).component;

    // Export to PDF via Backend API
    const exportPDF = async () => {
        setExporting(true);

        try {
            const blob = await requestExportPDFDirect(cv, selectedTemplate);
            const filename = `cv-${cv.profile.fullName?.replace(/\s+/g, '-') || 'export'}.pdf`;
            downloadPDFBlob(blob, filename);
            message.success('Đã xuất PDF thành công!');
        } catch (error) {
            console.error('Export failed:', error);
            message.error('Xuất PDF thất bại! Vui lòng thử lại.');
        } finally {
            setExporting(false);
        }
    };

    // Export JSON
    const handleExportJSON = () => {
        const dataStr = exportCV();
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cv-${cv.profile.fullName.replace(/\s+/g, '-')}.json`;
        link.click();
        URL.revokeObjectURL(url);
        message.success('Đã xuất file JSON!');
    };

    // Import JSON
    const handleImportJSON = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                importCV(event.target.result);
                message.success('Đã nhập dữ liệu CV thành công!');
            } catch {
                message.error('File không hợp lệ!');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    // Reset confirmation
    const handleReset = () => {
        Modal.confirm({
            title: 'Xác nhận đặt lại',
            content: 'Bạn có chắc muốn xóa tất cả dữ liệu và bắt đầu lại?',
            okText: 'Đặt lại',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: () => {
                resetCV();
                message.success('Đã đặt lại CV!');
            },
        });
    };

    // More actions dropdown
    const moreActions = [
        {
            key: 'export-json',
            icon: <FileJson size={14} />,
            label: 'Xuất JSON',
            onClick: handleExportJSON,
        },
        {
            key: 'import-json',
            icon: <Upload size={14} />,
            label: 'Nhập JSON',
            onClick: () => fileInputRef.current?.click(),
        },
        {
            key: 'reset',
            icon: <RotateCcw size={14} />,
            label: 'Đặt lại',
            danger: true,
            onClick: handleReset,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isLoggedIn && (
                            <Tooltip title="Quay lại danh sách CV">
                                <Button
                                    type="text"
                                    icon={<ArrowLeft size={18} />}
                                    onClick={() => navigate('/my-cvs')}
                                />
                            </Tooltip>
                        )}
                        <h1 className="text-xl font-bold text-sky-700">{isEditMode ? 'Chỉnh sửa CV' : 'Tạo CV mới'}</h1>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            {getTemplate(selectedTemplate).name}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Zoom controls */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
                            <Tooltip title="Thu nhỏ">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<ZoomOut size={14} />}
                                    onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
                                />
                            </Tooltip>
                            <span className="text-xs text-gray-600 min-w-[40px] text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <Tooltip title="Phóng to">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<ZoomIn size={14} />}
                                    onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
                                />
                            </Tooltip>
                        </div>

                        {/* Save to Backend */}
                        {isLoggedIn && (
                            <Button
                                icon={<Save size={16} />}
                                onClick={handleSaveCV}
                                loading={saving}
                                className="flex items-center gap-2"
                            >
                                {isEditMode ? 'Lưu' : 'Lưu CV'}
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-57px)]">
                {/* Left Sidebar - Form */}
                <aside
                    className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
                        sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-[420px]'
                    }`}
                >
                    <div className="p-4 border-b border-gray-100">
                        <TemplateSelector selected={selectedTemplate} onSelect={setSelectedTemplate} />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {/* AI Assistant Panel - Đặt ở đầu để dễ nhìn */}
                        <AIAssistantPanel cv={cv} />

                        {/* CV Form */}
                        <CVForm
                            cv={cv}
                            updateField={updateField}
                            addItem={addItem}
                            updateItem={updateItem}
                            removeItem={removeItem}
                            cvId={cvId}
                            isEditMode={isEditMode}
                        />
                    </div>
                </aside>

                {/* Toggle Sidebar Button */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-l-0 border-gray-200 rounded-r-lg px-1 py-3 hover:bg-gray-50 transition-all"
                    style={{ left: sidebarCollapsed ? 0 : 420 }}
                >
                    {sidebarCollapsed ? (
                        <ChevronRight size={16} className="text-gray-500" />
                    ) : (
                        <ChevronLeft size={16} className="text-gray-500" />
                    )}
                </button>

                {/* Preview Area */}
                <main className="flex-1 overflow-auto p-8 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2220%22%20height%3D%2220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2020%200%20L%200%200%200%2020%22%20fill%3D%22none%22%20stroke%3D%22%23e5e7eb%22%20stroke-width%3D%220.5%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')]">
                    <div className="flex justify-center">
                        <div
                            className="transition-transform duration-200 origin-top"
                            style={{ transform: `scale(${zoom})` }}
                        >
                            <div ref={previewRef} className="shadow-2xl" style={{ width: '210mm' }}>
                                <Spin spinning={exporting} tip="Đang xuất PDF...">
                                    <TemplateComponent cv={cv} />
                                </Spin>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Hidden file input for JSON import */}
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />

            {/* Custom styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                .cv-form-collapse .ant-collapse-header {
                    padding: 12px 0 !important;
                    border-radius: 8px !important;
                }
                .cv-form-collapse .ant-collapse-content-box {
                    padding: 0 0 16px 0 !important;
                }
            `}</style>
        </div>
    );
}
