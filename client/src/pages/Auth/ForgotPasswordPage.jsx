import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Briefcase,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    KeyRound,
    CheckCircle2,
} from 'lucide-react';
import { message } from 'antd';
import { requestForgotPassword, requestResetPassword } from '../../config/userRequest';

// ─── Step indicator ──────────────────────────────────────────────────────────
function StepIndicator({ step }) {
    const steps = [
        { label: 'Nhập email', icon: Mail },
        { label: 'Xác nhận OTP', icon: ShieldCheck },
        { label: 'Đặt mật khẩu', icon: KeyRound },
    ];
    return (
        <div className="flex items-center justify-center gap-0 mb-10">
            {steps.map((s, i) => {
                const Icon = s.icon;
                const active = i + 1 === step;
                const done = i + 1 < step;
                return (
                    <div key={i} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                    done
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : active
                                          ? 'bg-white border-indigo-600 text-indigo-600 shadow-md shadow-indigo-100'
                                          : 'bg-white border-slate-200 text-slate-300'
                                }`}
                            >
                                {done ? <CheckCircle2 size={18} /> : <Icon size={16} />}
                            </div>
                            <span
                                className={`mt-1.5 text-[11px] font-medium whitespace-nowrap ${
                                    active ? 'text-indigo-600' : done ? 'text-indigo-400' : 'text-slate-400'
                                }`}
                            >
                                {s.label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div
                                className={`w-12 h-0.5 mx-1 mb-4 transition-colors duration-300 ${
                                    done ? 'bg-indigo-500' : 'bg-slate-200'
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── OTP Input (6 boxes) ──────────────────────────────────────────────────────
function OtpInput({ value, onChange }) {
    const digits = value.split('');

    const handleChange = (idx, val) => {
        if (!/^\d?$/.test(val)) return;
        const arr = value.split('');
        arr[idx] = val;
        onChange(arr.join('').slice(0, 6));
        // Auto focus next
        if (val && idx < 5) {
            const next = document.getElementById(`otp-${idx + 1}`);
            if (next) next.focus();
        }
    };

    const handleKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
            const prev = document.getElementById(`otp-${idx - 1}`);
            if (prev) prev.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        onChange(paste.padEnd(6, '').slice(0, 6));
    };

    return (
        <div className="flex gap-3 justify-center">
            {Array.from({ length: 6 }).map((_, idx) => (
                <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[idx] || ''}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className="w-11 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all bg-white text-slate-900
                        border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                        caret-indigo-600"
                />
            ))}
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1
    const [email, setEmail] = useState('');

    // Step 2
    const [otp, setOtp] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    // Step 3
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // ── Step 1: Gửi email ────────────────────────────────────────────────
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) return;
        try {
            setLoading(true);
            await requestForgotPassword({ email });
            message.success('Mã OTP đã được gửi tới email của bạn!');
            setStep(2);
            startResendCooldown();
        } catch (error) {
            message.error(error.response?.data?.message || 'Email không tồn tại trong hệ thống.');
        } finally {
            setLoading(false);
        }
    };

    const startResendCooldown = () => {
        setResendCooldown(60);
        const interval = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        try {
            setLoading(true);
            await requestForgotPassword({ email });
            message.success('Đã gửi lại mã OTP!');
            startResendCooldown();
        } catch (error) {
            message.error('Gửi lại thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: Xác nhận OTP ─────────────────────────────────────────────
    const handleVerifyOtp = (e) => {
        e.preventDefault();
        if (otp.length < 6) {
            message.warning('Vui lòng nhập đủ 6 chữ số OTP.');
            return;
        }
        setStep(3);
    };

    // ── Step 3: Đặt mật khẩu mới ─────────────────────────────────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            message.warning('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (newPassword !== confirmPassword) {
            message.warning('Mật khẩu xác nhận không khớp.');
            return;
        }
        try {
            setLoading(true);
            await requestResetPassword({ otp, newPassword });
            message.success('Đặt lại mật khẩu thành công!');
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            const msg = error.response?.data?.message || 'Đặt lại mật khẩu thất bại.';
            if (msg.toLowerCase().includes('otp')) {
                message.error('Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.');
                setStep(2);
                setOtp('');
            } else {
                message.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left panel */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[520px] xl:w-[620px] lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    {/* Brand */}
                    <div className="mb-8 text-center lg:text-left">
                        <Link to="/" className="inline-flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                                <Briefcase size={22} className="text-white" />
                            </div>
                            <span className="text-2xl font-bold text-slate-900">
                                Job<span className="text-indigo-600">24h</span>
                            </span>
                        </Link>
                        <h2 className="text-3xl font-extrabold text-slate-900">Quên mật khẩu?</h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Đừng lo, chúng tôi sẽ giúp bạn lấy lại tài khoản trong vài bước đơn giản.
                        </p>
                    </div>

                    {/* Step Indicator */}
                    <StepIndicator step={step} />

                    {/* ─── Step 1: Nhập email ─── */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <div>
                                <label htmlFor="fp-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Địa chỉ Email đã đăng ký
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="fp-email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all sm:text-sm text-slate-900 bg-white placeholder:text-slate-400"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <p className="mt-1.5 text-xs text-slate-400">
                                    Mã OTP sẽ được gửi tới hộp thư của bạn.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-indigo-200 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (
                                    <svg
                                        className="animate-spin h-4 w-4 text-white"
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
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                ) : (
                                    <>
                                        Gửi mã OTP <ArrowRight size={16} />
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                                >
                                    <ArrowLeft size={14} /> Quay lại đăng nhập
                                </Link>
                            </div>
                        </form>
                    )}

                    {/* ─── Step 2: Nhập OTP ─── */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div>
                                <p className="text-sm text-slate-600 text-center mb-1">
                                    Nhập mã OTP đã được gửi tới
                                </p>
                                <p className="text-sm font-semibold text-indigo-600 text-center mb-6">{email}</p>
                                <OtpInput value={otp} onChange={setOtp} />
                                <div className="mt-4 text-center">
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resendCooldown > 0 || loading}
                                        className={`text-sm font-medium transition-colors ${
                                            resendCooldown > 0
                                                ? 'text-slate-400 cursor-not-allowed'
                                                : 'text-indigo-600 hover:text-indigo-700 cursor-pointer'
                                        }`}
                                    >
                                        {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã OTP'}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={otp.length < 6 || loading}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-indigo-200 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            >
                                Xác nhận OTP <ArrowRight size={16} />
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setOtp(''); }}
                                    className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                                >
                                    <ArrowLeft size={14} /> Thay đổi email
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ─── Step 3: Mật khẩu mới ─── */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            {/* New password */}
                            <div>
                                <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Mật khẩu mới
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="new-password"
                                        type={showNew ? 'text' : 'password'}
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all sm:text-sm text-slate-900 bg-white placeholder:text-slate-400"
                                        placeholder="Tối thiểu 6 ký tự"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                    >
                                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {/* Password strength bar */}
                                {newPassword && (
                                    <div className="mt-2 flex gap-1">
                                        {[1, 2, 3, 4].map((lvl) => {
                                            const strength =
                                                newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /\d/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword)
                                                    ? 4
                                                    : newPassword.length >= 8 && /[A-Z]/.test(newPassword)
                                                      ? 3
                                                      : newPassword.length >= 6
                                                        ? 2
                                                        : 1;
                                            const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
                                            return (
                                                <div
                                                    key={lvl}
                                                    className={`h-1.5 flex-1 rounded-full transition-all ${
                                                        lvl <= strength ? colors[strength - 1] : 'bg-slate-200'
                                                    }`}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Xác nhận mật khẩu
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="confirm-password"
                                        type={showConfirm ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`block w-full pl-10 pr-10 py-3 border rounded-xl outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 ${
                                            confirmPassword && confirmPassword !== newPassword
                                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                                                : 'border-slate-300 focus:ring-indigo-600/20 focus:border-indigo-600'
                                        }`}
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                    >
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {confirmPassword && confirmPassword !== newPassword && (
                                    <p className="mt-1 text-xs text-red-500">Mật khẩu không khớp.</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !newPassword || !confirmPassword}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-indigo-200 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (
                                    <svg
                                        className="animate-spin h-4 w-4 text-white"
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
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                ) : (
                                    <>
                                        Đặt lại mật khẩu <CheckCircle2 size={16} />
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                                >
                                    <ArrowLeft size={14} /> Quay lại nhập OTP
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Right panel – decorative */}
            <div className="hidden lg:block relative flex-1 w-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-cyan-600" />
                <div className="absolute inset-0 p-20 flex flex-col justify-center text-white">
                    <div className="relative z-10 max-w-lg mb-12">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8 shadow-xl">
                            <KeyRound size={32} className="text-white" />
                        </div>
                        <h2 className="text-4xl font-bold mb-6 leading-tight">
                            Bảo mật tài khoản
                            <br />
                            là ưu tiên hàng đầu
                        </h2>
                        <p className="text-lg text-indigo-100 leading-relaxed opacity-90">
                            Chúng tôi sử dụng mã OTP một lần có thời hạn để đảm bảo chỉ bạn mới có thể đặt lại mật
                            khẩu của mình.
                        </p>
                    </div>

                    {/* Security features cards */}
                    <div className="relative z-10 space-y-3">
                        {[
                            { icon: '🔐', text: 'Mã OTP hết hạn sau 5 phút' },
                            { icon: '📧', text: 'Gửi trực tiếp tới email đã đăng ký' },
                            { icon: '🛡️', text: 'Mã hoá an toàn với bcrypt' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-sm text-white/90"
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Decorative blobs */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/30 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-400/20 rounded-full blur-3xl" />
            </div>
        </div>
    );
}
