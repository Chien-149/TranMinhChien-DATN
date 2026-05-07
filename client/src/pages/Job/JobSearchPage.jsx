import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Briefcase, Filter, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { jobAPI } from '../../api/job.api';
import { industriesAPI } from '../../api/industries.api';

// Reusing JobCard from FeaturedJobs but without importing it directly to keep it self-contained for now,
// ideally we'd extract it to a shared component. For speed, creating a slightly simpler version here.
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { Bookmark, BookmarkCheck, Zap, DollarSign, Building2 } from 'lucide-react';

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ListJobCard({ job, onClick }) {
    const [saved, setSaved] = useState(false);
    const company = job.companyId || {};
    const typeInfo = JOB_TYPE_LABELS[job.type] || { label: job.type, color: 'bg-slate-100 text-slate-600' };
    const logoSrc = company.companyLogo
        ? company.companyLogo.startsWith('http')
            ? company.companyLogo
            : `${API_URL}/uploads/logo/${company.companyLogo}`
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className="group bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50/50 transition-all sm:flex gap-5 relative overflow-hidden"
        >
            {/* Logo */}
            <div className="w-16 h-16 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center flex-shrink-0 mb-4 sm:mb-0">
                {logoSrc ? (
                    <img src={logoSrc} alt={company.companyName} className="w-full h-full object-contain p-2" />
                ) : (
                    <Building2 size={28} className="text-slate-300" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 pr-8">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {job.title}
                        </h3>
                        <p className="text-sm text-slate-500 truncate mt-1">{company.companyName}</p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSaved(!saved);
                        }}
                        className="flex-shrink-0 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        {saved ? <BookmarkCheck size={20} className="text-indigo-600" /> : <Bookmark size={20} />}
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm font-medium">
                    <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                        <DollarSign size={16} /> {formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-600">
                        <MapPin size={16} className="text-slate-400" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-600">
                        <Briefcase size={16} className="text-slate-400" /> {job.experience || 'Không yêu cầu'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${typeInfo.color}`}>
                        {typeInfo.label}
                    </span>
                </div>

                <div className="mt-4 text-[13px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1">Cập nhật {dayjs(job.updatedAt).fromNow()}</span>
                    {job.deadline && dayjs(job.deadline).diff(dayjs(), 'day') > 0 && (
                        <span className="text-orange-500 font-medium">
                            Còn {dayjs(job.deadline).diff(dayjs(), 'day')} ngày để ứng tuyển
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function JobSearchPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [jobs, setJobs] = useState([]);
    const [pagination, setPagination] = useState({ totalPages: 1, totalJobs: 0, currentPage: 1 });
    const [loading, setLoading] = useState(true);

    const [locations, setLocations] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Form state corresponding to URL params
    const [filters, setFilters] = useState({
        keyword: searchParams.get('keyword') || '',
        location: searchParams.get('location') || '',
        type: searchParams.get('type') || '',
        category: searchParams.get('category') || '',
        experience: searchParams.get('experience') || '',
        salary: searchParams.get('salary') || '',
    });

    useEffect(() => {
        // Fetch filter options
        jobAPI.getLocations().then((res) => setLocations(res.data?.data || []));
        industriesAPI.getAll().then((res) => setIndustries(res.data?.metadata || []));
    }, []);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const currentParams = Object.fromEntries(searchParams.entries());

            // Map the generic 'salary' string to salaryMin / salaryMax for the backend
            if (currentParams.salary) {
                switch (currentParams.salary) {
                    case 'Dưới 10 triệu':
                        currentParams.salaryMax = 10000000;
                        break;
                    case '10 - 15 triệu':
                        currentParams.salaryMin = 10000000;
                        currentParams.salaryMax = 15000000;
                        break;
                    case '15 - 20 triệu':
                        currentParams.salaryMin = 15000000;
                        currentParams.salaryMax = 20000000;
                        break;
                    case '20 - 30 triệu':
                        currentParams.salaryMin = 20000000;
                        currentParams.salaryMax = 30000000;
                        break;
                    case 'Trên 30 triệu':
                        currentParams.salaryMin = 30000000;
                        break;
                    case 'Thỏa thuận':
                        // Usually backend might need a specific flag for negotiable,
                        // but based on controller, maybe omit min/max and rely on other logic if any.
                        // Since job.controller.js only handles exact numbers, we skip passing min/max.
                        break;
                }
                delete currentParams.salary; // Remove this because backend expects min/max
            }

            const res = await jobAPI.search(currentParams);
            const responseData = res.data?.data || {};
            setJobs(responseData.jobs || []);
            setPagination({
                totalPages: responseData.pagination?.totalPages || 1,
                totalJobs: responseData.pagination?.total || 0,
                currentPage: responseData.pagination?.page || Number(currentParams.page) || 1,
            });
        } catch (error) {
            console.error('Lỗi tìm kiếm jobs:', error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [searchParams]);

    useEffect(() => {
        // Sync local form state with URL when URL changes explicitly (e.g. from banner)
        setFilters({
            keyword: searchParams.get('keyword') || '',
            location: searchParams.get('location') || '',
            type: searchParams.get('type') || '',
            category: searchParams.get('category') || '',
            experience: searchParams.get('experience') || '',
            salary: searchParams.get('salary') || '',
        });
        fetchJobs();
    }, [fetchJobs, searchParams]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const newParams = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
            if (v) newParams.set(k, v);
        });
        // Reset page to 1 on new search
        newParams.set('page', '1');
        setSearchParams(newParams);
        setShowMobileFilters(false);
    };

    const clearFilters = () => {
        setFilters({ keyword: '', location: '', type: '', category: '', experience: '', salary: '' });
        setSearchParams(new URLSearchParams({ page: '1' }));
        setShowMobileFilters(false);
    };

    const handlePageChange = (newPage) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', newPage);
        setSearchParams(newParams);
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-4 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header & Main Search Bar */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Tìm kiếm việc làm</h1>
                    <p className="text-slate-500 mb-6">
                        Khám phá {pagination.totalJobs} cơ hội việc làm mới nhất phù hợp với bạn.
                    </p>

                    <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center">
                        <div className="flex-1 flex items-center pl-4">
                            <Search className="text-slate-400 w-5 h-5 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Việc làm, công ty, kỹ năng..."
                                value={filters.keyword}
                                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                className="w-full pl-3 pr-4 py-3 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                            />
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
                        <div className="hidden sm:flex flex-1 items-center px-4">
                            <MapPin className="text-slate-400 w-5 h-5 flex-shrink-0" />
                            <select
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                                className="w-full pl-3 py-3 bg-transparent outline-none text-slate-700 cursor-pointer"
                            >
                                <option value="">Tất cả địa điểm</option>
                                {locations.map((loc) => (
                                    <option key={loc} value={loc}>
                                        {loc}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={applyFilters}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors shadow-md shadow-indigo-200 flex-shrink-0 hidden sm:block"
                        >
                            Tìm kiếm
                        </button>

                        {/* Mobile filter toggle */}
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="sm:hidden px-4 py-3 bg-slate-100 text-slate-700 rounded-xl ml-2 font-medium flex items-center gap-2"
                        >
                            <Filter size={18} /> Lọc
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT SIDEBAR: FILTERS (Desktop) */}
                    <aside className="hidden lg:block w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-28">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Filter size={18} className="text-indigo-500" /> Bộ lọc
                                </h2>
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-slate-400 hover:text-indigo-600 uppercase font-bold tracking-wider"
                                >
                                    Xóa lọc
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Ngành nghề
                                    </label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm bg-slate-50"
                                    >
                                        <option value="">Tất cả ngành nghề</option>
                                        {industries.map((ind) => (
                                            <option key={ind._id} value={ind._id}>
                                                {ind.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Job Type */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Loại công việc
                                    </label>
                                    <div className="space-y-2.5">
                                        {[
                                            { val: '', label: 'Tất cả' },
                                            { val: 'full-time', label: 'Toàn thời gian' },
                                            { val: 'part-time', label: 'Bán thời gian' },
                                            { val: 'internship', label: 'Thực tập' },
                                            { val: 'freelance', label: 'Freelance' },
                                        ].map((t) => (
                                            <label key={t.val} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value={t.val}
                                                    checked={filters.type === t.val}
                                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                                    className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-600 cursor-pointer"
                                                />
                                                <span className="text-sm text-slate-600 group-hover:text-slate-900">
                                                    {t.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Experience */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Kinh nghiệm
                                    </label>
                                    <select
                                        value={filters.experience}
                                        onChange={(e) => handleFilterChange('experience', e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm bg-slate-50"
                                    >
                                        <option value="">Tất cả kinh nghiệm</option>
                                        <option value="Không yêu cầu">Không yêu cầu</option>
                                        <option value="Dưới 1 năm">Dưới 1 năm</option>
                                        <option value="1 năm">1 năm</option>
                                        <option value="2 năm">2 năm</option>
                                        <option value="3 năm">3 năm</option>
                                        <option value="5 năm">5 năm</option>
                                        <option value="Trên 5 năm">Trên 5 năm</option>
                                    </select>
                                </div>

                                {/* Salary */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">Mức lương</label>
                                    <select
                                        value={filters.salary}
                                        onChange={(e) => handleFilterChange('salary', e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm bg-slate-50"
                                    >
                                        <option value="">Tất cả mức lương</option>
                                        <option value="Dưới 10 triệu">Dưới 10 triệu</option>
                                        <option value="10 - 15 triệu">10 - 15 triệu</option>
                                        <option value="15 - 20 triệu">15 - 20 triệu</option>
                                        <option value="20 - 30 triệu">20 - 30 triệu</option>
                                        <option value="Trên 30 triệu">Trên 30 triệu</option>
                                        <option value="Thỏa thuận">Thỏa thuận</option>
                                    </select>
                                </div>

                                <button
                                    onClick={applyFilters}
                                    className="w-full py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-colors"
                                >
                                    Áp dụng bộ lọc
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* MAIN CONTENT: JOB LIST */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl">
                                <Loader2 size={40} className="text-indigo-400 animate-spin mb-4" />
                                <p className="text-slate-500 font-medium">Đang tìm kiếm việc làm tốt nhất...</p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl text-center px-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-4">
                                    <Search size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">Không tìm thấy việc làm</h3>
                                <p className="text-slate-500 text-sm max-w-sm">
                                    Rất tiếc, không có công việc nào phù hợp với tiêu chí tìm kiếm của bạn. Vui lòng
                                    thay đổi bộ lọc hoặc từ khóa.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-6 px-6 py-2.5 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-colors"
                                >
                                    Xóa tất cả bộ lọc
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {jobs.map((job) => (
                                    <ListJobCard key={job._id} job={job} onClick={() => navigate(`/jobs/${job._id}`)} />
                                ))}

                                {/* Pagination Controls */}
                                {pagination.totalPages > 1 && (
                                    <div className="mt-12 mb-8 flex items-center justify-center gap-5">
                                        <button
                                            onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                                            disabled={pagination.currentPage === 1}
                                            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
                                                pagination.currentPage === 1
                                                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50/50'
                                                    : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50 active:scale-95'
                                            }`}
                                        >
                                            <ChevronLeft size={22} className="mr-[2px]" />
                                        </button>

                                        <div className="text-[15px] font-medium text-slate-400">
                                            <span className="text-emerald-500 font-bold text-xl mr-1">
                                                {pagination.currentPage}
                                            </span>{' '}
                                            / {pagination.totalPages} trang
                                        </div>

                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    Math.min(pagination.totalPages, pagination.currentPage + 1),
                                                )
                                            }
                                            disabled={pagination.currentPage === pagination.totalPages}
                                            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
                                                pagination.currentPage === pagination.totalPages
                                                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50/50'
                                                    : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50 active:scale-95'
                                            }`}
                                        >
                                            <ChevronRight size={22} className="ml-[2px]" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MOBILE FILTERS MODAL */}
            <AnimatePresence>
                {showMobileFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMobileFilters(false)}
                            className="fixed inset-0 bg-slate-900/40 z-50 lg:hidden backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col lg:hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-slate-100">
                                <h3 className="font-bold text-lg text-slate-800">Lọc kết quả</h3>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="p-2 text-slate-400 bg-slate-50 hover:bg-slate-100 rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {/* Mobile Search specific to location */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Địa điểm</label>
                                    <select
                                        value={filters.location}
                                        onChange={(e) => handleFilterChange('location', e.target.value)}
                                        className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 bg-slate-50"
                                    >
                                        <option value="">Tất cả địa điểm</option>
                                        {locations.map((loc) => (
                                            <option key={loc} value={loc}>
                                                {loc}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Ngành nghề
                                    </label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 bg-slate-50"
                                    >
                                        <option value="">Tất cả ngành nghề</option>
                                        {industries.map((ind) => (
                                            <option key={ind._id} value={ind._id}>
                                                {ind.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Kinh nghiệm
                                    </label>
                                    <select
                                        value={filters.experience}
                                        onChange={(e) => handleFilterChange('experience', e.target.value)}
                                        className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 bg-slate-50"
                                    >
                                        <option value="">Tất cả kinh nghiệm</option>
                                        <option value="Không yêu cầu">Không yêu cầu</option>
                                        <option value="Dưới 1 năm">Dưới 1 năm</option>
                                        <option value="1 năm">1 năm</option>
                                        <option value="2 năm">2 năm</option>
                                        <option value="3 năm">3 năm</option>
                                        <option value="5 năm">5 năm</option>
                                        <option value="Trên 5 năm">Trên 5 năm</option>
                                    </select>
                                </div>

                                {/* Mobile Salary */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Mức lương</label>
                                    <select
                                        value={filters.salary}
                                        onChange={(e) => handleFilterChange('salary', e.target.value)}
                                        className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 bg-slate-50"
                                    >
                                        <option value="">Tất cả mức lương</option>
                                        <option value="Dưới 10 triệu">Dưới 10 triệu</option>
                                        <option value="10 - 15 triệu">10 - 15 triệu</option>
                                        <option value="15 - 20 triệu">15 - 20 triệu</option>
                                        <option value="20 - 30 triệu">20 - 30 triệu</option>
                                        <option value="Trên 30 triệu">Trên 30 triệu</option>
                                        <option value="Thỏa thuận">Thỏa thuận</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Loại công việc
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { val: '', label: 'Tất cả' },
                                            { val: 'full-time', label: 'Toàn thời gian' },
                                            { val: 'part-time', label: 'Bán thời gian' },
                                            { val: 'internship', label: 'Thực tập' },
                                            { val: 'contract', label: 'Hợp đồng' },
                                            { val: 'freelance', label: 'Freelance' },
                                        ].map((t) => (
                                            <button
                                                key={t.val}
                                                onClick={() => handleFilterChange('type', t.val)}
                                                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                                                    filters.type === t.val
                                                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                                                        : 'bg-white border-slate-200 text-slate-600'
                                                }`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={clearFilters}
                                    className="flex-1 py-3.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
                                >
                                    Xóa lọc
                                </button>
                                <button
                                    onClick={applyFilters}
                                    className="flex-[2] py-3.5 rounded-xl font-bold bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700"
                                >
                                    Áp dụng
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
