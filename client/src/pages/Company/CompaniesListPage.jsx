import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Search,
    MapPin,
    Users,
    Briefcase,
    Filter,
    X,
    ChevronRight,
    ChevronLeft,
    BadgeCheck,
    Loader2,
    SlidersHorizontal,
} from 'lucide-react';
import { companyAPI } from '../../api/company.api';
import axiosInstance from '../../api/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const COMPANY_SIZES = [
    { value: '', label: 'Tất cả quy mô' },
    { value: '1-10', label: '1 – 10 nhân viên' },
    { value: '11-50', label: '11 – 50 nhân viên' },
    { value: '51-200', label: '51 – 200 nhân viên' },
    { value: '201-500', label: '201 – 500 nhân viên' },
    { value: '500+', label: 'Trên 500 nhân viên' },
];

// ─── CompanyCard ────────────────────────────────────────────────────────────
function CompanyCard({ company, index }) {
    const navigate = useNavigate();
    const logoUrl = company.companyLogo
        ? company.companyLogo.startsWith('http')
            ? company.companyLogo
            : `${API_URL}/uploads/logo/${company.companyLogo}`
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            onClick={() => navigate(`/companies/${company._id}`)}
            className="group bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50/60 transition-all duration-200 flex flex-col"
        >
            {/* Logo + Verified */}
            <div className="flex items-start justify-between mb-5">
                <div className="w-16 h-16 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={company.companyName}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <Building2 size={28} className="text-slate-300" />
                    )}
                </div>
                {company.isVerified && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                        <BadgeCheck size={12} />
                        Đã xác minh
                    </span>
                )}
            </div>

            {/* Name */}
            <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                {company.companyName}
            </h3>

            {/* Industry */}
            {company.industry?.name && (
                <p className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg w-fit mb-3">
                    {company.industry.name}
                </p>
            )}

            {/* Meta info */}
            <div className="mt-auto pt-3 border-t border-slate-100 flex flex-wrap gap-3 text-xs text-slate-500">
                {company.companyAddress && (
                    <span className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-slate-400" />
                        {company.companyAddress.split(',').slice(-2).join(',').trim()}
                    </span>
                )}
                {company.companySize && (
                    <span className="flex items-center gap-1.5">
                        <Users size={11} className="text-slate-400" />
                        {company.companySize} NV
                    </span>
                )}
            </div>

            {/* CTA */}
            <div className="mt-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors w-full justify-center">
                    Xem công ty
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
            </div>
        </motion.div>
    );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse">
            <div className="flex items-start justify-between mb-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-100" />
                <div className="w-20 h-6 rounded-full bg-slate-100" />
            </div>
            <div className="h-5 bg-slate-100 rounded-lg mb-2 w-3/4" />
            <div className="h-4 bg-slate-100 rounded-lg w-1/3 mb-4" />
            <div className="border-t border-slate-100 pt-3 flex gap-3">
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
            </div>
            <div className="h-9 bg-slate-100 rounded-xl mt-4" />
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

export default function CompaniesPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [industries, setIndustries] = useState([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        industry: searchParams.get('industry') || '',
        size: searchParams.get('size') || '',
        page: Number(searchParams.get('page')) || 1,
    });

    // Tải danh sách ngành
    useEffect(() => {
        axiosInstance
            .get('/api/industries/list')
            .then((res) => setIndustries(res.data?.metadata || []))
            .catch(() => {});
    }, []);

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                status: 'approved',
                limit: PAGE_SIZE,
                page: filters.page,
            };
            if (filters.search) params.search = filters.search;
            if (filters.size) params.size = filters.size;

            const res = await companyAPI.getAll(params);
            const meta = res.data?.metadata || {};
            let list = meta.data || [];

            // Lọc theo ngành nghề (client-side nếu BE chưa hỗ trợ)
            if (filters.industry) {
                list = list.filter((c) => c.industry?._id === filters.industry || c.industry === filters.industry);
            }

            setCompanies(list);
            setTotal(meta.total || list.length);
            setTotalPages(meta.totalPages || Math.ceil((meta.total || list.length) / PAGE_SIZE) || 1);
        } catch {
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const applyFilters = (newFilters) => {
        const merged = { ...filters, ...newFilters, page: 1 };
        setFilters(merged);
        const sp = new URLSearchParams();
        Object.entries(merged).forEach(([k, v]) => {
            if (v) sp.set(k, v);
        });
        setSearchParams(sp);
        setShowMobileFilters(false);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters({});
    };

    const handlePageChange = (p) => {
        const merged = { ...filters, page: p };
        setFilters(merged);
        const sp = new URLSearchParams();
        Object.entries(merged).forEach(([k, v]) => {
            if (v) sp.set(k, v);
        });
        setSearchParams(sp);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        const reset = { search: '', industry: '', size: '', page: 1 };
        setFilters(reset);
        setSearchParams(new URLSearchParams());
        setShowMobileFilters(false);
    };

    const hasActiveFilters = filters.industry || filters.size;

    // ── Sidebar Filters Component ───────────────────────────────────────────
    const FiltersContent = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <SlidersHorizontal size={17} className="text-indigo-500" />
                    Bộ lọc
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-xs text-slate-400 hover:text-rose-500 font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                        <X size={12} /> Xóa lọc
                    </button>
                )}
            </div>

            {/* Industry */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Lĩnh vực</label>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {[{ _id: '', name: 'Tất cả lĩnh vực' }, ...industries].map((ind) => (
                        <label
                            key={ind._id}
                            className="flex items-center gap-2.5 cursor-pointer group py-1.5 px-2 rounded-lg hover:bg-slate-50"
                        >
                            <input
                                type="radio"
                                name="industry"
                                value={ind._id}
                                checked={filters.industry === ind._id}
                                onChange={() => applyFilters({ industry: ind._id })}
                                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-600 cursor-pointer"
                            />
                            <span className="text-sm text-slate-600 group-hover:text-slate-900 truncate">
                                {ind.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Company Size */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Quy mô</label>
                <div className="space-y-1.5">
                    {COMPANY_SIZES.map((s) => (
                        <label
                            key={s.value}
                            className="flex items-center gap-2.5 cursor-pointer group py-1.5 px-2 rounded-lg hover:bg-slate-50"
                        >
                            <input
                                type="radio"
                                name="size"
                                value={s.value}
                                checked={filters.size === s.value}
                                onChange={() => applyFilters({ size: s.value })}
                                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-600 cursor-pointer"
                            />
                            <span className="text-sm text-slate-600 group-hover:text-slate-900">{s.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* ── Hero Banner ── */}
            <div className="relative bg-gradient-to-br from-indigo-900 via-indigo-700 to-cyan-600 overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-[-30%] right-[-10%] w-[50%] h-[180%] bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[-20%] left-[-5%] w-[35%] h-[120%] bg-cyan-400/10 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 text-indigo-200 text-sm font-semibold mb-4 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                            <Building2 size={14} />
                            Danh sách công ty
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight">
                            Khám phá các công ty{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white">
                                hàng đầu
                            </span>
                        </h1>
                        <p className="text-indigo-200 text-base max-w-xl mb-8">
                            Tìm hiểu về môi trường làm việc, văn hóa công ty và các cơ hội tuyển dụng hấp dẫn nhất.
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-xl">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Tên công ty, lĩnh vực..."
                                    value={filters.search}
                                    onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-slate-800 outline-none shadow-lg placeholder:text-slate-400 text-sm font-medium"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3.5 bg-indigo-500 hover:bg-indigo-400 border border-indigo-300 text-white font-bold rounded-xl shadow-lg transition-colors flex-shrink-0"
                            >
                                Tìm kiếm
                            </button>
                        </form>

                        {/* Stats */}
                        <div className="flex gap-6 mt-8 text-sm text-indigo-200">
                            <span className="flex items-center gap-1.5">
                                <Building2 size={14} />
                                <strong className="text-white">{total.toLocaleString()}</strong> công ty
                            </span>
                            <span className="flex items-center gap-1.5">
                                <BadgeCheck size={14} />
                                Đã xác minh
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                <div className="flex gap-8">
                    {/* ── Sidebar Filters (Desktop) ── */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24">
                            <FiltersContent />
                        </div>
                    </aside>

                    {/* ── Company Grid ── */}
                    <div className="flex-1 min-w-0">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-6 gap-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <p className="text-sm text-slate-500">
                                    Tìm thấy <span className="font-bold text-slate-800">{total}</span> công ty
                                </p>
                                {/* Active filter chips */}
                                {filters.industry && industries.find((i) => i._id === filters.industry) && (
                                    <span className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
                                        {industries.find((i) => i._id === filters.industry)?.name}
                                        <button
                                            onClick={() => applyFilters({ industry: '' })}
                                            className="hover:text-rose-500"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.size && (
                                    <span className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
                                        {COMPANY_SIZES.find((s) => s.value === filters.size)?.label}
                                        <button
                                            onClick={() => applyFilters({ size: '' })}
                                            className="hover:text-rose-500"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                            </div>

                            {/* Mobile filter button */}
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-indigo-300 transition-colors flex-shrink-0"
                            >
                                <Filter size={16} />
                                Bộ lọc
                                {hasActiveFilters && (
                                    <span className="w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {(filters.industry ? 1 : 0) + (filters.size ? 1 : 0)}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        ) : companies.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-2xl text-center px-6"
                            >
                                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-300 mb-6">
                                    <Building2 size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy công ty nào</h3>
                                <p className="text-slate-500 text-sm max-w-sm mb-8">
                                    Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm công ty phù hợp với bạn.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
                                >
                                    Xóa tất cả bộ lọc
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {companies.map((company, i) => (
                                        <CompanyCard key={company._id} company={company} index={i} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-12 mb-4 flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
                                            disabled={filters.page === 1}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                                filters.page === 1
                                                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50/50'
                                                    : 'border-indigo-400 text-indigo-600 hover:bg-indigo-50 active:scale-95'
                                            }`}
                                        >
                                            <ChevronLeft size={20} />
                                        </button>

                                        <div className="flex items-center gap-1.5">
                                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                                const page = i + 1;
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                                                            filters.page === page
                                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                                : 'text-slate-500 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(Math.min(totalPages, filters.page + 1))}
                                            disabled={filters.page === totalPages}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                                filters.page === totalPages
                                                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50/50'
                                                    : 'border-indigo-400 text-indigo-600 hover:bg-indigo-50 active:scale-95'
                                            }`}
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Mobile Filter Drawer ── */}
            <AnimatePresence>
                {showMobileFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMobileFilters(false)}
                            className="fixed inset-0 bg-slate-900/50 z-50 lg:hidden backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col lg:hidden"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-slate-100">
                                <h3 className="font-bold text-lg text-slate-800">Bộ lọc</h3>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="p-2 text-slate-400 bg-slate-50 hover:bg-slate-100 rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5">
                                <FiltersContent />
                            </div>
                            <div className="p-4 border-t border-slate-100">
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="w-full py-3.5 rounded-xl font-bold bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                                >
                                    Xem kết quả ({total})
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
