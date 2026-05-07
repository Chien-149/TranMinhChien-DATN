import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MapPin,
    Clock,
    Bookmark,
    BookmarkCheck,
    BadgeCheck,
    Zap,
    Briefcase,
    ArrowRight,
    Building2,
    DollarSign,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { jobAPI } from '../../api/job.api';
import { requestToggleFavourite, requestGetMyFavourites } from '../../config/bookmarkAndFollowRequest';
import { useAuth } from '../../store/authStore';
import { message } from 'antd';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const JOB_TYPE_LABELS = {
    'full-time': { label: 'Toàn thời gian', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    'part-time': { label: 'Bán thời gian', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    internship: { label: 'Thực tập', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    contract: { label: 'Hợp đồng', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    freelance: { label: 'Freelance', color: 'bg-purple-50 text-purple-700 border-purple-100' },
};

function formatSalary(min, max, negotiable) {
    if (negotiable) return 'Thỏa thuận';
    if (!min && !max) return 'Thỏa thuận';
    const fmt = (n) => {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} triệu`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
        return `${n}`;
    };
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `Từ ${fmt(min)}`;
    if (max) return `Đến ${fmt(max)}`;
    return 'Thỏa thuận';
}

function JobCard({ job, index, savedJobIds, onToggleSaved }) {
    const navigate = useNavigate();
    const company = job.companyId || {};
    const typeInfo = JOB_TYPE_LABELS[job.type] || {
        label: job.type,
        color: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    const isNew = dayjs().diff(dayjs(job.createdAt), 'day') <= 2;
    const isHot = job.isBoosted;
    const daysLeft = job.deadline ? dayjs(job.deadline).diff(dayjs(), 'day') : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            onClick={() => navigate(`/jobs/${job._id}`)}
            className="group relative bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-200"
        >
            {/* Boosted glow */}
            {isHot && <div className="absolute inset-0 rounded-2xl ring-2 ring-indigo-300/40 pointer-events-none" />}

            {/* Top row: Logo + Badge + Bookmark */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Company logo */}
                    <div className="w-12 h-12 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {company.companyLogo ? (
                            <img
                                src={
                                    company.companyLogo.startsWith('http')
                                        ? company.companyLogo
                                        : `${import.meta.env.VITE_API_URL}/uploads/logo/${company.companyLogo}`
                                }
                                alt={company.companyName}
                                className="w-full h-full object-contain p-1"
                            />
                        ) : (
                            <Building2 size={22} className="text-slate-300" />
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs text-slate-400 font-medium truncate">
                            {company.companyName || 'Công ty ẩn danh'}
                        </p>
                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2 mt-0.5">
                            {job.title}
                        </h3>
                    </div>
                </div>

                {/* Bookmark */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSaved?.(job._id);
                    }}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                    {savedJobIds?.has(job._id) ? (
                        <BookmarkCheck size={18} className="text-indigo-600" />
                    ) : (
                        <Bookmark size={18} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                    )}
                </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
                <span
                    className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${typeInfo.color}`}
                >
                    {typeInfo.label}
                </span>

                {isNew && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <BadgeCheck size={11} /> Mới
                    </span>
                )}

                {isHot && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                        <Zap size={11} /> Nổi bật
                    </span>
                )}
            </div>

            {/* Info row */}
            <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{job.location || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <DollarSign size={13} className="text-slate-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-700">
                        {formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={12} />
                    <span>{dayjs(job.createdAt).fromNow()}</span>
                </div>

                {daysLeft !== null && (
                    <span className={`text-xs font-medium ${daysLeft <= 3 ? 'text-red-500' : 'text-slate-400'}`}>
                        {daysLeft <= 0 ? 'Hết hạn' : `Còn ${daysLeft} ngày`}
                    </span>
                )}
            </div>
        </motion.div>
    );
}

const TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'full-time', label: 'Toàn thời gian' },
    { key: 'part-time', label: 'Bán thời gian' },
    { key: 'internship', label: 'Thực tập' },
    { key: 'freelance', label: 'Freelance' },
];

export default function FeaturedJobs() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [savedJobIds, setSavedJobIds] = useState(new Set());
    const VISIBLE = 9;

    useEffect(() => {
        setLoading(true);
        jobAPI
            .getList()
            .then((res) => {
                const data = res.data?.metadata || [];
                setJobs(data);
            })
            .catch(() => setJobs([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!user) return;
        requestGetMyFavourites()
            .then((res) => {
                const ids = new Set((res.metadata || []).map((f) => f.jobId?._id || f.jobId));
                setSavedJobIds(ids);
            })
            .catch(() => {});
    }, [user]);

    const handleToggleSaved = async (jobId) => {
        if (!user) {
            message.info('Vui lòng đăng nhập để lưu việc làm');
            return;
        }
        try {
            await requestToggleFavourite(jobId);
            setSavedJobIds((prev) => {
                const next = new Set(prev);
                if (next.has(jobId)) {
                    next.delete(jobId);
                    message.success('Bỏ lưu việc làm');
                } else {
                    next.add(jobId);
                    message.success('Đã lưu việc làm');
                }
                return next;
            });
        } catch {
            message.error('Có lỗi xảy ra');
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const filtered = activeTab === 'all' ? jobs : jobs.filter((j) => j.type === activeTab);
    const totalPages = Math.ceil(filtered.length / VISIBLE) || 1;
    const displayed = filtered.slice((currentPage - 1) * VISIBLE, currentPage * VISIBLE);

    return (
        <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-2">
                            <Briefcase size={15} />
                            Việc làm tuyển dụng
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Cơ hội việc làm{' '}
                            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                                hôm nay
                            </span>
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                            {jobs.length > 0
                                ? `${jobs.length.toLocaleString()} việc làm đang chờ bạn ứng tuyển`
                                : 'Đang tải việc làm...'}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/jobs')}
                        className="hidden sm:flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group flex-shrink-0"
                    >
                        Xem tất cả việc làm
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Type filter tabs */}
                <div className="flex gap-2 flex-wrap mb-8">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                activeTab === tab.key
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                            }`}
                        >
                            {tab.label}
                            {tab.key !== 'all' && (
                                <span
                                    className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-indigo-200' : 'text-slate-400'}`}
                                >
                                    ({jobs.filter((j) => j.type === tab.key).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-slate-100 rounded-2xl h-52 animate-pulse" />
                        ))}
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                            <Briefcase size={28} className="text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">Chưa có việc làm phù hợp</p>
                        <p className="text-slate-400 text-sm mt-1">Thử lọc loại hình khác</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {displayed.map((job, i) => (
                            <JobCard
                                key={job._id}
                                job={job}
                                index={i}
                                savedJobIds={savedJobIds}
                                onToggleSaved={handleToggleSaved}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-5">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
                                currentPage === 1
                                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50/50'
                                    : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50 active:scale-95'
                            }`}
                        >
                            <ChevronLeft size={22} className="mr-[2px]" />
                        </button>

                        <div className="text-[15px] font-medium text-slate-400">
                            <span className="text-emerald-500 font-bold text-xl mr-1">{currentPage}</span> /{' '}
                            {totalPages} trang
                        </div>

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
                                currentPage === totalPages
                                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50/50'
                                    : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50 active:scale-95'
                            }`}
                        >
                            <ChevronRight size={22} className="ml-[2px]" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
