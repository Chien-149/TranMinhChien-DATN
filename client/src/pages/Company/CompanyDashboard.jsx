import { useState, useEffect } from 'react';
import { Briefcase, Eye, FileText, Clock, TrendingUp, Users, Wallet } from 'lucide-react';
import { companyAPI } from '../../api/company.api';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import dayjs from 'dayjs';

function StatCard({ icon: Icon, label, value, color, sub }) {
    return (
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
            <div>
                <p className="text-slate-500 text-xs font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{value?.toLocaleString()}</p>
                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default function CompanyDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('all');
    const [customDate, setCustomDate] = useState('');
    const [customMonth, setCustomMonth] = useState('');

    useEffect(() => {
        setLoading(true);
        companyAPI
            .getDashboard({ timeRange, customDate, customMonth })
            .then((res) => setData(res.data?.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [timeRange, customDate, customMonth]);

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-7 h-7 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    const stats = data?.stats || {};
    const trend = data?.trendData || [];
    const recent = data?.recentApplications || [];
    const interviews = data?.upcomingInterviews || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Thống kê tổng quan</h1>
                    <p className="text-slate-500 mt-1 text-sm">Dữ liệu cập nhật theo thời gian thực</p>
                </div>
                <div className="flex items-center gap-3">
                    {timeRange === 'custom_date' && (
                        <input
                            type="date"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                        />
                    )}
                    {timeRange === 'custom_month' && (
                        <input
                            type="month"
                            value={customMonth}
                            onChange={(e) => setCustomMonth(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                        />
                    )}
                    <div className="relative">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all cursor-pointer shadow-sm hover:bg-slate-50"
                        >
                            <option value="today">Hôm nay</option>
                            <option value="month">Tháng này</option>
                            <option value="all">Tất cả thời gian</option>
                            <option value="custom_date">Theo ngày</option>
                            <option value="custom_month">Theo tháng</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    icon={Briefcase}
                    label="Tổng tin đăng"
                    value={stats.totalJobs || 0}
                    color="bg-indigo-500"
                    sub={`${stats.activeJobs ?? 0} đang hiển thị`}
                />
                <StatCard
                    icon={FileText}
                    label="Tổng ứng viên"
                    value={stats.totalApplications || 0}
                    color="bg-violet-500"
                    sub={`${stats.pendingApplications ?? 0} chờ xử lý`}
                />
                <StatCard icon={Eye} label="Lượt xem" value={stats.totalViews || 0} color="bg-sky-500" />
                <StatCard
                    icon={Wallet}
                    label="Số dư ví"
                    value={(stats.walletBalance || 0).toLocaleString('vi-VN') + ' đ'}
                    color="bg-emerald-500"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <h3 className="font-bold text-slate-800 mb-1">CV ứng tuyển (7 ngày)</h3>
                    <p className="text-xs text-slate-400 mb-4">Số lượng CV nhận được mỗi ngày</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={trend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: 12,
                                    border: 'none',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                                }}
                            />
                            <Bar dataKey="cv" name="CV" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <h3 className="font-bold text-slate-800 mb-1">Lượt xem tin (7 ngày)</h3>
                    <p className="text-xs text-slate-400 mb-4">Tổng lượt xem bài đăng mỗi ngày</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={trend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: 12,
                                    border: 'none',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="views"
                                name="Lượt xem"
                                stroke="#0ea5e9"
                                strokeWidth={2.5}
                                dot={{ fill: '#0ea5e9', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent applications & upcoming interviews */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {/* Recent */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Ứng viên mới nhất</h3>
                        <Users size={16} className="text-slate-400" />
                    </div>
                    {recent.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">Chưa có ứng viên nào</p>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {recent.map((app) => (
                                <div key={app._id} className="flex items-center gap-3 px-5 py-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                                        {app.userId?.fullName?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 text-sm truncate">
                                            {app.userId?.fullName}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate">{app.jobId?.title}</p>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {dayjs(app.createdAt).format('DD/MM')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming interviews */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Phỏng vấn sắp tới</h3>
                        <Clock size={16} className="text-slate-400" />
                    </div>
                    {interviews.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">Không có lịch phỏng vấn</p>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {interviews.map((app) => (
                                <div key={app._id} className="flex items-center gap-3 px-5 py-3">
                                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs flex-shrink-0">
                                        {app.userId?.fullName?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 text-sm truncate">
                                            {app.userId?.fullName}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate">{app.jobId?.title}</p>
                                    </div>
                                    <span className="text-xs bg-violet-50 text-violet-600 px-2 py-1 rounded-md font-medium">
                                        {app.interview?.date ? dayjs(app.interview.date).format('DD/MM') : 'TBD'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
