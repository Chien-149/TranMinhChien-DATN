import { useState, useEffect } from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Plus, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { message, Modal } from 'antd';
import dayjs from 'dayjs';
import { companyAPI } from '../../api/company.api';
import { useAuth } from '../../store/authStore';

function formatMoney(n) {
    return Number(n).toLocaleString('vi-VN') + ' đ';
}

function txStatusBadge(status) {
    if (status === 'success')
        return (
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                <CheckCircle size={13} />
                Thành công
            </span>
        );
    if (status === 'pending')
        return (
            <span className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                <Clock size={13} />
                Chờ xử lý
            </span>
        );
    if (status === 'cancelled')
        return (
            <span className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                <XCircle size={13} />
                Đã hủy
            </span>
        );
    return <span className="text-slate-400 text-xs">{status}</span>;
}

export default function CompanyWallet() {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTopUp, setShowTopUp] = useState(false);
    const [selectedPkg, setSelectedPkg] = useState(null);
    const [payMethod, setPayMethod] = useState('bank');
    const [topping, setTopping] = useState(false);
    const [payInfo, setPayInfo] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        Promise.all([companyAPI.getWallet(), companyAPI.getTransactions(), companyAPI.getTopUpPackages()])
            .then(([w, tx, pkg]) => {
                setWallet(w.data?.data);
                setTransactions(tx.data?.metadata || []);
                setPackages(pkg.data?.data || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleTopUp = async () => {
        if (!selectedPkg) {
            message.error('Vui lòng chọn gói nạp!');
            return;
        }
        setTopping(true);
        try {
            const data = {
                price: selectedPkg.amount,
                paymentMethod: payMethod,
            };
            if (payMethod === 'momo') {
                const res = await companyAPI.createTopUp(data);
                window.open(res.data.metadata.payUrl, '_blank');
            } else if (payMethod === 'vnpay') {
                const res = await companyAPI.createTopUp(data);
                window.open(res.data.metadata, '_blank');
            }

            message.success('Tạo yêu cầu nạp tiền thành công!');
        } catch {
            message.error('Tạo yêu cầu thất bại!');
        } finally {
            setTopping(false);
        }
    };

    if (loading)
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-7 h-7 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Ví & Nạp tiền</h1>
                <p className="text-slate-500 mt-1 text-sm">Quản lý số dư và lịch sử giao dịch</p>
            </div>

            {/* Wallet card */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-indigo-200 text-sm font-medium">Số dư hiện tại</p>
                        <p className="text-4xl font-bold mt-1">{formatMoney(user?.balance || 0)}</p>
                        <p className="text-indigo-200 text-xs mt-2">
                            Tổng nạp: {formatMoney(wallet?.totalTopUp || 0)} · Tổng chi:{' '}
                            {formatMoney(wallet?.totalSpent || 0)}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Wallet size={24} />
                    </div>
                </div>
                <button
                    onClick={() => {
                        setShowTopUp(true);
                        setPayInfo(null);
                    }}
                    className="mt-5 flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 font-semibold rounded-xl text-sm hover:bg-indigo-50 transition-colors"
                >
                    <Plus size={16} /> Nạp tiền ngay
                </button>
            </div>

            {/* Transaction history */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Lịch sử giao dịch</h3>
                    <button
                        onClick={() =>
                            companyAPI.getTransactions().then((r) => setTransactions(r.data?.data?.transactions || []))
                        }
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        <RefreshCw size={15} />
                    </button>
                </div>
                {transactions.length === 0 ? (
                    <p className="text-center text-slate-400 py-12 text-sm">Chưa có giao dịch nào</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {['Loại', 'Mô tả', 'Số tiền', 'Số dư sau', 'Ngày', 'Trạng thái'].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {transactions.map((tx) => (
                                <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        {tx.type === 'topup' ? (
                                            <ArrowUpCircle size={18} className="text-emerald-500" />
                                        ) : (
                                            <ArrowDownCircle size={18} className="text-red-400" />
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-600 text-sm max-w-xs truncate">
                                        {tx.description || '—'}
                                    </td>
                                    <td className="px-5 py-3.5 font-bold">
                                        <span className={tx.type === 'topup' ? 'text-emerald-600' : 'text-red-500'}>
                                            {tx.type === 'topup' ? '-' : '+'}
                                            {formatMoney(tx.amount)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500 text-sm">
                                        {tx.balanceAfter !== undefined ? formatMoney(tx.balanceAfter) : '—'}
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                                        {dayjs(tx.createdAt).format('DD/MM/YYYY HH:mm')}
                                    </td>
                                    <td className="px-5 py-3.5">{txStatusBadge(tx.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Top-up Modal */}
            <Modal
                title={<span className="font-bold text-slate-800">Nạp tiền vào ví</span>}
                open={showTopUp}
                onCancel={() => {
                    setShowTopUp(false);
                    setPayInfo(null);
                    setSelectedPkg(null);
                }}
                footer={null}
                centered
                width={520}
            >
                {!payInfo ? (
                    <div className="mt-4 space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Chọn gói nạp</label>
                            <div className="grid grid-cols-2 gap-3">
                                {packages.map((pkg) => (
                                    <button
                                        key={pkg.amount}
                                        onClick={() => setSelectedPkg(pkg)}
                                        className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                                            selectedPkg?.amount === pkg.amount
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-slate-200 bg-slate-50 hover:border-indigo-200'
                                        }`}
                                    >
                                        <p className="font-bold text-slate-800 text-base">{formatMoney(pkg.amount)}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Phương thức thanh toán
                            </label>
                            <div className="flex gap-3">
                                {[
                                    {
                                        v: 'momo',
                                        l: ' MoMo',
                                        url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTepW9oXtSheSZoOWbGZq577FcGgN50NTuvoQ&s',
                                    },
                                    {
                                        v: 'vnpay',
                                        l: 'VNPay',
                                        url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGqg3OFoapBc2qLOu-Fl6_Ep4vFlzqTdK5rA&s',
                                    },
                                ].map((m) => (
                                    <button
                                        key={m.v}
                                        onClick={() => setPayMethod(m.v)}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${payMethod === m.v ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500'}`}
                                    >
                                        <img src={m.url} alt={m.l} className="w-6 h-6" />
                                        {m.l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowTopUp(false)}
                                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleTopUp}
                                disabled={topping || !selectedPkg}
                                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {topping ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Tạo lệnh nạp'
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Payment info after creating top-up */
                    <div className="mt-4 space-y-4">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                            <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2" />
                            <p className="font-bold text-emerald-800">Yêu cầu nạp tiền đã được tạo!</p>
                            <p className="text-sm text-emerald-600 mt-1">
                                Vui lòng chuyển khoản theo thông tin bên dưới
                            </p>
                        </div>

                        {payInfo?.paymentInfo?.bankName && (
                            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Ngân hàng</span>
                                    <span className="font-semibold">{payInfo.paymentInfo.bankName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Số tài khoản</span>
                                    <span className="font-bold text-indigo-700">
                                        {payInfo.paymentInfo.accountNumber}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Tên tài khoản</span>
                                    <span className="font-semibold">{payInfo.paymentInfo.accountName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Số tiền</span>
                                    <span className="font-bold text-emerald-700">
                                        {formatMoney(payInfo.paymentInfo.amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Nội dung CK</span>
                                    <span className="font-semibold text-indigo-700">{payInfo.paymentInfo.content}</span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setShowTopUp(false);
                                setPayInfo(null);
                                setSelectedPkg(null);
                            }}
                            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm"
                        >
                            Đóng
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
