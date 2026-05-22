import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Package, Pencil, Trash2, X, Save, DollarSign, Clock } from 'lucide-react';
import { message, Modal } from 'antd';
import { adminAPI } from '../../api/admin.api';

const EMPTY_FORM = { name: '', price: '', description: '', durationDays: '' };

function formatPrice(p) {
    return Number(p).toLocaleString('vi-VN') + ' đ';
}

export default function PackagesPage() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => { fetchPackages(); }, []);

    const fetchPackages = () => {
        setLoading(true);
        adminAPI.getAllPackages()
            .then((res) => setPackages(res.data?.metadata || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setEditMode(false);
        setEditId(null);
        setShowModal(true);
    };

    const openEdit = (pkg) => {
        setForm({
            name: pkg.name,
            price: pkg.price,
            description: pkg.description || '',
            durationDays: pkg.durationDays,
        });
        setEditMode(true);
        setEditId(pkg._id);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.price || !form.durationDays) {
            message.error('Vui lòng điền đầy đủ tên, giá và số ngày!');
            return;
        }
        setSaving(true);
        try {
            if (editMode) {
                await adminAPI.updatePackage(editId, {
                    name: form.name,
                    price: Number(form.price),
                    description: form.description,
                    durationDays: Number(form.durationDays),
                });
                message.success('Cập nhật gói dịch vụ thành công!');
            } else {
                await adminAPI.createPackage({
                    name: form.name,
                    price: Number(form.price),
                    description: form.description,
                    durationDays: Number(form.durationDays),
                });
                message.success('Tạo gói dịch vụ thành công!');
            }
            setShowModal(false);
            fetchPackages();
        } catch {
            message.error(editMode ? 'Cập nhật gói dịch vụ thất bại!' : 'Tạo gói dịch vụ thất bại!');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await adminAPI.deletePackage(deleteTarget._id);
            message.success('Đã xóa gói dịch vụ!');
            setDeleteTarget(null);
            fetchPackages();
        } catch {
            message.error('Xóa thất bại!');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản Lý Gói Dịch Vụ</h1>
                    <p className="text-slate-500 mt-1 text-sm">{packages.length} gói đang hoạt động</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 text-sm"
                >
                    <Plus size={16} /> Thêm gói
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-7 h-7 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap w-10">#</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Tên gói</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Giá</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Thời hạn</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Mô tả</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {packages.map((pkg, i) => (
                                <motion.tr
                                    key={pkg._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="hover:bg-slate-50 transition-colors"
                                >
                                    <td className="px-5 py-3.5 text-slate-400 text-xs">{i + 1}</td>
                                    <td className="px-5 py-3.5 font-semibold text-slate-800">{pkg.name}</td>
                                    <td className="px-5 py-3.5">
                                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100 flex items-center w-max gap-1">
                                            <DollarSign size={12} />
                                            {formatPrice(pkg.price)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-bold border border-indigo-100 flex items-center w-max gap-1">
                                            <Clock size={12} />
                                            {pkg.durationDays} ngày
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500 text-sm max-w-xs truncate">{pkg.description || '—'}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEdit(pkg)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(pkg)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {packages.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center text-slate-400 py-12">
                                        <Package size={32} className="text-slate-300 mx-auto mb-2" />
                                        <p>Chưa có gói dịch vụ nào</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create / Edit Modal */}
            <Modal
                title={<span className="font-bold text-slate-800">{editMode ? 'Cập Nhật Gói Dịch Vụ' : 'Thêm Gói Dịch Vụ Mới'}</span>}
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={null}
                centered
                width={480}
            >
                <div className="mt-5 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên gói <span className="text-red-500">*</span></label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="VD: Gói Cơ Bản"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Giá (VNĐ) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                placeholder="VD: 99000"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số ngày <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                value={form.durationDays}
                                onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                                placeholder="VD: 30"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả</label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Mô tả ngắn về gói dịch vụ..."
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-sm resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors text-sm">Hủy</button>
                        <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center gap-2">
                            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={14} /> {editMode ? 'Cập nhật' : 'Tạo mới'}</>}
                        </button>
                    </div>
                </div>
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
                            Bạn chắc chắn muốn xóa gói dịch vụ <strong>{deleteTarget.name}</strong>? Hành động này không thể hoàn tác.
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
