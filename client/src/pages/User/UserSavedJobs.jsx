import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    MapPin,
    Clock,
    DollarSign,
    Briefcase,
    Heart,
    BookmarkX,
    Building2,
    Search,
    ExternalLink,
} from 'lucide-react';
import { Empty, Spin, Input } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { requestGetMyFavourites, requestToggleFavourite } from '../../config/bookmarkAndFollowRequest';
import FollowCompanyButton from '../../components/FollowCompanyButton';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const formatSalary = (min, max, negotiable) => {
    if (negotiable) return 'Thỏa thuận';
    if (!min && !max) return 'Chưa cập nhật';
    const fmt = (n) =>
        n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)}tr` : `${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `Từ ${fmt(min)}`;
    return `Đến ${fmt(max)}`;
};

export default function UserSavedJobs() {
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchFavourites = async () => {
        setLoading(true);
        try {
            const res = await requestGetMyFavourites();
            setFavourites(res.metadata || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavourites();
    }, []);

    const handleRemove = async (jobId) => {
        await requestToggleFavourite(jobId);
        setFavourites((prev) => prev.filter((f) => f.jobId?._id !== jobId && f.jobId !== jobId));
    };

    const filtered = favourites.filter((f) => {
        const job = f.jobId;
        if (!job || typeof job !== 'object') return false;
        const kw = search.toLowerCase();
        return (
            !kw ||
            job.title?.toLowerCase().includes(kw) ||
            job.companyId?.companyName?.toLowerCase().includes(kw)
        );
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Heart size={22} className="text-rose-500" /> Việc làm yêu thích
                </h1>
                <p className="text-slate-500 mt-1 text-sm">
                    Bạn đã lưu <strong>{favourites.length}</strong> việc làm
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm trong danh sách đã lưu..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Spin size="large" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
                        <Heart size={28} className="text-rose-300" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-slate-700">
                            {search ? 'Không tìm thấy việc làm phù hợp' : 'Chưa có việc làm nào được lưu'}
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                            {search
                                ? 'Thử tìm kiếm với từ khóa khác'
                                : 'Nhấn vào biểu tượng bookmark trên trang việc làm để lưu'}
                        </p>
                    </div>
                    {!search && (
                        <Link
                            to="/jobs"
                            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            <Briefcase size={15} /> Khám phá việc làm
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((fav) => {
                        const job = fav.jobId;
                        if (!job || typeof job !== 'object') return null;
                        const company = job.companyId;
                        const logoSrc = company?.companyLogo
                            ? company.companyLogo.startsWith('http')
                                ? company.companyLogo
                                : `${API_URL}/uploads/logo/${company.companyLogo}`
                            : null;

                        return (
                            <div
                                key={fav._id}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all p-5"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Logo */}
                                    <div className="w-14 h-14 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {logoSrc ? (
                                            <img src={logoSrc} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <Building2 size={22} className="text-slate-300" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <Link
                                                    to={`/jobs/${job._id}`}
                                                    className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors text-base leading-tight line-clamp-1"
                                                >
                                                    {job.title}
                                                </Link>
                                                <p className="text-slate-500 text-sm mt-0.5">
                                                    {company?.companyName || 'Chưa xác định'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(job._id)}
                                                className="flex-shrink-0 p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Bỏ lưu"
                                            >
                                                <BookmarkX size={18} />
                                            </button>
                                        </div>

                                        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                                            {job.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={11} /> {job.location}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <DollarSign size={11} />
                                                {formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)}
                                            </span>
                                            {job.type && (
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded-full font-medium">
                                                    {job.type}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Clock size={11} />
                                                {dayjs(fav.createdAt).fromNow()}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-3.5 flex items-center gap-2 flex-wrap">
                                            <Link
                                                to={`/jobs/${job._id}`}
                                                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                                            >
                                                <ExternalLink size={13} /> Xem chi tiết
                                            </Link>
                                            {company?._id && (
                                                <FollowCompanyButton
                                                    companyId={company._id}
                                                    companyName={company.companyName}
                                                    size="sm"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
