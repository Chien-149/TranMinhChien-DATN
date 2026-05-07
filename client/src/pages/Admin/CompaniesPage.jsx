import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Building2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { adminAPI } from '../../api/admin.api';

const TABS = [
    { label: 'Tất cả', value: '' },
    { label: 'Chờ duyệt', value: 'pending' },
    { label: 'Đã duyệt', value: 'approved' },
    { label: 'Từ chối', value: 'rejected' },
];

const PAGE_SIZE = 10;

function StatusBadge({ status }) {
    const map = {
        pending: 'bg-amber-50 text-amber-700',
        approved: 'bg-emerald-50 text-emerald-700',
        rejected: 'bg-red-50 text-red-600',
    };
    const labels = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };
    return (
        <span
            className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${map[status] || 'bg-slate-100 text-slate-600'}`}
        >
            {labels[status] || status}
        </span>
    );
}

export default function CompaniesPage() {
    const [companies, setCompanies] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('');
    const [page, setPage] = useState(1);
    const [updating, setUpdating] = useState(null);

    const debounceRef = useRef(null);

    const fetchCompanies = useCallback((p, s, st) => {
        setLoading(true);
        adminAPI
            .getAllCompanies({ page: p, limit: PAGE_SIZE, search: s, status: st })
            .then((res) => {
                const meta = res.data?.metadata;
                setCompanies(meta?.data || []);
                setTotal(meta?.total || 0);
                setTotalPages(meta?.totalPages || 1);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchCompanies(page, search, tab);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleTabChange = (value) => {
        setTab(value);
        setPage(1);
        fetchCompanies(1, search, value);
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            fetchCompanies(1, val, tab);
        }, 400);
    };

    const updateStatus = async (id, status) => {
        setUpdating(id);
        try {
            await adminAPI.updateCompanyStatus(id, status);
            message.success(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} công ty!`);
            fetchCompanies(page, search, tab);
        } catch {
            message.error('Cập nhật thất bại!');
        } finally {
            setUpdating(null);
        }
    };

    const pendingCount = tab === '' ? companies.filter((c) => c.status === 'pending').length : 0;

    return (
        <div>
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900">Quản Lý Công Ty</h1>
                    {tab === 'pending' && total > 0 && (
                        <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {total} chờ duyệt
                        </span>
                    )}
                </div>
                <p className="text-slate-500 mt-1 text-sm">{total.toLocaleString()} công ty</p>
            </div>

            {/* Filter + Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex gap-1 flex-wrap">
                    {TABS.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => handleTabChange(t.value)}
                            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${tab === t.value ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 flex-1">
                    <Search size={16} className="text-slate-400" />
                    <input
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Tìm tên công ty..."
                        className="flex-1 outline-none bg-transparent text-sm py-2 text-slate-700 placeholder-slate-400"
                    />
                    {search && (
                        <button
                            onClick={() => {
                                setSearch('');
                                setPage(1);
                                fetchCompanies(1, '', tab);
                            }}
                        >
                            <X size={14} className="text-slate-400" />
                        </button>
                    )}
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
                                    {['Công ty', 'Email', 'Ngành', 'Trạng thái', 'Ngày đăng ký', 'Thao tác'].map(
                                        (h) => (
                                            <th
                                                key={h}
                                                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                                            >
                                                {h}
                                            </th>
                                        ),
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {companies.map((c) => (
                                    <motion.tr
                                        key={c._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {c.companyLogo ? (
                                                        <img
                                                            src={
                                                                c.companyLogo.startsWith('http')
                                                                    ? c.companyLogo
                                                                    : `${import.meta.env.VITE_API_URL}/uploads/logo/${c.companyLogo}`
                                                            }
                                                            alt={c.companyName}
                                                            className="w-full h-full object-contain p-0.5"
                                                        />
                                                    ) : (
                                                        <Building2 size={16} className="text-slate-400" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-slate-800 whitespace-nowrap">
                                                    {c.companyName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-500">{c.companyEmail || '—'}</td>
                                        <td className="px-5 py-3.5 text-slate-500">
                                            {c.industry?.name || c.industry || '—'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <StatusBadge status={c.status} />
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                                            {dayjs(c.createdAt).format('DD/MM/YYYY')}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                {c.status !== 'approved' && (
                                                    <button
                                                        disabled={updating === c._id}
                                                        onClick={() => updateStatus(c._id, 'approved')}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <CheckCircle size={13} /> Duyệt
                                                    </button>
                                                )}
                                                {c.status !== 'rejected' && (
                                                    <button
                                                        disabled={updating === c._id}
                                                        onClick={() => updateStatus(c._id, 'rejected')}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <XCircle size={13} /> Từ chối
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                                {companies.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center text-slate-400 py-12">
                                            Không tìm thấy công ty
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                        <span>
                            Trang <strong>{page}</strong> / {totalPages} &nbsp;·&nbsp; {total.toLocaleString()} kết quả
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(1)}
                                className="px-2 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-xs"
                            >
                                «
                            </button>
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                            >
                                <ChevronLeft size={15} />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`px-3 py-1.5 rounded-lg border text-xs ${p === page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                            >
                                <ChevronRight size={15} />
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(totalPages)}
                                className="px-2 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-xs"
                            >
                                »
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
