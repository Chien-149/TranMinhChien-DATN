import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MapPin,
    Clock,
    Bookmark,
    BookmarkCheck,
    Briefcase,
    Building2,
    DollarSign,
    Share2,
    CheckCircle2,
    CalendarDays,
    GraduationCap,
    Users,
    ChevronLeft,
    AlertCircle,
    Zap,
    Send,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { message, Modal } from 'antd';
import { jobAPI } from '../../api/job.api';
import { industriesAPI } from '../../api/industries.api';
import { applicationAPI } from '../../api/application.api';
import { useAuth } from '../../store/authStore';
import BookmarkButton from '../../components/BookmarkButton';
import FollowCompanyButton from '../../components/FollowCompanyButton';
import { requestGetMyFavourites } from '../../config/bookmarkAndFollowRequest';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const JOB_TYPE_LABELS = {
    'full-time': { label: 'Toàn thời gian', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    'part-time': { label: 'Bán thời gian', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    internship: { label: 'Thực tập', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    contract: { label: 'Hợp đồng', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    freelance: { label: 'Freelance', color: 'bg-purple-50 text-purple-700 border-purple-100' },
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function formatSalary(min, max, negotiable) {
    if (negotiable) return 'Thỏa thuận';
    if (!min && !max) return 'Thỏa thuận';
    const fmt = (n) => {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} triệu`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
        return `${n}`;
    };
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `Từ ${fmt(min)}`;
    if (max) return `Đến ${fmt(max)}`;
    return 'Thỏa thuận';
}

export default function JobDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(false);

    // Extensions
    const [relatedJobs, setRelatedJobs] = useState([]);
    const [industries, setIndustries] = useState([]);

    // Application Modal State
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [applyLoading, setApplyLoading] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [applyForm, setApplyForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        coverLetter: '',
        cvFile: null,
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        // increment count on view
        jobAPI
            .getById(id, true)
            .then((res) => {
                const jobData = res.data?.metadata || res.data?.data;
                setJob(jobData);

                // Fetch extra stuff below to prevent slowing down primary job data
                jobAPI
                    .getList()
                    .then((resJobs) => {
                        const allJobs = resJobs.data?.metadata || [];
                        const filtered = allJobs
                            .filter((j) => j._id !== id && j.category?._id === jobData.category?._id)
                            .slice(0, 4);

                        if (filtered.length < 4) {
                            const more = allJobs
                                .filter((j) => j._id !== id && !filtered.find((f) => f._id === j._id))
                                .slice(0, 4 - filtered.length);
                            filtered.push(...more);
                        }
                        setRelatedJobs(filtered);
                    })
                    .catch(() => {});

                industriesAPI
                    .getAll()
                    .then((resInd) => {
                        const allInd = resInd.data?.metadata || [];
                        setIndustries(allInd.sort(() => 0.5 - Math.random()).slice(0, 6)); // 6 random
                    })
                    .catch(() => {});

                if (user && user.role === 'user') {
                    applicationAPI
                        .getJobsByUser()
                        .then((aRes) => {
                            const applications = aRes.data?.metadata || aRes.data?.data || [];
                            const alreadyApplied = applications.some(
                                (app) => app.jobId?._id === id || app.jobId === id,
                            );
                            setHasApplied(alreadyApplied);
                        })
                        .catch((err) => console.error('Could not fetch user applications:', err));
                }
            })
            .catch((err) => {
                console.error(err);
                setError(true);
            })
            .finally(() => setLoading(false));

        // Check if user already saved this job
        if (typeof requestGetMyFavourites === 'function') {
            requestGetMyFavourites()
                .then((res) => {
                    const ids = new Set((res.metadata || []).map((f) => f.jobId?._id || f.jobId));
                    setSaved(ids.has(id));
                })
                .catch(() => {});
        }
    }, [id]);

    const handleApply = () => {
        if (!user) {
            message.warning('Vui lòng đăng nhập để ứng tuyển!');
            navigate('/login', { state: { from: `/jobs/${id}` } });
            return;
        }
        if (user.role !== 'user') {
            message.error('Chỉ ứng viên mới có thể ứng tuyển việc làm!');
            return;
        }

        // Auto-fill basic data from user profile
        setApplyForm({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            coverLetter: '',
            cvFile: null,
        });
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const isPdf = file.type === 'application/pdf';
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isPdf) {
                message.error('Chỉ chấp nhận file PDF!');
                return;
            }
            if (!isLt5M) {
                message.error('Kích thước file phải nhỏ hơn 5MB!');
                return;
            }
            setApplyForm({ ...applyForm, cvFile: file });
        }
    };

    const submitApplication = async () => {
        if (
            !applyForm.fullName ||
            !applyForm.email ||
            !applyForm.phone ||
            !applyForm.coverLetter ||
            !applyForm.cvFile
        ) {
            message.error('Vui lòng điền đầy đủ thông tin và tải lên CV!');
            return;
        }

        setApplyLoading(true);
        try {
            const formData = new FormData();
            formData.append('jobId', job._id);
            formData.append('companyId', job.companyId._id);
            formData.append('fullName', applyForm.fullName);
            formData.append('email', applyForm.email);
            formData.append('phone', applyForm.phone);
            formData.append('coverLetter', applyForm.coverLetter);
            formData.append('cvFile', applyForm.cvFile);

            await applicationAPI.applyForJob(formData);
            message.success('Ứng tuyển thành công! Nhà tuyển dụng sẽ sớm liên hệ với bạn.');
            setIsModalOpen(false);
            setHasApplied(true);
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi nộp hồ sơ, vui lòng thử lại!');
        } finally {
            setApplyLoading(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        message.success('Đã sao chép đường dẫn thành công!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 pt-24 pb-12 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Đang tải thông tin việc làm...</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-slate-50 pt-32 pb-12 px-4 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6 text-rose-500">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy việc làm</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                    Việc làm này có thể đã hết hạn, bị gỡ bỏ hoặc bạn không có quyền truy cập.
                </p>
                <button
                    onClick={() => navigate('/jobs')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                >
                    <ChevronLeft size={18} /> Quay lại danh sách
                </button>
            </div>
        );
    }

    const company = job.companyId || {};
    const companyLogoSrc = company.companyLogo
        ? company.companyLogo.startsWith('http')
            ? company.companyLogo
            : `${API_URL}/uploads/logo/${company.companyLogo}`
        : null;
    const typeInfo = JOB_TYPE_LABELS[job.type] || {
        label: job.type,
        color: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    const daysLeft = job.deadline ? dayjs(job.deadline).diff(dayjs(), 'day') : null;
    const isExpired = daysLeft !== null && daysLeft < 0;

    return (
        <div className="min-h-screen bg-slate-50 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-6 group outline-none"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Quay lại
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Job Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm"
                        >
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span
                                    className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border ${typeInfo.color}`}
                                >
                                    {typeInfo.label}
                                </span>
                                {job.category && (
                                    <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                        {job.category.name}
                                    </span>
                                )}
                                {job.isBoosted && (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100 shadow-sm shadow-orange-100/50">
                                        <Zap size={13} className="fill-orange-500" /> Nổi bật
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6 leading-tight">
                                {job.title}
                            </h1>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                        <DollarSign size={16} /> Mức lương
                                    </div>
                                    <div className="font-bold text-indigo-600 text-[15px]">
                                        {formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                        <MapPin size={16} /> Địa điểm
                                    </div>
                                    <div className="font-semibold text-slate-800 text-[15px] truncate">
                                        {job.location}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                        <Briefcase size={16} /> Kinh nghiệm
                                    </div>
                                    <div className="font-semibold text-slate-800 text-[15px] truncate">
                                        {job.experience || 'Không yêu cầu'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                        <Clock size={16} /> Hạn nộp
                                    </div>
                                    <div className="font-semibold text-slate-800 text-[15px]">
                                        {job.deadline ? dayjs(job.deadline).format('DD/MM/YYYY') : 'Không có'}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
                                <button
                                    onClick={handleApply}
                                    disabled={isExpired || hasApplied}
                                    className={`flex-1 flex justify-center items-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white transition-all shadow-md ${
                                        isExpired || hasApplied
                                            ? 'bg-slate-300 shadow-none cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 active:scale-[0.98]'
                                    }`}
                                >
                                    <Send
                                        size={20}
                                        className={isExpired || hasApplied ? '' : 'animate-bounce-subtle'}
                                    />
                                    {isExpired
                                        ? 'Đã hết hạn ứng tuyển'
                                        : hasApplied
                                          ? 'Đã ứng tuyển'
                                          : 'Ứng tuyển ngay'}
                                </button>

                                <BookmarkButton jobId={job._id} defaultSaved={saved} size="lg" onToggle={setSaved} />

                                <button
                                    onClick={handleShare}
                                    className="flex justify-center items-center w-auto sm:w-14 py-3.5 px-4 rounded-xl font-semibold border-2 border-slate-200 text-slate-500 hover:bg-slate-100 transition-all sm:px-0"
                                    title="Chia sẻ"
                                >
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </motion.div>

                        {/* Content Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-8"
                        >
                            {/* Mô tả */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <CheckCircle2 size={20} className="text-indigo-500" />
                                    Mô tả công việc
                                </h3>
                                <div className="prose prose-slate max-w-none text-[15px] prose-p:leading-relaxed prose-li:my-1 text-slate-600 whitespace-pre-wrap">
                                    {job.description || 'Chưa có thông tin mô tả chi tiết.'}
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Yêu cầu */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <GraduationCap size={20} className="text-indigo-500" />
                                    Yêu cầu ứng viên
                                </h3>
                                <div className="prose prose-slate max-w-none text-[15px] prose-p:leading-relaxed prose-li:my-1 text-slate-600 whitespace-pre-wrap">
                                    {job.requirements || 'Chưa có thông tin yêu cầu chi tiết.'}
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Quyền lợi */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <DollarSign size={20} className="text-indigo-500" />
                                    Quyền lợi
                                </h3>
                                <div className="prose prose-slate max-w-none text-[15px] prose-p:leading-relaxed prose-li:my-1 text-slate-600 whitespace-pre-wrap">
                                    {job.benefits || 'Chưa có thông tin quyền lợi chi tiết.'}
                                </div>
                            </div>

                            {/* Skills (if any) */}
                            {job.skills && job.skills.length > 0 && (
                                <>
                                    <hr className="border-slate-100" />
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-3">Kỹ năng chuyên môn</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {job.skills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                        {relatedJobs.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5"
                            >
                                <h3 className="font-bold text-slate-900 text-[15px] mb-2">Việc làm tương tự</h3>
                                <div className="space-y-4">
                                    {relatedJobs.map((rj) => {
                                        const comp = rj.companyId || {};
                                        return (
                                            <Link to={`/jobs/${rj._id}`} key={rj._id} className="block group">
                                                <div className="flex gap-3">
                                                    <div className="w-12 h-12 rounded-xl border border-slate-100 bg-slate-50 p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden transition-colors group-hover:border-indigo-200">
                                                        {comp.companyLogo ? (
                                                            <img
                                                                src={
                                                                    comp.companyLogo.startsWith('http')
                                                                        ? comp.companyLogo
                                                                        : `${API_URL}/uploads/logo/${comp.companyLogo}`
                                                                }
                                                                alt={comp.companyName}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        ) : (
                                                            <Building2 size={20} className="text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                            {rj.title}
                                                        </h4>
                                                        <div className="text-[13px] text-slate-500 truncate mt-0.5">
                                                            {comp.companyName || 'Công ty ẩn danh'}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1.5 text-[12px] font-medium text-slate-500">
                                                            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                                                <DollarSign size={13} />
                                                                {formatSalary(
                                                                    rj.salaryMin,
                                                                    rj.salaryMax,
                                                                    rj.salaryNegotiable,
                                                                )}
                                                            </span>
                                                            <span className="flex items-center gap-1 truncate">
                                                                <MapPin size={13} /> {rj.location}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Company & Summary */}
                    <div className="space-y-6">
                        {/* Company Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center"
                        >
                            <Link
                                to={`/companies/${company._id}`}
                                className="block relative w-24 h-24 mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-2 group hover:shadow-md transition-shadow"
                            >
                                {companyLogoSrc ? (
                                    <img
                                        src={companyLogoSrc}
                                        alt={company.companyName}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Building2 size={36} />
                                    </div>
                                )}
                            </Link>

                            <h3 className="text-[17px] font-bold text-slate-900 mb-1 leading-tight hover:text-indigo-600 transition-colors">
                                <Link to={`/companies/${company._id}`}>{company.companyName || 'Công ty ẩn danh'}</Link>
                            </h3>

                            <p className="text-sm text-slate-500 mb-6 flex items-center justify-center gap-1">
                                <Users size={14} /> {company.companySize || 'Đang cập nhật quy mô'} nhân viên
                            </p>

                            <div className="w-full space-y-3">
                                <FollowCompanyButton
                                    companyId={company._id}
                                    companyName={company.companyName}
                                    className="w-full"
                                    showCount
                                />

                                <Link
                                    to={`/companies/${company._id}`}
                                    className="block w-full py-2.5 rounded-xl border-2 border-slate-100 text-sm font-semibold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-center"
                                >
                                    Xem trang công ty
                                </Link>
                            </div>
                        </motion.div>

                        {/* General Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                        >
                            <h3 className="font-bold text-slate-900 mb-5 text-[15px]">Thông tin chung</h3>

                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                                        <Briefcase size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-0.5">Cấp bậc</p>
                                        <p className="text-sm font-semibold text-slate-800">Nhân viên / Chuyên viên</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                                        <CalendarDays size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-0.5">Ngày đăng</p>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {dayjs(job.createdAt).format('DD/MM/YYYY')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                                        <Users size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-0.5">Hồ sơ đã nộp</p>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {job.applicants || 0} hồ sơ
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Danh mục Nghề liên quan */}
                        {industries.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                            >
                                <h3 className="font-bold text-slate-900 mb-4 text-[15px]">Danh mục liên quan</h3>
                                <div className="flex flex-wrap gap-2">
                                    {industries.map((ind) => (
                                        <Link
                                            key={ind._id}
                                            to={`/jobs?category=${ind._id}`}
                                            className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg text-[13px] font-medium hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-colors"
                                        >
                                            {ind.name}
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Việc làm liên quan */}
                    </div>
                </div>
            </div>

            {/* APPLICATION MODAL */}
            <Modal
                title={<span className="text-xl font-bold text-slate-800">Ứng tuyển việc làm</span>}
                open={isModalOpen}
                onCancel={() => !applyLoading && setIsModalOpen(false)}
                footer={null}
                width={600}
                centered
                className="application-modal"
            >
                <div className="mt-6 space-y-4">
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl mb-6">
                        <p className="font-semibold text-slate-800 line-clamp-1">{job.title}</p>
                        <p className="text-sm text-slate-600 truncate mt-1">{company.companyName}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={applyForm.fullName}
                                onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })}
                                placeholder="Nhập họ và tên đầy đủ"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">
                                Số điện thoại <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={applyForm.phone}
                                onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                                placeholder="Nhập số điện thoại"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">
                            Email liên hệ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={applyForm.email}
                            onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                            placeholder="Nhập địa chỉ email"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">
                            Thư giới thiệu (Cover Letter) <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={applyForm.coverLetter}
                            onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                            placeholder="Viết đôi dòng giới thiệu bản thân và lý do bạn phù hợp với công việc này..."
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm resize-none"
                        ></textarea>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">
                            CV / Hồ sơ đính kèm <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 hover:border-indigo-300 transition-colors relative">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {applyForm.cvFile ? (
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{applyForm.cvFile.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {(applyForm.cvFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <p className="text-xs text-indigo-600 mt-1 font-medium select-none">
                                        Nhấn để chọn file thay thế
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 text-slate-500 pointer-events-none">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-1">
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" x2="12" y1="3" y2="15" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700">
                                        Tải lên file PDF từ máy tính của bạn
                                    </p>
                                    <p className="text-xs">Kích thước tối đa 5MB</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={() => setIsModalOpen(false)}
                        disabled={applyLoading}
                        className="px-6 py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={submitApplication}
                        disabled={applyLoading}
                        className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center gap-2 min-w-[140px] justify-center"
                    >
                        {applyLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Nộp hồ sơ'
                        )}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
