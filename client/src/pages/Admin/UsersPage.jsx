import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, Edit3, ChevronLeft, ChevronRight, X, Save, Users } from 'lucide-react';
import { message, Modal } from 'antd';
import dayjs from 'dayjs';
import { adminAPI } from '../../api/admin.api';
import { getImageUrl } from '../../utils/imageHelper';

const ROLES = ['user', 'employer', 'admin'];
const STATUSES = ['active', 'banned'];
const PAGE_SIZE = 10;

function RoleBadge({ role }) {
    const map = {
        admin: { color: 'bg-red-100 text-red-700', label: 'Quản trị viên' },
        employer: { color: 'bg-violet-100 text-violet-700', label: 'Nhà tuyển dụng' },
        user: { color: 'bg-blue-100 text-blue-700', label: 'Ứng viên' },
        candidate: { color: 'bg-blue-100 text-blue-700', label: 'Ứng viên' },
        company: { color: 'bg-violet-100 text-violet-700', label: 'Nhà tuyển dụng' },
    };
    const roleData = map[role] || { color: 'bg-slate-100 text-slate-600', label: role };
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${roleData.color}`}>
            {roleData.label}
        </span>
    );
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
            }`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {status === 'active' ? 'Hoạt động' : 'Đã khóa'}
        </span>
    );
}

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [editUser, setEditUser] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const debounceRef = useRef(null);

    const fetchUsers = useCallback((p, s) => {
        setLoading(true);
        adminAPI
            .getAllUsers({ page: p, limit: PAGE_SIZE, search: s })
            .then((res) => {
                const meta = res.data?.metadata;
                setUsers(meta?.data || []);
                setTotal(meta?.total || 0);
                setTotalPages(meta?.totalPages || 1);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchUsers(page, search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            fetchUsers(1, val);
        }, 400);
    };

    const openEdit = (u) => {
        setEditUser(u);
        setEditForm({ role: u.role, status: u.status || 'active' });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await adminAPI.updateUser(editUser._id, editForm);
            message.success('Cập nhật người dùng thành công!');
            setEditUser(null);
            fetchUsers(page, search);
        } catch {
            message.error('Cập nhật thất bại!');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await adminAPI.deleteUser(deleteTarget._id);
            message.success('Đã xóa người dùng!');
            setDeleteTarget(null);
            fetchUsers(page, search);
        } catch {
            message.error('Xóa thất bại!');
        }
    };

    const goPage = (p) => {
        setPage(p);
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Quản Lý Người Dùng</h1>
                <p className="text-slate-500 mt-1 text-sm">{total.toLocaleString()} người dùng trong hệ thống</p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex items-center gap-3">
                <Search size={18} className="text-slate-400" />
                <input
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-400"
                />
                {search && (
                    <button
                        onClick={() => {
                            setSearch('');
                            setPage(1);
                            fetchUsers(1, '');
                        }}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X size={16} />
                    </button>
                )}
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
                                    {['Người dùng', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map(
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
                                {users.map((u) => (
                                    <motion.tr
                                        key={u._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0 overflow-hidden">
                                                    {u.avatar ? (
                                                        <img
                                                            src={getImageUrl(u.avatar, 'avatars')}
                                                            alt={u.fullName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        u.fullName?.charAt(0)?.toUpperCase() || '?'
                                                    )}
                                                </div>
                                                <span className="font-medium text-slate-800 whitespace-nowrap">
                                                    {u.fullName || '(Chưa đặt tên)'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                                        <td className="px-5 py-3.5">
                                            <RoleBadge role={u.role} />
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <StatusBadge status={u.status || 'active'} />
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                                            {dayjs(u.createdAt).format('DD/MM/YYYY')}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEdit(u)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(u)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12">
                                            <Users size={32} className="text-slate-300 mx-auto mb-2" />
                                            <p className="text-slate-400">Không tìm thấy người dùng</p>
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
                                onClick={() => goPage(1)}
                                className="px-2 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-xs"
                            >
                                «
                            </button>
                            <button
                                disabled={page === 1}
                                onClick={() => goPage(page - 1)}
                                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                            >
                                <ChevronLeft size={15} />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => goPage(p)}
                                        className={`px-3 py-1.5 rounded-lg border text-xs ${p === page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            <button
                                disabled={page === totalPages}
                                onClick={() => goPage(page + 1)}
                                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                            >
                                <ChevronRight size={15} />
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => goPage(totalPages)}
                                className="px-2 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-xs"
                            >
                                »
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <Modal
                title={<span className="font-bold text-slate-800">Chỉnh sửa người dùng</span>}
                open={!!editUser}
                onCancel={() => setEditUser(null)}
                footer={null}
                centered
                width={440}
            >
                {editUser && (
                    <div className="mt-5 space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0 overflow-hidden">
                                {editUser.avatar ? (
                                    <img
                                        src={getImageUrl(editUser.avatar, 'avatars')}
                                        alt={editUser.fullName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    editUser.fullName?.charAt(0)?.toUpperCase()
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 text-sm">{editUser.fullName}</p>
                                <p className="text-xs text-slate-500">{editUser.email}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Vai trò</label>
                            <select
                                value={editForm.role}
                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                            >
                                {ROLES.map((r) => (
                                    <option key={r} value={r}>
                                        {{
                                            admin: 'Quản trị viên',
                                            employer: 'Nhà tuyển dụng',
                                            user: 'Ứng viên',
                                            company: 'Nhà tuyển dụng',
                                            candidate: 'Ứng viên',
                                        }[r] || r}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Trạng thái</label>
                            <select
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                            >
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s === 'active' ? 'Hoạt động' : 'Khóa'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setEditUser(null)}
                                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors text-sm"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save size={14} /> Lưu
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal
                title={<span className="font-bold text-slate-800">Xác nhận xóa</span>}
                open={!!deleteTarget}
                onCancel={() => setDeleteTarget(null)}
                footer={null}
                centered
                width={400}
            >
                {deleteTarget && (
                    <div className="mt-4">
                        <p className="text-sm text-slate-600">
                            Bạn chắc chắn muốn xóa người dùng <strong>{deleteTarget.fullName}</strong>? Hành động này
                            không thể hoàn tác.
                        </p>
                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors text-sm"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors text-sm"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
