import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Building2,
    MapPin,
    Users,
    Globe,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    ChevronLeft,
    AlertCircle,
} from 'lucide-react';
import { companyAPI } from '../../api/company.api';
import { jobAPI } from '../../api/job.api';
import FollowCompanyButton from '../../components/FollowCompanyButton';
import dayjs from 'dayjs';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function formatSalary(min, max, negotiable) {
    if (negotiable) return 'Thỏa thuận';
    if (!min && !max) return 'Thỏa thuận';
    const fmt = (n) => (n >= 1000000 ? `${(n / 1000000).toFixed(0)}tr` : `${(n / 1000).toFixed(0)}k`);
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `Từ ${fmt(min)}`;
    return `Đến ${fmt(max)}`;
}

export default function PublicCompanyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        Promise.all([companyAPI.getById(id), jobAPI.search({ companyId: id, limit: 10 })])
            .then(([compRes, jobsRes]) => {
                setCompany(compRes.data?.data || compRes.data?.metadata);
                setJobs(jobsRes.data?.data?.jobs || []);
            })
            .catch((err) => {
                console.error(err);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6 text-rose-500">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy công ty</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">Công ty này không tồn tại hoặc đã bị xóa.</p>
                <button
                    onClick={() => navigate('/jobs')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                >
                    <ChevronLeft size={18} /> Quay lại trang chủ
                </button>
            </div>
        );
    }

    const coverUrl = company.companyCover
        ? company.companyCover.startsWith('http')
            ? company.companyCover
            : `${API_URL}/uploads/cover/${company.companyCover}`
        : 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600';

    const logoUrl = company.companyLogo
        ? company.companyLogo.startsWith('http')
            ? company.companyLogo
            : `${API_URL}/uploads/logo/${company.companyLogo}`
        : null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Cover Banner */}
            <div className="h-64 md:h-80 w-full relative">
                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 w-full">
                {/* Main Header Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100 mb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div className="flex flex-col md:flex-row gap-6 w-full">
                        {/* Logo */}
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl shadow-lg border-4 border-white flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                                <Building2 size={64} className="text-slate-300" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 pb-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                                {company.companyName}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 text-sm md:text-base mb-4">
                                {company.companyAddress && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={16} /> {company.companyAddress}
                                    </span>
                                )}
                                {company.companySize && (
                                    <span className="flex items-center gap-1.5">
                                        <Users size={16} /> {company.companySize} nhân viên
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Follow Button */}
                    <div className="flex-shrink-0 w-full md:w-auto">
                        <FollowCompanyButton
                            companyId={company._id}
                            companyName={company.companyName}
                            size="lg"
                            showCount
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Col: Info & Jobs */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Intro */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-3 border-slate-100">
                                Giới thiệu công ty
                            </h2>
                            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {company.companyDescription || 'Chưa có thông tin giới thiệu.'}
                            </div>
                        </div>

                        {/* Recruiting Jobs */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between border-b pb-3 border-slate-100 mb-6">
                                <h2 className="text-xl font-bold text-slate-800">Tuyển dụng hiện tại</h2>
                                <span className="text-sm font-semibold px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                                    {jobs.length} công việc
                                </span>
                            </div>

                            {jobs.length === 0 ? (
                                <p className="text-slate-500 text-center py-6">Hiện chưa có việc làm nào đang mở.</p>
                            ) : (
                                <div className="space-y-4">
                                    {jobs.map((job) => (
                                        <div
                                            key={job._id}
                                            onClick={() => navigate(`/jobs/${job._id}`)}
                                            className="group border border-slate-100 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row justify-between gap-4"
                                        >
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
                                                    {job.title}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                                                    <span>{job.location}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span className="font-semibold text-emerald-600">
                                                        {formatSalary(
                                                            job.salaryMin,
                                                            job.salaryMax,
                                                            job.salaryNegotiable,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 text-sm font-medium text-slate-400 self-start sm:self-center bg-slate-50 px-3 py-1.5 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                Ứng tuyển ngay
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Col: Details */}
                    <div className="space-y-6 flex-shrink-0">
                        {/* Basic Contact */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-5">Thông tin liên hệ</h3>
                            <div className="space-y-4">
                                {company.companyWebsite && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                            <Globe size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium">Website</p>
                                            <a
                                                href={company.companyWebsite}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm font-semibold text-indigo-600 hover:underline break-all"
                                            >
                                                {company.companyWebsite}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {company.companyEmail && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                            <Mail size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium">Email</p>
                                            <p className="text-sm font-semibold text-slate-700">
                                                {company.companyEmail}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {company.companyPhone && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium">Điện thoại</p>
                                            <p className="text-sm font-semibold text-slate-700">
                                                {company.companyPhone}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {company.foundedYear && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium">Năm thành lập</p>
                                            <p className="text-sm font-semibold text-slate-700">
                                                {company.foundedYear}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location mini map placeholder */}
                        {company.companyAddress && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Địa điểm làm việc</h3>
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                                    <MapPin size={20} className="text-rose-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                        {company.companyAddress}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
