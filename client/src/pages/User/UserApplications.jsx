import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, ExternalLink, Calendar, Building2, FileDown, SearchX, StickyNote, DollarSign, MessageSquare } from 'lucide-react';
import { Tag, Modal, Empty, Spin, Input, Select, Button, message } from 'antd';
import dayjs from 'dayjs';
import axiosInstance from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { requestCreateConversation } from '../../config/ConversationRequest';

const SERVER_URL = 'http://localhost:3000';

const STATUS_CONFIG = {
    pending: { label: 'Chờ xem xét', color: 'orange' },
    reviewing: { label: 'Đang xem xét', color: 'blue' },
    interview: { label: 'Phỏng vấn', color: 'purple' },
    accepted: { label: 'Chấp nhận', color: 'green' },
    rejected: { label: 'Từ chối', color: 'red' },
};

const JOB_TYPE_LABEL = {
    'full-time': 'Toàn thời gian',
    'part-time': 'Bán thời gian',
    remote: 'Remote',
    internship: 'Thực tập',
    contract: 'Hợp đồng',
    freelance: 'Freelance',
};

export default function UserApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    const navigate = useNavigate();

    const handleChatWithEmployer = async (app, e) => {
        e.stopPropagation();
        if (!app?.companyId?._id) {
            message.error('Không tìm thấy thông tin công ty');
            return;
        }

        try {
            const res = await requestCreateConversation({ _id: app.companyId._id });
            if (res.metadata && res.metadata._id) {
                navigate(`/user/messages/${res.metadata._id}`);
            } else {
                message.error('Không thể tạo cuộc trò chuyện');
            }
        } catch (error) {
            console.error('Lỗi khi tạo conversation:', error);
            message.error('Có lỗi xảy ra khi bắt đầu cuộc trò chuyện');
        }
    };

    useEffect(() => {
        axiosInstance
            .get('/api/applications/user')
            .then((res) => setApplications(res.data?.metadata || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = applications.filter((app) => {
        const matchStatus = filterStatus === 'all' || app.status === filterStatus;
        const title = app.jobId?.title?.toLowerCase() || '';
        const company = app?.companyId?.name?.toLowerCase() || '';
        const keyword = searchKeyword.toLowerCase();
        const matchSearch = !keyword || title.includes(keyword) || company.includes(keyword);
        return matchStatus && matchSearch;
    });

    const logoUrl = (app) => {
        const logo = app?.companyId?.logo;
        if (!logo) return null;
        return logo.startsWith('http') ? logo : `${SERVER_URL}/uploads/${logo}`;
    };

    const cvUrl = (cvId) => {
        if (!cvId) return null;
        return `${SERVER_URL}/uploads/cv/${cvId}`;
    };

    const statsCount = (status) => applications.filter((a) => a.status === status).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Việc làm đã ứng tuyển</h1>
                <p className="text-slate-500 text-sm mt-1">Theo dõi trạng thái các đơn ứng tuyển của bạn</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                {[
                    { label: 'Tổng cộng', value: applications.length, color: 'bg-slate-50 text-slate-700' },
                    { label: 'Chờ xem xét', value: statsCount('pending'), color: 'bg-orange-50 text-orange-700' },
                    { label: 'Đang xem xét', value: statsCount('reviewing'), color: 'bg-blue-50 text-blue-700' },
                    { label: 'Phỏng vấn', value: statsCount('interview'), color: 'bg-purple-50 text-purple-700' },
                    { label: 'Chấp nhận', value: statsCount('accepted'), color: 'bg-green-50 text-green-700' },
                ].map((s) => (
                    <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <Input
                    allowClear
                    size="large"
                    placeholder="Tìm theo tên việc làm, công ty..."
                    prefix={<Briefcase size={15} className="text-slate-400" />}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="flex-1"
                />
                <Select
                    size="large"
                    value={filterStatus}
                    onChange={setFilterStatus}
                    className="min-w-[180px]"
                    options={[
                        { value: 'all', label: 'Tất cả trạng thái' },
                        ...Object.entries(STATUS_CONFIG).map(([v, { label }]) => ({ value: v, label })),
                    ]}
                />
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-16 flex justify-center">
                    <Empty
                        image={<SearchX size={56} className="text-slate-300 mx-auto" />}
                        description={
                            <span className="text-slate-400">
                                {applications.length === 0
                                    ? 'Bạn chưa ứng tuyển việc làm nào'
                                    : 'Không tìm thấy kết quả phù hợp'}
                            </span>
                        }
                    />
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((app) => {
                        const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                        const job = app.jobId || {};
                        const company = app.companyId || {};
                        return (
                            <div
                                key={app._id}
                                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => setSelected(app)}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Company logo */}
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden ring-1 ring-slate-200">
                                        {logoUrl(app) ? (
                                            <img src={logoUrl(app)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 size={20} className="text-slate-400" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 flex-wrap">
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-base leading-tight">
                                                    {job.title || '—'}
                                                </h3>
                                                <p className="text-indigo-600 text-sm font-medium mt-0.5">
                                                    {company.name || '—'}
                                                </p>
                                            </div>
                                            <Tag
                                                color={status.color}
                                                className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                                            >
                                                {status.label}
                                            </Tag>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                            {job.location && (
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <MapPin size={12} /> {job.location}
                                                </span>
                                            )}
                                            {job.type && (
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Briefcase size={12} /> {JOB_TYPE_LABEL[job.type] || job.type}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                <Clock size={12} /> Nộp {dayjs(app.createdAt).format('DD/MM/YYYY')}
                                            </span>
                                        </div>

                                        {/* Action buttons embedded in list item */}
                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                            <Button
                                                size="small"
                                                type="primary"
                                                ghost
                                                icon={<MessageSquare size={14} />}
                                                onClick={(e) => handleChatWithEmployer(app, e)}
                                                className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                                            >
                                                Trao đổi với NTD
                                            </Button>
                                        </div>

                                        {/* Interview notice */}
                                        {app.status === 'interview' && app.interview?.date && (
                                            <div className="mt-3 flex items-center gap-2 bg-purple-50 text-purple-700 text-xs px-3 py-2 rounded-xl font-medium w-fit">
                                                <Calendar size={13} />
                                                Phỏng vấn: {app.interview.date}
                                                {app.interview.time && ` lúc ${app.interview.time}`}
                                                {app.interview.location && ` — ${app.interview.location}`}
                                            </div>
                                        )}

                                        {/* Rejection notice */}
                                        {app.status === 'rejected' && app.rejection?.reason && (
                                            <div className="mt-3 bg-red-50 text-red-600 text-xs px-3 py-2 rounded-xl w-fit max-w-full">
                                                <span className="font-semibold">Lý do từ chối:</span>{' '}
                                                {app.rejection.reason}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detail Modal */}
            <Modal
                open={!!selected}
                onCancel={() => setSelected(null)}
                footer={null}
                centered
                width={580}
                title={
                    <div className="flex items-center gap-3 pr-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {logoUrl(selected) ? (
                                <img src={logoUrl(selected)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Building2 size={18} className="text-slate-400" />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-base leading-tight">{selected?.jobId?.title}</p>
                            <p className="text-indigo-500 text-xs font-medium">{selected?.companyId?.name}</p>
                        </div>
                    </div>
                }
            >
                {selected && (
                    <div className="space-y-4 pt-2">
                        {/* Status */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">Trạng thái</span>
                            <Tag color={STATUS_CONFIG[selected.status]?.color} className="text-sm font-semibold">
                                {STATUS_CONFIG[selected.status]?.label}
                            </Tag>
                        </div>

                        {/* Job info */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                            {selected.jobId?.location && (
                                <div className="flex items-center gap-2 text-slate-600">
                                    <MapPin size={14} className="text-slate-400" />
                                    {selected.jobId.location}
                                </div>
                            )}
                            {selected.jobId?.type && (
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Briefcase size={14} className="text-slate-400" />
                                    {JOB_TYPE_LABEL[selected.jobId.type] || selected.jobId.type}
                                </div>
                            )}
                            {(selected.jobId?.salaryMin || selected.jobId?.salaryMax) && (
                                <div className="flex items-center gap-2 text-slate-600">
                                    <DollarSign size={14} className="text-slate-400" />
                                    {selected.jobId.salaryMin && selected.jobId.salaryMax
                                        ? `${Number(selected.jobId.salaryMin).toLocaleString('vi-VN')} – ${Number(selected.jobId.salaryMax).toLocaleString('vi-VN')} đ`
                                        : 'Thỏa thuận'}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-slate-600">
                                <Clock size={14} className="text-slate-400" />
                                Nộp ngày {dayjs(selected.createdAt).format('DD/MM/YYYY HH:mm')}
                            </div>
                        </div>

                        {/* Cover letter */}
                        {selected.coverLetter && (
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                    Thư xin việc
                                </p>
                                <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 leading-relaxed whitespace-pre-line">
                                    {selected.coverLetter}
                                </p>
                            </div>
                        )}

                        {/* Interview info */}
                        {selected.status === 'interview' && selected.interview?.date && (
                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm">
                                <p className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                                    <Calendar size={15} /> Lịch phỏng vấn
                                </p>
                                <div className="space-y-1 text-purple-700 text-xs">
                                    {selected.interview.date && (
                                        <p className="flex items-center gap-1.5">
                                            <Calendar size={12} /> Ngày: <strong>{selected.interview.date}</strong>
                                        </p>
                                    )}
                                    {selected.interview.time && (
                                        <p className="flex items-center gap-1.5">
                                            <Clock size={12} /> Giờ: <strong>{selected.interview.time}</strong>
                                        </p>
                                    )}
                                    {selected.interview.location && (
                                        <p className="flex items-center gap-1.5">
                                            <MapPin size={12} /> Địa điểm: <strong>{selected.interview.location}</strong>
                                        </p>
                                    )}
                                    {selected.interview.notes && (
                                        <p className="flex items-center gap-1.5">
                                            <StickyNote size={12} /> Ghi chú: {selected.interview.notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Rejection */}
                        {selected.status === 'rejected' && selected.rejection?.reason && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
                                <p className="font-bold mb-1">Lý do từ chối</p>
                                <p>{selected.rejection.reason}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                            {selected.cvId && (
                                <a
                                    href={cvUrl(selected.cvId)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors"
                                >
                                    <FileDown size={16} />
                                    Xem CV
                                    <ExternalLink size={13} />
                                </a>
                            )}
                            <button
                                onClick={(e) => handleChatWithEmployer(selected, e)}
                                className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors"
                            >
                                <MessageSquare size={16} />
                                Trao đổi với NTD
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
