import { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, XCircle, Clock, Eye, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import { message, Modal } from 'antd';
import dayjs from 'dayjs';
import axiosInstance from '../../api/axios';

const API_URL = import.meta.env.VITE_API_URL;

function statusBadge(status) {
    switch (status) {
        case 'pending':
            return (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 text-xs font-semibold">
                    <Clock size={11} />
                    Chờ xử lý
                </span>
            );
        case 'interview':
            return (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold">
                    <Calendar size={11} />
                    Phỏng vấn
                </span>
            );
        case 'interview_success':
            return (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold">
                    <CheckCircle size={11} />
                    PV thành công
                </span>
            );
        case 'rejected':
            return (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-100 text-xs font-semibold">
                    <XCircle size={11} />
                    Từ chối
                </span>
            );
        default:
            return <span className="text-xs text-slate-400">{status}</span>;
    }
}

export default function CompanyApplications() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null); // detail modal
    const [acceptForm, setAcceptForm] = useState({ date: '', time: '', location: '', notes: '' });
    const [rejectForm, setRejectForm] = useState({ reason: '' });
    const [showAccept, setShowAccept] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [saving, setSaving] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = () => {
        setLoading(true);
        axiosInstance
            .get('/api/applications/list')
            .then((res) => setApps(res.data?.metadata || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleAccept = async () => {
        if (!acceptForm.date || !acceptForm.time || !acceptForm.location) {
            message.error('Vui lòng nhập ngày, giờ và địa điểm phỏng vấn!');
            return;
        }
        setSaving(true);
        try {
            await axiosInstance.post('/api/applications/accept', { cvId: selected._id, ...acceptForm });
            message.success('Đã mời phỏng vấn và gửi email cho ứng viên!');
            setShowAccept(false);
            setSelected(null);
            fetchApps();
        } catch {
            message.error('Thao tác thất bại!');
        } finally {
            setSaving(false);
        }
    };

    const handleReject = async () => {
        setSaving(true);
        try {
            await axiosInstance.post('/api/applications/reject', { cvId: selected._id, reason: rejectForm.reason });
            message.success('Đã từ chối và gửi email thông báo!');
            setShowReject(false);
            setSelected(null);
            fetchApps();
        } catch {
            message.error('Thao tác thất bại!');
        } finally {
            setSaving(false);
        }
    };

    const handleInterviewSuccess = async (appId) => {
        setSaving(true);
        try {
            await axiosInstance.post('/api/applications/interview-success', { cvId: appId });
            message.success('Đã đánh dấu phỏng vấn thành công!');
            setSelected(null);
            fetchApps();
        } catch {
            message.error('Thao tác thất bại!');
        } finally {
            setSaving(false);
        }
    };

    const filtered = filterStatus === 'all' ? apps : apps.filter((a) => a.status === filterStatus);

    const TABS = [
        { v: 'all', l: 'Tất cả', count: apps.length },
        { v: 'pending', l: 'Chờ xử lý', count: apps.filter((a) => a.status === 'pending').length },
        { v: 'interview', l: 'Phỏng vấn', count: apps.filter((a) => a.status === 'interview').length },
        {
            v: 'interview_success',
            l: 'PV thành công',
            count: apps.filter((a) => a.status === 'interview_success').length,
        },
        { v: 'rejected', l: 'Từ chối', count: apps.filter((a) => a.status === 'rejected').length },
    ];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Quản lý CV ứng tuyển</h1>
                <p className="text-slate-500 mt-1 text-sm">{apps.length} ứng viên đã nộp CV</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
                {TABS.map((tab) => (
                    <button
                        key={tab.v}
                        onClick={() => setFilterStatus(tab.v)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                            filterStatus === tab.v
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                        }`}
                    >
                        {tab.l}
                        <span
                            className={`text-xs px-1.5 py-0.5 rounded-md ${filterStatus === tab.v ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}
                        >
                            {tab.count}
                        </span>
                    </button>
                ))}
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
                                {['#', 'Ứng viên', 'Vị trí ứng tuyển', 'Ngày nộp', 'Trạng thái', 'CV', 'Thao tác'].map(
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
                            {filtered.map((app, i) => (
                                <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3.5 text-slate-400 text-xs w-8">{i + 1}</td>
                                    <td className="px-5 py-3.5">
                                        <p className="font-semibold text-slate-800">{app.fullName}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{app.email}</p>
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                                        {app.jobId?.title || '—'}
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                                        {dayjs(app.createdAt).format('DD/MM/YYYY')}
                                    </td>
                                    <td className="px-5 py-3.5">{statusBadge(app.status)}</td>
                                    <td className="px-5 py-3.5">
                                        {app.cvId ? (
                                            <a
                                                href={`${API_URL}/uploads/cv/${app.cvId}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-semibold text-xs"
                                            >
                                                <Download size={13} /> Tải CV
                                            </a>
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1.5">
                                            {/* Detail */}
                                            <button
                                                onClick={() => setSelected(app)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Chi tiết"
                                            >
                                                <Eye size={15} />
                                            </button>
                                            {/* Accept */}
                                            {app.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setSelected(app);
                                                            setAcceptForm({
                                                                date: '',
                                                                time: '',
                                                                location: '',
                                                                notes: '',
                                                            });
                                                            setShowAccept(true);
                                                        }}
                                                        className="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Mời phỏng vấn"
                                                    >
                                                        <CheckCircle size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelected(app);
                                                            setRejectForm({ reason: '' });
                                                            setShowReject(true);
                                                        }}
                                                        className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Từ chối"
                                                    >
                                                        <XCircle size={15} />
                                                    </button>
                                                </>
                                            )}
                                            {app.status === 'interview' && (
                                                <button
                                                    onClick={() => handleInterviewSuccess(app._id)}
                                                    className="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                                                    title="Đánh dấu phỏng vấn thành công"
                                                >
                                                    <CheckCircle size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-14 text-slate-400">
                                        <FileText size={36} className="text-slate-300 mx-auto mb-2" />
                                        <p className="font-medium">Không có CV nào</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detail modal */}
            <Modal
                title={<span className="font-bold text-slate-800">Chi tiết ứng viên</span>}
                open={!!selected && !showAccept && !showReject}
                onCancel={() => setSelected(null)}
                footer={null}
                centered
                width={520}
            >
                {selected && (
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl flex-shrink-0">
                                {selected.fullName?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-lg">{selected.fullName}</p>
                                <p className="text-sm text-indigo-600 font-medium">{selected.jobId?.title}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Mail size={14} className="text-slate-400" />
                                {selected.email}
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Phone size={14} className="text-slate-400" />
                                {selected.phone}
                            </div>
                            <div className="flex items-start gap-2 text-slate-600">
                                <FileText size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                <span className="whitespace-pre-wrap">{selected.coverLetter}</span>
                            </div>
                        </div>

                        {selected.interview && (
                            <div className="bg-indigo-50 rounded-xl p-4 space-y-1.5 text-sm border border-indigo-100">
                                <p className="font-semibold text-indigo-800 mb-2">Lịch phỏng vấn</p>
                                <div className="flex items-center gap-2 text-indigo-700">
                                    <Calendar size={13} />
                                    {dayjs(selected.interview.date).format('DD/MM/YYYY')} — {selected.interview.time}
                                </div>
                                <div className="flex items-center gap-2 text-indigo-700">
                                    <MapPin size={13} />
                                    {selected.interview.location}
                                </div>
                                {selected.interview.notes && (
                                    <p className="text-indigo-600 text-xs">{selected.interview.notes}</p>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 pt-1">
                            {selected.cvId && (
                                <a
                                    href={`${API_URL}/uploads/cv/${selected.cvId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                                >
                                    <Download size={14} /> Tải CV
                                </a>
                            )}
                            {selected.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setAcceptForm({ date: '', time: '', location: '', notes: '' });
                                            setShowAccept(true);
                                        }}
                                        className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors"
                                    >
                                        Mời phỏng vấn
                                    </button>
                                    <button
                                        onClick={() => {
                                            setRejectForm({ reason: '' });
                                            setShowReject(true);
                                        }}
                                        className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
                                    >
                                        Từ chối
                                    </button>
                                </>
                            )}
                            {selected.status === 'interview' && (
                                <button
                                    onClick={() => handleInterviewSuccess(selected._id)}
                                    disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors"
                                >
                                    Đánh dấu phỏng vấn thành công
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Accept / Invite interview modal */}
            <Modal
                title={<span className="font-bold text-slate-800">Mời phỏng vấn — {selected?.fullName}</span>}
                open={showAccept}
                onCancel={() => setShowAccept(false)}
                footer={null}
                centered
                width={460}
            >
                <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Ngày phỏng vấn <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={acceptForm.date}
                                onChange={(e) => setAcceptForm({ ...acceptForm, date: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Giờ <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                value={acceptForm.time}
                                onChange={(e) => setAcceptForm({ ...acceptForm, time: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Địa điểm <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={acceptForm.location}
                            onChange={(e) => setAcceptForm({ ...acceptForm, location: e.target.value })}
                            placeholder="VD: Tầng 5, 123 Nguyễn Huệ, Q1"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ghi chú</label>
                        <textarea
                            rows={3}
                            value={acceptForm.notes}
                            onChange={(e) => setAcceptForm({ ...acceptForm, notes: e.target.value })}
                            placeholder="Hướng dẫn thêm cho ứng viên..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-sm resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={() => setShowAccept(false)}
                            className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleAccept}
                            disabled={saving}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle size={14} /> Gửi lời mời
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Reject modal */}
            <Modal
                title={<span className="font-bold text-slate-800">Từ chối — {selected?.fullName}</span>}
                open={showReject}
                onCancel={() => setShowReject(false)}
                footer={null}
                centered
                width={440}
            >
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Lý do từ chối</label>
                        <textarea
                            rows={4}
                            value={rejectForm.reason}
                            onChange={(e) => setRejectForm({ reason: e.target.value })}
                            placeholder="Nêu lý do để ứng viên cải thiện hồ sơ..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-sm resize-none"
                        />
                    </div>
                    <p className="text-xs text-slate-400">Email thông báo sẽ được tự động gửi đến ứng viên.</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowReject(false)}
                            className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={saving}
                            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Xác nhận từ chối'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
