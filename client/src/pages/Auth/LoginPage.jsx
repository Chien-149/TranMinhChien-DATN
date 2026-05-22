import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Briefcase, ArrowRight } from 'lucide-react';
import { useAuth } from '../../store/authStore';
import { message } from 'antd';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { requestLoginGoogle } from '../../config/UserRequest';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await login(formData);
            message.success('Đăng nhập thành công!');
            // AppLayout sẽ tự redirect về đúng trang theo role
            navigate('/', { replace: true });
        } catch (error) {
            message.error(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = async (response) => {
        const { credential } = response; // Nhận ID Token từ Google
        try {
            const data = {
                credential,
            };
            const res = await requestLoginGoogle(data);
            message.success(res.message);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    // Placeholder for Google Login
    const handleGoogleLogin = () => {
        message.info('Tính năng Đăng nhập bằng Google đang phát triển.');
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left side: Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[500px] xl:w-[600px] lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    {/* Brand */}
                    <div className="mb-10 text-center lg:text-left">
                        <Link to="/" className="inline-flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                                <Briefcase size={22} className="text-white" />
                            </div>
                            <span className="text-2xl font-bold text-slate-900">
                                Job<span className="text-indigo-600">24h</span>
                            </span>
                        </Link>
                        <h2 className="text-3xl font-extrabold text-slate-900">Chào mừng trở lại</h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Bạn chưa có tài khoản?{' '}
                            <Link
                                to="/register"
                                // state={{ role }}
                                className="font-semibold text-indigo-600 hover:text-indigo-500"
                            >
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8">
                        {/* Option to use Google */}

                        <div style={{ marginTop: '20px' }}>
                            <GoogleOAuthProvider
                                clientId={'845739753727-khigu72oe3qaqi1lgutbohvrq7v6h56m.apps.googleusercontent.com'}
                            >
                                <GoogleLogin onSuccess={handleSuccess} onError={() => console.log('Login Failed')} />
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

                        {/* Email/Pass Form */}
                        <div className="mt-6">
                            <form onSubmit={handleSubmit} className="space-y-5">
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
                                            placeholder="••••••••"
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

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                                        />
                                        <label
                                            htmlFor="remember-me"
                                            className="ml-2 block text-sm text-slate-600 cursor-pointer"
                                        >
                                            Ghi nhớ đăng nhập
                                        </label>
                                    </div>

                                    <div className="text-sm">
                                        <Link
                                            to="/forgot-password"
                                            className="font-semibold text-indigo-600 hover:text-indigo-500"
                                        >
                                            Quên mật khẩu?
                                        </Link>
                                    </div>
                                </div>

                                <div>
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
                                                Đăng nhập
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
            <div className="hidden lg:block relative flex-1 w-0 bg-slate-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-cyan-600 mix-blend-multiply" />

                {/* Abstract shapes to replace standard photo */}
                <div className="absolute inset-0 p-20 flex flex-col justify-center text-white">
                    <div className="relative z-10 max-w-lg mb-12">
                        <h2 className="text-4xl font-bold mb-6 leading-tight">
                            Khám phá cơ hội
                            <br />
                            phát triển sự nghiệp
                        </h2>
                        <p className="text-lg text-indigo-100 leading-relaxed opacity-90">
                            Tham gia cùng hàng ngàn chuyên gia và công ty hàng đầu. Xây dựng hồ sơ của bạn và nhận những
                            cơ hội việc làm tốt nhất ngay hôm nay.
                        </p>
                    </div>

                    {/* Decorative glowing blobs UI element */}
                    <div className="relative z-10">
                        <div
                            className="absolute -top-10 -right-10 bg-gradient-to-tr from-cyan-400 to-blue-400 text-white font-bold px-4 py-2 rounded-xl shadow-xl transform rotate-12 rotate-in animate-bounce"
                            style={{ animationDuration: '3s' }}
                        >
                            Tuyển dụng ngay!
                        </div>
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/30 rounded-full blur-3xl mix-blend-overlay"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-400/20 rounded-full blur-3xl mix-blend-overlay"></div>
            </div>
        </div>
    );
}
