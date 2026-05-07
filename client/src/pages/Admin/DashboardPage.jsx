import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Building2,
    Briefcase,
    FileCheck,
    TrendingUp,
    TrendingDown,
    Clock,
    Star,
    AlertCircle,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { adminAPI } from '../../api/admin.api';

dayjs.extend(relativeTime);
dayjs.locale('vi');

function StatCard({ icon: Icon, label, value, growth, color, bg, delay = 0 }) {
    const isPositive = growth >= 0;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon size={22} className={color} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-500 truncate">{label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{value?.toLocaleString()}</p>
                <div
                    className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}
                >
                    {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    <span>{Math.abs(growth)}% tháng này</span>
                </div>
            </div>
        </motion.div>
    );
}

function RevenueChart({ data }) {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map((d) => d.amount), 1);
    const w = 100 / (data.length - 1);

    const points = data
        .map((d, i) => {
            const x = i * w;
            const y = 100 - (d.amount / max) * 85;
            return `${x},${y}`;
        })
        .join(' ');

    const areaPoints = `0,100 ${points} 100,100`;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-slate-800">Doanh thu 7 ngày</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Giao dịch qua Momo / VNPay</p>
                </div>
            </div>
            <div className="relative h-40">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <polygon points={areaPoints} fill="url(#areaGrad)" />
                    <polyline
                        points={points}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {data.map((d, i) => {
                        const x = i * w;
                        const y = 100 - (d.amount / max) * 85;
                        return (
                            <circle key={i} cx={x} cy={y} r="1.5" fill="#6366f1" vectorEffect="non-scaling-stroke" />
                        );
                    })}
                </svg>
            </div>
            <div className="flex justify-between mt-3">
                {data.map((d, i) => (
                    <div key={i} className="text-center">
                        <p className="text-[10px] text-slate-500">{d.day}</p>
                        {d.amount > 0 && (
                            <p className="text-[9px] text-indigo-600 font-semibold">
                                {d.amount >= 1000000
                                    ? `${(d.amount / 1000000).toFixed(1)}M`
                                    : `${(d.amount / 1000).toFixed(0)}k`}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function TopEmployersTable({ data }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Top Nhà Tuyển Dụng</h3>
            </div>
            <div className="divide-y divide-slate-50">
                {data?.map((emp, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors">
                        <span className="text-sm font-bold text-slate-400 w-5">{i + 1}</span>
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {emp.logo ? (
                                <img
                                    src={
                                        emp.logo.startsWith('http')
                                            ? emp.logo
                                            : `${import.meta.env.VITE_API_URL}/uploads/logo/${emp.logo}`
                                    }
                                    alt={emp.name}
                                    className="w-full h-full object-contain p-0.5"
                                />
                            ) : (
                                <Building2 size={14} className="text-slate-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{emp.name}</p>
                            <p className="text-xs text-slate-400 truncate">{emp.industry}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-indigo-600">{emp.jobs}</p>
                            <p className="text-[10px] text-slate-400">việc làm</p>
                        </div>
                    </div>
                ))}
                {!data?.length && <p className="text-center text-slate-400 text-sm py-8">Chưa có dữ liệu</p>}
            </div>
        </div>
    );
}

function RecentActivityFeed({ data }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Hoạt Động Gần Đây</h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                {data?.map((act, i) => (
                    <div key={i} className="flex items-start gap-3 px-6 py-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${act.color}`} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800">{act.title}</p>
                            <p className="text-xs text-slate-500 truncate">{act.name}</p>
                        </div>
                        <p className="text-[11px] text-slate-400 flex-shrink-0 flex items-center gap-1">
                            <Clock size={10} />
                            {dayjs(act.time).fromNow()}
                        </p>
                    </div>
                ))}
                {!data?.length && <p className="text-center text-slate-400 text-sm py-8">Chưa có hoạt động</p>}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminAPI
            .getStats()
            .then((res) => setData(res.data?.metadata))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const { stats, quickStats, weeklyRevenue, recentActivities, topEmployers } = data || {};

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Tổng Quan Hệ Thống</h1>
                <p className="text-slate-500 mt-1 text-sm">Dữ liệu thống kê theo thời gian thực</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Quick Stats Strip */}
                    {quickStats && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                            {[
                                {
                                    label: 'Chờ duyệt',
                                    value: quickStats.pendingApproval,
                                    color: 'bg-orange-50 text-orange-600 border-orange-100',
                                },
                                {
                                    label: 'Mới hôm nay',
                                    value: quickStats.newToday,
                                    color: 'bg-blue-50 text-blue-600 border-blue-100',
                                },
                                {
                                    label: 'Việc làm đang mở',
                                    value: quickStats.activeNow,
                                    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                                },
                                {
                                    label: 'Ứng tuyển tháng này',
                                    value: quickStats.completedThisMonth,
                                    color: 'bg-violet-50 text-violet-600 border-violet-100',
                                },
                            ].map((q, i) => (
                                <div key={i} className={`rounded-xl p-4 border text-center ${q.color}`}>
                                    <p className="text-2xl font-bold">{q.value?.toLocaleString()}</p>
                                    <p className="text-xs font-medium mt-0.5">{q.label}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Main Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                        <StatCard
                            icon={Users}
                            label="Ứng viên"
                            value={stats?.totalUsers}
                            growth={stats?.userGrowth || 0}
                            color="text-blue-600"
                            bg="bg-blue-50"
                            delay={0}
                        />
                        <StatCard
                            icon={Building2}
                            label="Công ty đã duyệt"
                            value={stats?.totalEmployers}
                            growth={stats?.userGrowth || 0}
                            color="text-violet-600"
                            bg="bg-violet-50"
                            delay={0.05}
                        />
                        <StatCard
                            icon={Briefcase}
                            label="Tổng việc làm"
                            value={stats?.totalJobs}
                            growth={stats?.jobGrowth || 0}
                            color="text-emerald-600"
                            bg="bg-emerald-50"
                            delay={0.1}
                        />
                        <StatCard
                            icon={FileCheck}
                            label="Đơn ứng tuyển"
                            value={stats?.totalApplications}
                            growth={stats?.revenueGrowth || 0}
                            color="text-amber-600"
                            bg="bg-amber-50"
                            delay={0.15}
                        />
                    </div>

                    {/* Pending Alert */}
                    {stats?.pendingJobs > 0 && (
                        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                            <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
                            <p className="text-sm text-amber-800">
                                Có <strong>{stats.pendingJobs}</strong> tin tuyển dụng đang chờ duyệt.
                            </p>
                        </div>
                    )}

                    {/* Charts + Activity */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                        <div className="xl:col-span-2">
                            <RevenueChart data={weeklyRevenue} />
                        </div>
                        <TopEmployersTable data={topEmployers} />
                    </div>

                    <RecentActivityFeed data={recentActivities} />
                </>
            )}
        </div>
    );
}
