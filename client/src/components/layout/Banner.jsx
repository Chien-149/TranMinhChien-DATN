import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search,
    MapPin,
    Briefcase,
    ChevronDown,
    Sparkles,
    TrendingUp,
    Building2,
    Users,
    ArrowRight,
} from 'lucide-react';
import { industriesAPI } from '../../api/industries.api';
import { jobAPI } from '../../api/job.api';

const JOB_TYPES = [
    { value: '', label: 'Tất cả loại hình' },
    { value: 'full-time', label: 'Toàn thời gian' },
    { value: 'part-time', label: 'Bán thời gian' },
    { value: 'internship', label: 'Thực tập' },
    { value: 'contract', label: 'Hợp đồng' },
    { value: 'freelance', label: 'Freelance' },
];

const EXPERIENCE_LEVELS = [
    { value: '', label: 'Kinh nghiệm' },
    { value: 'Không yêu cầu', label: 'Không yêu cầu' },
    { value: 'Dưới 1 năm', label: 'Dưới 1 năm' },
    { value: '1-2 năm', label: '1 - 2 năm' },
    { value: '2-3 năm', label: '2 - 3 năm' },
    { value: '3-5 năm', label: '3 - 5 năm' },
    { value: 'Trên 5 năm', label: 'Trên 5 năm' },
];

const HOT_KEYWORDS = ['React Developer', 'NodeJS', 'UI/UX Designer', 'Data Analyst', 'Marketing', 'Java Backend'];

const STATS_ITEMS = [
    {
        icon: <Briefcase size={20} />,
        value: null,
        key: 'totalActiveJobs',
        label: 'Việc làm đang tuyển',
        color: 'text-indigo-600',
    },
    {
        icon: <Building2 size={20} />,
        value: null,
        key: 'companiesHiring',
        label: 'Công ty đang tuyển',
        color: 'text-emerald-600',
    },
    {
        icon: <TrendingUp size={20} />,
        value: null,
        key: 'jobsLast24h',
        label: 'Việc mới hôm nay',
        color: 'text-orange-500',
    },
];

export default function Banner() {
    const navigate = useNavigate();

    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');
    const [jobType, setJobType] = useState('');
    const [category, setCategory] = useState('');
    const [experience, setExperience] = useState('');

    const [industries, setIndustries] = useState([]);
    const [locations, setLocations] = useState([]);
    const [stats, setStats] = useState({ totalActiveJobs: 0, companiesHiring: 0, jobsLast24h: 0 });
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Load dropdown data and stats
    useEffect(() => {
        industriesAPI
            .getAll()
            .then((res) => {
                setIndustries(res.data?.metadata || []);
            })
            .catch(() => {});

        jobAPI
            .getLocations()
            .then((res) => {
                setLocations(res.data?.data || []);
            })
            .catch(() => {});

        jobAPI
            .getDashboardStats()
            .then((res) => {
                const s = res.data?.metadata?.stats;
                if (s) setStats(s);
            })
            .catch(() => {});
    }, []);

    const handleSearch = (e) => {
        e?.preventDefault();
        const params = new URLSearchParams();
        if (keyword.trim()) params.set('keyword', keyword.trim());
        if (location) params.set('location', location);
        if (jobType) params.set('type', jobType);
        if (category) params.set('category', category);
        if (experience) params.set('experience', experience);
        navigate(`/jobs?${params.toString()}`);
    };

    const handleHotKeyword = (kw) => {
        setKeyword(kw);
        const params = new URLSearchParams();
        params.set('keyword', kw);
        navigate(`/jobs?${params.toString()}`);
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50 pt-10 pb-16">
            {/* Background blobs */}
            <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-100/60 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full bg-cyan-100/70 blur-3xl" />
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full bg-indigo-50/50 blur-2xl" />

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-5"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full border border-indigo-200">
                        Nền tảng tìm việc làm - Tuyển dụng hiệu quả
                    </span>
                </motion.div>

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.05 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
                        Tìm việc làm{' '}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                                phù hợp nhất
                            </span>
                            <svg
                                className="absolute -bottom-1.5 left-0 w-full"
                                viewBox="0 0 300 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M2 7 Q75 1 150 5 Q225 9 298 4"
                                    stroke="url(#grad)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    fill="none"
                                />
                                <defs>
                                    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#4f46e5" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </span>{' '}
                        với bạn
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Hơn <strong className="text-indigo-600">{stats.totalActiveJobs.toLocaleString()}</strong> việc
                        làm chất lượng cao từ{' '}
                        <strong className="text-indigo-600">{stats.companiesHiring.toLocaleString()}</strong> công ty
                        hàng đầu
                    </p>
                </motion.div>

                {/* Search card */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <form
                        onSubmit={handleSearch}
                        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-indigo-100/60 border border-slate-200/80 overflow-hidden"
                    >
                        {/* Main search row */}
                        <div className="flex flex-col md:flex-row items-stretch gap-0 p-2">
                            {/* Keyword */}
                            <div className="flex items-center gap-3 flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-200">
                                <Search size={18} className="text-indigo-500 flex-shrink-0" />
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="Tên công việc, kỹ năng, công ty..."
                                    className="flex-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 bg-transparent min-w-0"
                                />
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-3 flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-200 min-w-0">
                                <MapPin size={18} className="text-indigo-500 flex-shrink-0" />
                                <div className="relative flex-1 min-w-0">
                                    <select
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full text-sm text-slate-800 outline-none bg-transparent appearance-none cursor-pointer pr-6 truncate"
                                    >
                                        <option value="">Tất cả địa điểm</option>
                                        <option value="Hà Nội">Hà Nội</option>
                                        <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                                        <option value="Đà Nẵng">Đà Nẵng</option>
                                        <option value="Remote">Remote</option>
                                        {locations
                                            .filter((l) => !['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Remote'].includes(l))
                                            .map((loc) => (
                                                <option key={loc} value={loc}>
                                                    {loc}
                                                </option>
                                            ))}
                                    </select>
                                    <ChevronDown
                                        size={14}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                    />
                                </div>
                            </div>

                            {/* Job type */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-200 min-w-[160px]">
                                <Briefcase size={18} className="text-indigo-500 flex-shrink-0" />
                                <div className="relative flex-1">
                                    <select
                                        value={jobType}
                                        onChange={(e) => setJobType(e.target.value)}
                                        className="w-full text-sm text-slate-800 outline-none bg-transparent appearance-none cursor-pointer pr-6"
                                    >
                                        {JOB_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={14}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                    />
                                </div>
                            </div>

                            {/* Search button */}
                            <div className="p-2 flex-shrink-0">
                                <button
                                    type="submit"
                                    className="w-full md:w-auto h-full flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300 text-sm whitespace-nowrap"
                                >
                                    <Search size={16} />
                                    Tìm kiếm
                                </button>
                            </div>
                        </div>

                        {/* Advanced filters toggle */}
                        <div className="px-4 pb-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowAdvanced((v) => !v)}
                                className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium py-2 hover:text-indigo-800 transition-colors"
                            >
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
                                />
                                {showAdvanced ? 'Ẩn bộ lọc nâng cao' : 'Bộ lọc nâng cao (ngành nghề, kinh nghiệm)'}
                            </button>

                            {/* Advanced row */}
                            {showAdvanced && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3"
                                >
                                    {/* Industry/Category */}
                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                                        <Building2 size={15} className="text-slate-400 flex-shrink-0" />
                                        <div className="relative flex-1">
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full text-sm text-slate-700 outline-none bg-transparent appearance-none cursor-pointer pr-5"
                                            >
                                                <option value="">Tất cả ngành nghề</option>
                                                {industries.map((ind) => (
                                                    <option key={ind._id} value={ind._id}>
                                                        {ind.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown
                                                size={13}
                                                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Experience */}
                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                                        <Users size={15} className="text-slate-400 flex-shrink-0" />
                                        <div className="relative flex-1">
                                            <select
                                                value={experience}
                                                onChange={(e) => setExperience(e.target.value)}
                                                className="w-full text-sm text-slate-700 outline-none bg-transparent appearance-none cursor-pointer pr-5"
                                            >
                                                {EXPERIENCE_LEVELS.map((e) => (
                                                    <option key={e.value} value={e.value}>
                                                        {e.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown
                                                size={13}
                                                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </form>
                </motion.div>

                {/* Hot keywords */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className="flex flex-wrap items-center gap-2 mt-5 justify-center"
                >
                    <span className="text-sm text-slate-400 font-medium">Phổ biến:</span>
                    {HOT_KEYWORDS.map((kw) => (
                        <button
                            key={kw}
                            onClick={() => handleHotKeyword(kw)}
                            className="px-3.5 py-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-full hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                        >
                            {kw}
                        </button>
                    ))}
                </motion.div>

                {/* Stats bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                    {STATS_ITEMS.map((item, i) => (
                        <motion.div
                            key={item.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.08 }}
                            className="flex items-center gap-4 bg-white/80 backdrop-blur rounded-2xl border border-slate-200/70 px-5 py-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
                        >
                            <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center bg-slate-50 ${item.color}`}
                            >
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">
                                    {stats[item.key]?.toLocaleString('vi-VN') ?? '—'}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA for employers */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 flex justify-center"
                >
                    <button
                        onClick={() => navigate('/company/jobs')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors group"
                    >
                        Bạn là nhà tuyển dụng? Đăng tin tuyển dụng ngay
                        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
