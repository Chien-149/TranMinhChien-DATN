import React, { useEffect, useState } from 'react';
import { Card, Button, Empty, Spin, Modal, Dropdown, Tag, Tooltip } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Plus,
    FileText,
    Download,
    Trash2,
    Copy,
    Star,
    MoreVertical,
    Edit,
    Eye,
    Calendar,
    User,
    Briefcase,
    Sparkles,
} from 'lucide-react';
import useCVApi from './hooks/useCVApi';
import { getTemplate } from './templates';
import Header from '../../components/layout/Header';

export default function MyCVs() {
    const navigate = useNavigate();
    const { cvList, loading, fetchAllCVs, deleteCV, cloneCV, setDefaultCV, exportPDF } = useCVApi();
    const { pathname } = useLocation();

    useEffect(() => {
        fetchAllCVs();
    }, [fetchAllCVs]);

    const handleDelete = (cvId, cvName) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc muốn xóa CV "${cvName}"?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: () => deleteCV(cvId),
        });
    };

    const handleExportPDF = async (cv) => {
        const filename = `cv-${cv.profile?.fullName?.replace(/\s+/g, '-') || cv.name}.pdf`;
        await exportPDF(cv._id, cv.template, filename);
    };

    const getMenuItems = (cv) => [
        {
            key: 'preview',
            icon: <Eye size={14} />,
            label: 'Xem trước',
            onClick: () => navigate(`/cv/preview/${cv._id}`),
        },
        {
            key: 'edit',
            icon: <Edit size={14} />,
            label: 'Chỉnh sửa',
            onClick: () => navigate(`/cv/edit/${cv._id}`),
        },
        {
            key: 'export',
            icon: <Download size={14} />,
            label: 'Xuất PDF',
            onClick: () => handleExportPDF(cv),
        },
        {
            key: 'clone',
            icon: <Copy size={14} />,
            label: 'Sao chép',
            onClick: () => cloneCV(cv._id),
        },
        {
            key: 'default',
            icon: <Star size={14} />,
            label: 'Đặt mặc định',
            onClick: () => setDefaultCV(cv._id),
            disabled: cv.isDefault,
        },
        { type: 'divider' },
        {
            key: 'delete',
            icon: <Trash2 size={14} />,
            label: 'Xóa',
            danger: true,
            onClick: () => handleDelete(cv._id, cv.name),
        },
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getAvatarUrl = (cv) => {
        if (cv.profile?.avatar) {
            if (cv.profile.avatar.startsWith('data:') || cv.profile.avatar.startsWith('blob:') || cv.profile.avatar.startsWith('http')) {
                return cv.profile.avatar;
            }
            return `${import.meta.env.VITE_API_URL}/${cv.profile.avatar.replace(/^\//, '')}`;
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50">
            {pathname === '/my-cvs' && <Header />}

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                            CV của tôi
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Quản lý và tạo CV chuyên nghiệp để chinh phục nhà tuyển dụng
                        </p>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<Plus size={18} />}
                        onClick={() => navigate('/cv')}
                        className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-500 border-none shadow-lg shadow-sky-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                        Tạo CV mới
                    </Button>
                </div>

                {/* Stats */}
                {cvList.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                                    <FileText size={20} className="text-sky-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{cvList.length}</p>
                                    <p className="text-xs text-gray-500">Tổng CV</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Star size={20} className="text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {cvList.filter((cv) => cv.isDefault).length}
                                    </p>
                                    <p className="text-xs text-gray-500">CV mặc định</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 col-span-2 md:col-span-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <Sparkles size={20} className="text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Mẹo: CV tốt = Cơ hội tốt!</p>
                                    <p className="text-xs text-gray-500">
                                        Luôn cập nhật CV của bạn để thu hút nhà tuyển dụng
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CV Grid */}
                <Spin spinning={loading}>
                    {cvList.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16">
                            <Empty
                                image={
                                    <div className="w-24 h-24 bg-gradient-to-br from-sky-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText size={48} className="text-sky-400" />
                                    </div>
                                }
                                description={
                                    <div className="text-center">
                                        <p className="text-gray-600 text-lg mb-2">Bạn chưa có CV nào</p>
                                        <p className="text-gray-400 mb-6">
                                            Hãy tạo CV đầu tiên để bắt đầu hành trình tìm việc!
                                        </p>
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<Plus size={18} />}
                                            onClick={() => navigate('/cv')}
                                            className="bg-gradient-to-r from-sky-500 to-indigo-500 border-none"
                                        >
                                            Tạo CV ngay
                                        </Button>
                                    </div>
                                }
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cvList.map((cv) => {
                                const template = getTemplate(cv.template);
                                const avatarUrl = getAvatarUrl(cv);

                                return (
                                    <div
                                        key={cv._id}
                                        className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-sky-200 hover:-translate-y-1 transition-all duration-300"
                                    >
                                        {/* Header with gradient */}
                                        <div
                                            className="h-28 relative overflow-hidden"
                                            style={{
                                                background: `linear-gradient(135deg, ${template.primaryColor} 0%, ${template.primaryColor}dd 50%, ${template.primaryColor}99 100%)`,
                                            }}
                                        >
                                            {/* Decorative circles */}
                                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
                                            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full" />

                                            {/* Template badge */}
                                            <div className="absolute top-3 left-3">
                                                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                                                    {template.name}
                                                </span>
                                            </div>

                                            {/* Default badge */}
                                            {cv.isDefault && (
                                                <div className="absolute top-3 left-20">
                                                    <Tag color="gold" className="flex items-center gap-1 m-0">
                                                        <Star size={10} fill="currentColor" /> Mặc định
                                                    </Tag>
                                                </div>
                                            )}

                                            {/* Avatar */}
                                        </div>

                                        {/* Content */}
                                        <div className=" px-4 pb-4">
                                            <div className="w-20 h-20 rounded-xl border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                                                {avatarUrl ? (
                                                    <img
                                                        src={avatarUrl}
                                                        alt="avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                                        <User size={28} className="text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-lg text-gray-800 truncate">
                                                {cv.name || 'CV chưa đặt tên'}
                                            </h3>

                                            <div className="mt-2 space-y-1">
                                                <p className="text-sm text-gray-600 flex items-center gap-2 truncate">
                                                    <User size={14} className="text-gray-400 flex-shrink-0" />
                                                    {cv.profile?.fullName || 'Chưa có tên'}
                                                </p>
                                                {cv.profile?.role && (
                                                    <p className="text-sm text-gray-500 flex items-center gap-2 truncate">
                                                        <Briefcase size={14} className="text-gray-400 flex-shrink-0" />
                                                        {cv.profile.role}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 flex items-center gap-2">
                                                    <Calendar size={12} className="flex-shrink-0" />
                                                    Cập nhật: {formatDate(cv.updatedAt)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 mt-4">
                                                <Button
                                                    type="primary"
                                                    icon={<Edit size={14} />}
                                                    onClick={() => navigate(`/cv/edit/${cv._id}`)}
                                                    className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 border-none"
                                                >
                                                    Chỉnh sửa
                                                </Button>
                                                <Tooltip title="Xem trước">
                                                    <Button
                                                        icon={<Eye size={14} />}
                                                        onClick={() => navigate(`/cv/preview/${cv._id}`)}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="Xuất PDF">
                                                    <Button
                                                        icon={<Download size={14} />}
                                                        onClick={() => handleExportPDF(cv)}
                                                        className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400"
                                                    />
                                                </Tooltip>
                                                <Tooltip title="Xóa">
                                                    <Button
                                                        icon={<Trash2 size={14} />}
                                                        onClick={() => handleDelete(cv._id, cv.name)}
                                                        danger
                                                    />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add new CV card */}
                            <div
                                onClick={() => navigate('/cv')}
                                className="group bg-white rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden hover:border-sky-400 hover:bg-sky-50/50 transition-all duration-300 cursor-pointer min-h-[280px] flex items-center justify-center"
                            >
                                <div className="text-center p-6">
                                    <div className="w-16 h-16 bg-gray-100 group-hover:bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                                        <Plus
                                            size={28}
                                            className="text-gray-400 group-hover:text-sky-500 transition-colors"
                                        />
                                    </div>
                                    <p className="font-medium text-gray-600 group-hover:text-sky-600 transition-colors">
                                        Tạo CV mới
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">Bắt đầu với mẫu CV đẹp</p>
                                </div>
                            </div>
                        </div>
                    )}
                </Spin>
            </div>
        </div>
    );
}
