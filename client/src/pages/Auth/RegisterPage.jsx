import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { requestLoginGoogle } from '../../config/UserRequest';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Briefcase,
    User,
    Building2,
    ArrowRight,
    Phone,
    MapPin,
    ChevronDown,
    Users,
} from 'lucide-react';
import { authAPI } from '../../api/auth.api';
import axiosInstance from '../../api/axios';
import { message } from 'antd';

const COMPANY_SIZES = [
    { value: '1-10', label: '1 – 10 nhân viên' },
    { value: '11-50', label: '11 – 50 nhân viên' },
    { value: '51-200', label: '51 – 200 nhân viên' },
    { value: '201-500', label: '201 – 500 nhân viên' },
    { value: '500+', label: 'Trên 500 nhân viên' },
];

export default function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [industries, setIndustries] = useState([]);

    const location = useLocation();
    const defaultRole = location.state?.role || 'user';

    // role: 'user' (Candidate) or 'employer'
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        birthDay: '',
        gender: 'other',
        role: defaultRole,
        company: {
            companyName: '',
            taxCode: '',
            companyPhone: '',
            companyAddress: '',
            companySize: '',
            industry: '',
        },
    });

    // Fetch danh sách ngành nghề
    useEffect(() => {
        axiosInstance
            .get('/api/industries/list')
            .then((res) => {
                setIndustries(res.data?.metadata || []);
            })
            .catch(() => {});
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCompanyChange = (e) => {
        setFormData({
            ...formData,
            company: { ...formData.company, [e.target.name]: e.target.value },
        });
    };

    const handleRoleSelect = (selectedRole) => {
        setFormData({ ...formData, role: selectedRole });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const payload = {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                birthDay: formData.birthDay,
                gender: formData.gender,
                role: formData.role,
            };

            if (formData.role === 'employer') {
                if (!formData.company.companyName.trim()) {
                    message.error('Vui lòng nhập tên công ty');
                    setLoading(false);
                    return;
                }
                if (!formData.company.taxCode.trim()) {
                    message.error('Vui lòng nhập mã số thuế');
                    setLoading(false);
                    return;
                }
                payload.company = {
                    companyName: formData.company.companyName,
                    taxCode: formData.company.taxCode,
                    companyPhone: formData.company.companyPhone,
                    companyAddress: formData.company.companyAddress,
                    companySize: formData.company.companySize,
                    industry: formData.company.industry || null,
                };
            }

            await authAPI.register(payload);
            message.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (error) {
            message.error(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };
    //Code thêm
    const handleGoogleRegisterSuccess = async (response) => {
    const { credential } = response;

    try {
        const data = {
            credential,
        };

        const res = await requestLoginGoogle(data);

        message.success(res.message || 'Đăng ký bằng Google thành công!');

        setTimeout(() => {
            window.location.reload();
        }, 1000);

        navigate('/');
    } catch (error) {
        console.error('Google register failed', error);
        message.error('Đăng ký bằng Google thất bại.');
    }
};
//////////

    const isEmployer = formData.role === 'employer';

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left side: Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[520px] xl:w-[620px] lg:px-20 xl:px-24 py-12 lg:py-0">
                <div className="mx-auto w-full max-w-sm lg:w-[420px]">
                    {/* Brand */}
                    <div className="mb-8 text-center lg:text-left">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                                <Briefcase size={22} className="text-white" />
                            </div>
                            <span className="text-2xl font-bold text-slate-900">
                                Job<span className="text-indigo-600">24h</span>
                            </span>
                        </Link>
                        <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                            Mở khóa cơ hội
                            <br />
                            ngay hôm nay
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8">
                        {/* Option to use Google */}
                        <div style={{ marginTop: '20px' }}>
                            <GoogleOAuthProvider
                                clientId={'845739753727-khigu72oe3qaqi1lgutbohvrq7v6h56m.apps.googleusercontent.com'}
                            >
                                <GoogleLogin
                                    onSuccess={handleGoogleRegisterSuccess}
                                    onError={() => {
                                    console.log('Google Register Failed');
                                    message.error('Đăng ký bằng Google thất bại.');
                                    }}
                                />
                            </GoogleOAuthProvider>
                        </div>

                        <div className="mt-6 relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-slate-50 text-slate-500">Hoặc tiếp tục với email</span>
                            </div>
                        </div>

                        {/* Registration Form */}
                        <div className="mt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Role Selection Tabs */}
                                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
                                    <button
                                        type="button"
                                        onClick={() => handleRoleSelect('user')}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                            formData.role === 'user'
                                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50'
                                                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                        }`}
                                    >
                                        <User size={16} />
                                        Ứng viên
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRoleSelect('employer')}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                            formData.role === 'employer'
                                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50'
                                                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                        }`}
                                    >
                                        <Building2 size={16} />
                                        Nhà tuyển dụng
                                    </button>
                                </div>

                                {/* =================== THÔNG TIN CÁ NHÂN =================== */}
                                <div>
                                    <label
                                        htmlFor="fullName"
                                        className="block text-sm font-medium text-slate-700 mb-1.5"
                                    >
                                        Họ và tên
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            required
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all sm:text-sm text-slate-900 bg-white placeholder:text-slate-400"
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Địa chỉ Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all sm:text-sm text-slate-900 bg-white placeholder:text-slate-400"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-slate-700 mb-1.5"
                                    >
                                        Mật khẩu
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all sm:text-sm text-slate-900 bg-white placeholder:text-slate-400"
                                            placeholder="Tối thiểu 6 ký tự"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Phone + Birthday (chỉ hiện với ứng viên) */}
                                {!isEmployer && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label
                                                    htmlFor="phone"
                                                    className="block text-sm font-medium text-slate-700 mb-1.5"
                                                >
                                                    Số điện thoại
                                                </label>
                                                <input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="block w-full px-3 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all sm:text-sm text-slate-900 bg-white placeholder:text-slate-400"
                                                    placeholder="0912345678"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="birthDay"
                                                    className="block text-sm font-medium text-slate-700 mb-1.5"
                                                >
                                                    Ngày sinh
                                                </label>
                                                <input
                                                    id="birthDay"
                                                    name="birthDay"
                                                    type="date"
                                                    value={formData.birthDay}
                                                    onChange={handleChange}
                                                    className="block w-full px-3 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all sm:text-sm text-slate-900 bg-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Giới tính
                                            </label>
                                            <div className="flex gap-4">
                                                {['male', 'female', 'other'].map((g) => (
                                                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="gender"
                                                            value={g}
                                                            checked={formData.gender === g}
                                                            onChange={handleChange}
                                                            className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-600"
                                                        />
                                                        <span className="text-sm text-slate-700">
                                                            {g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : 'Khác'}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* =================== THÔNG TIN CÔNG TY (chỉ hiện với employer) =================== */}
                                {isEmployer && (
                                    <div className="space-y-4">
                                        {/* Divider */}
                                        <div className="flex items-center gap-3 pt-1">
                                            <div className="flex-1 border-t border-slate-200" />
                                            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-3 py-1 rounded-full flex items-center gap-1.5">
                                                <Building2 size={12} />
                                                Thông tin công ty
                                            </span>
                                            <div className="flex-1 border-t border-slate-200" />
                                        </div>

                                        {/* Tên công ty & Mã số thuế */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label
                                                    htmlFor="companyName"
                                                    className="block text-sm font-medium text-slate-700 mb-1.5"
                                                >
                                                    Tên công ty <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Building2 className="h-5 w-5 text-slate-400" />
                                                    </div>
                                                    <input
                                                        id="companyName"
                                                        name="companyName"
                                                        type="text"
                                                        required={isEmployer}
                                                        value={formData.company.companyName}
                                                        onChange={handleCompanyChange}
                                                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all sm:text-sm text-slate-900 bg-white placeholder:text-slate-400"
                                                        placeholder="Công ty TNHH ABC"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="taxCode"
                                                    className="block text-sm font-medium text-slate-700 mb-1.5"
                                                >
                                                    Mã số thuế <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Briefcase className="h-5 w-5 text-slate-400" />
                                                    </div>
                                                    <input
                                                        id="taxCode"
                                                        name="taxCode"
                                                        type="text"
                                                        required={isEmployer}
                                                        value={formData.company.taxCode}
                                                        onChange={handleCompanyChange}
                                                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all sm:text-sm text-slate-900 bg-white placeholder:text-slate-400"
                                                        placeholder="0123456789"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* SĐT + Địa chỉ công ty */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label
                                                    htmlFor="companyPhone"
                                                    className="block text-sm font-medium text-slate-700 mb-1.5"
                                                >
                                                    SĐT công ty
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Phone className="h-5 w-5 text-slate-400" />
                                                    </div>
                                                    <input
                                                        id="companyPhone"
                                                        name="companyPhone"
                                                        type="tel"
                                                        value={formData.company.companyPhone}
                                                        onChange={handleCompanyChange}
                                                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all sm:text-sm text-slate-900 bg-white placeholder:text-slate-400"
                                                        placeholder="024 1234 5678"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="companySize"
                                                    className="block text-sm font-medium text-slate-700 mb-1.5"
                                                >
                                                    Quy mô
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Users className="h-5 w-5 text-slate-400" />
                                                    </div>
                                                    <select
                                                        id="companySize"
                                                        name="companySize"
                                                        value={formData.company.companySize}
                                                        onChange={handleCompanyChange}
                                                        className="block w-full pl-10 pr-8 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all sm:text-sm text-slate-900 bg-white appearance-none"
                                                    >
                                                        <option value="">Chọn quy mô</option>
                                                        {COMPANY_SIZES.map((s) => (
                                                            <option key={s.value} value={s.value}>
                                                                {s.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Địa chỉ */}
                                        <div>
                                            <label
                                                htmlFor="companyAddress"
                                                className="block text-sm font-medium text-slate-700 mb-1.5"
                                            >
                                                Địa chỉ công ty
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MapPin className="h-5 w-5 text-slate-400" />
                                                </div>
                                                <input
                                                    id="companyAddress"
                                                    name="companyAddress"
                                                    type="text"
                                                    value={formData.company.companyAddress}
                                                    onChange={handleCompanyChange}
                                                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all sm:text-sm text-slate-900 bg-white placeholder:text-slate-400"
                                                    placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
                                                />
                                            </div>
                                        </div>

                                        {/* Ngành nghề */}
                                        {industries.length > 0 && (
                                            <div>
                                                <label
                                                    htmlFor="industry"
                                                    className="block text-sm font-medium text-slate-700 mb-1.5"
                                                >
                                                    Lĩnh vực hoạt động
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Briefcase className="h-5 w-5 text-slate-400" />
                                                    </div>
                                                    <select
                                                        id="industry"
                                                        name="industry"
                                                        value={formData.company.industry}
                                                        onChange={handleCompanyChange}
                                                        className="block w-full pl-10 pr-8 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all sm:text-sm text-slate-900 bg-white appearance-none"
                                                    >
                                                        <option value="">Chọn lĩnh vực</option>
                                                        {industries.map((ind) => (
                                                            <option key={ind._id} value={ind._id}>
                                                                {ind.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Note */}
                                        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
                                            ⚠️ Tài khoản nhà tuyển dụng sẽ được xét duyệt trước khi đăng tin tuyển dụng.
                                            Bạn có thể bổ sung thêm thông tin công ty sau khi đăng ký.
                                        </p>
                                    </div>
                                )}

                                <div className="mt-2 text-xs text-slate-500 leading-relaxed">
                                    Bằng việc nhấp vào Đăng ký, bạn đồng ý với{' '}
                                    <Link to="#" className="font-semibold text-indigo-600 hover:underline">
                                        Điều khoản dịch vụ
                                    </Link>{' '}
                                    và{' '}
                                    <Link to="#" className="font-semibold text-indigo-600 hover:underline">
                                        Chính sách bảo mật
                                    </Link>{' '}
                                    của chúng tôi.
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-indigo-200 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                    >
                                        {loading ? (
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                        ) : (
                                            <>
                                                Đăng ký miễn phí
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side: Image/Gradient Graphic */}
            <div className="hidden lg:flex relative flex-1 w-0 bg-slate-900 overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600 via-indigo-600 to-indigo-900 mix-blend-multiply" />

                {/* Abstract graphic */}
                <div className="absolute inset-0 p-20 flex flex-col justify-center text-white">
                    <div className="relative z-10 max-w-lg mb-12">
                        <h2 className="text-4xl font-bold mb-6 leading-tight">
                            Phát triển đội ngũ,
                            <br />
                            Xây dựng tương lai
                        </h2>
                        <p className="text-lg text-indigo-100 leading-relaxed opacity-90">
                            Kết nối với hàng triệu ứng viên tài năng. Giảm 50% thời gian tuyển dụng với sự hỗ trợ từ Trí
                            tuệ nhân tạo.
                        </p>
                    </div>

                    <div className="relative z-10 w-full max-w-md">
                        {/* Decorative floating UI cards */}
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl transform translate-x-12 -rotate-2 hover:rotate-0 transition-transform duration-500 relative z-20"></div>

                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl transform -translate-y-8 -translate-x-4 rotate-3 opacity-60">
                            <div className="w-3/4 h-3 bg-white/20 rounded-full mb-3"></div>
                            <div className="w-full h-3 bg-white/20 rounded-full mb-3"></div>
                            <div className="w-5/6 h-3 bg-white/20 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-cyan-400/30 rounded-full blur-3xl mix-blend-overlay"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/50 rounded-full blur-3xl mix-blend-overlay"></div>
            </div>
        </div>
    );
}
