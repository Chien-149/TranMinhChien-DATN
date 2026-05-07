import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layers, Upload, X, Save } from 'lucide-react';
import { message, Modal } from 'antd';
import { adminAPI } from '../../api/admin.api';

export default function IndustriesPage() {
    const [industries, setIndustries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: '', image: null });
    const fileRef = useRef();

    useEffect(() => {
        fetchIndustries();
    }, []);

    const fetchIndustries = () => {
        setLoading(true);
        adminAPI
            .getAllIndustries()
            .then((res) => setIndustries(res.data?.metadata || res.data?.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleCreate = async () => {
        if (!form.name.trim()) {
            message.error('Vui lòng nhập tên ngành nghề!');
            return;
        }
        setCreating(true);
        try {
            const fd = new FormData();
            fd.append('name', form.name);
            if (form.image) fd.append('image', form.image);
            await adminAPI.createIndustry(fd);
            message.success('Tạo ngành nghề thành công!');
            setShowModal(false);
            setForm({ name: '', image: null });
            fetchIndustries();
        } catch {
            message.error('Tạo ngành nghề thất bại!');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản Lý Ngành Nghề</h1>
                    <p className="text-slate-500 mt-1 text-sm">{industries.length} ngành nghề</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 text-sm"
                >
                    <Plus size={16} /> Thêm ngành
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
                                {['#', 'Ảnh', 'Tên ngành nghề', 'Số việc làm'].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence>
                                {industries.map((ind, i) => (
                                    <motion.tr
                                        key={ind._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-5 py-3.5 text-slate-400 text-xs w-10">{i + 1}</td>
                                        <td className="px-5 py-3.5 w-14">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {ind.image ? (
                                                    <img
                                                        src={
                                                            ind.image.startsWith('http')
                                                                ? ind.image
                                                                : `${import.meta.env.VITE_API_URL}/uploads/industries/${ind.image}`
                                                        }
                                                        alt={ind.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Layers size={18} className="text-indigo-300" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="font-semibold text-slate-800">{ind.name}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-500 text-sm">
                                            {ind.jobCount !== undefined ? `${ind.jobCount} việc làm` : '—'}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {industries.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center text-slate-400 py-12">
                                        <Layers size={32} className="text-slate-300 mx-auto mb-2" />
                                        <p>Chưa có ngành nghề nào</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            <Modal
                title={<span className="font-bold text-slate-800">Thêm Ngành Nghề Mới</span>}
                open={showModal}
                onCancel={() => {
                    setShowModal(false);
                    setForm({ name: '', image: null });
                }}
                footer={null}
                centered
                width={440}
            >
                <div className="mt-5 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Tên ngành nghề <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="VD: Công nghệ thông tin"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Ảnh đại diện</label>
                        <div
                            className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors relative"
                            onClick={() => fileRef.current?.click()}
                        >
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                            />
                            {form.image ? (
                                <div className="flex items-center gap-3">
                                    <img
                                        src={URL.createObjectURL(form.image)}
                                        alt="preview"
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-slate-800">{form.image.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {(form.image.size / 1024).toFixed(0)} KB
                                        </p>
                                    </div>
                                    <button
                                        className="ml-auto text-slate-400 hover:text-red-500"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setForm({ ...form, image: null });
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                    <Upload size={24} />
                                    <p className="text-sm">Nhấn để chọn ảnh</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={() => {
                                setShowModal(false);
                                setForm({ name: '', image: null });
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors text-sm"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                            {creating ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={14} /> Tạo mới
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
