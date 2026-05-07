import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { adminAPI } from '../../api/admin.api';


const TABS = [
    { label: 'Tất cả', value: '' },
    { label: 'Đang hoạt động', value: 'active' },
    { label: 'Chờ duyệt', value: 'pending' },
    { label: 'Tạm dừng', value: 'paused' },
];
const PAGE_SIZE = 10;
const STATUS_LABELS = { active: 'Đang mở', pending: 'Chờ duyệt', paused: 'Tạm dừng', expired: 'Hết hạn' };
const STATUS_STYLES = { active: 'bg-emerald-50 text-emerald-700', pending: 'bg-amber-50 text-amber-700', paused: 'bg-slate-100 text-slate-600', expired: 'bg-red-50 text-red-600' };
const TYPE_LABELS = { 'full-time': 'Toàn thời gian', 'part-time': 'Bán thời gian', internship: 'Thực tập', freelance: 'Freelance', contract: 'Hợp đồng' };

export default function JobsPage() {
    const [jobs, setJobs] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('');
    const [page, setPage] = useState(1);
    const [updating, setUpdating] = useState(null);

    const debounceRef = useRef(null);

    const fetchJobs = useCallback((p, s, st) => {
        setLoading(true);
        adminAPI.getAllJobs({ page: p, limit: PAGE_SIZE, search: s, status: st })
            .then((res) => {
                const meta = res.data?.metadata;
                setJobs(meta?.data || []);
                setTotal(meta?.total || 0);
                setTotalPages(meta?.totalPages || 1);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchJobs(page, search, tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleTabChange = (value) => {
        setTab(value);
        setPage(1);
        fetchJobs(1, search, value);
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            fetchJobs(1, val, tab);
        }, 400);
    };

    const updateStatus = async (id, status) => {
        setUpdating(id);
        try {
            await adminAPI.updateJobStatus(id, status);
            message.success('Cập nhật trạng thái thành công!');
            fetchJobs(page, search, tab);
        } catch {
            message.error('Cập nhật thất bại!');
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Quản Lý Việc Làm</h1>
                <p className="text-slate-500 mt-1 text-sm">{total.toLocaleString()} tin tuyển dụng</p>
            </div>

            {/* Filter + Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex gap-1 flex-wrap">
                    {TABS.map((t) => (
                        <button key={t.value} onClick={() => handleTabChange(t.value)}
                            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${tab === t.value ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 flex-1">
                    <Search size={16} className="text-slate-400" />
                    <input value={search} onChange={handleSearchChange} placeholder="Tìm tên vị trí..."
                        className="flex-1 outline-none bg-transparent text-sm py-2 text-slate-700 placeholder-slate-400" />
                    {search && <button onClick={() => { setSearch(''); setPage(1); fetchJobs(1, '', tab); }}><X size={14} className="text-slate-400" /></button>}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-7 h-7 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Vị trí / Công ty', 'Địa điểm', 'Loại', 'Trạng thái', 'Hạn nộp', 'Thao tác'].map((h) => (
                                        <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {jobs.map((j) => (
                                    <motion.tr key={j._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <p className="font-medium text-slate-800 line-clamp-1">{j.title}</p>
                                            <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                                                <Building2 size={11} />
                                                <span>{j.companyId?.companyName || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-1 text-slate-500 text-xs">
                                                <MapPin size={12} />
                                                <span className="truncate max-w-[120px]">{j.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-medium">{TYPE_LABELS[j.type] || j.type}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_STYLES[j.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {STATUS_LABELS[j.status] || j.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap text-xs">
                                            {j.deadline ? dayjs(j.deadline).format('DD/MM/YYYY') : 'Không có'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex gap-1.5">
                                                {j.status !== 'active' && (
                                                    <button disabled={updating === j._id} onClick={() => updateStatus(j._id, 'active')}
                                                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50">
                                                        Kích hoạt
                                                    </button>
                                                )}
                                                {j.status !== 'paused' && (
                                                    <button disabled={updating === j._id} onClick={() => updateStatus(j._id, 'paused')}
                                                        className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50">
                                                        Tạm dừng
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                                {jobs.length === 0 && (
                                    <tr><td colSpan={6} className="text-center text-slate-400 py-12">Không tìm thấy việc làm</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                        <span>Trang <strong>{page}</strong> / {totalPages} &nbsp;·&nbsp; {total.toLocaleString()} kết quả</span>
                        <div className="flex items-center gap-1">
                            <button disabled={page === 1} onClick={() => setPage(1)} className="px-2 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-xs">«</button>
                            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><ChevronLeft size={15} /></button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                                return <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg border text-xs ${p === page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 hover:bg-slate-50'}`}>{p}</button>;
                            })}
                            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><ChevronRight size={15} /></button>
                            <button disabled={page === totalPages} onClick={() => setPage(totalPages)} className="px-2 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-xs">»</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
