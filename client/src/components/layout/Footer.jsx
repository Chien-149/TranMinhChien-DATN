import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin, Facebook, Youtube, Linkedin } from 'lucide-react';
import { useAuth } from '../../store/authStore';

const FOOTER_LINKS = {
    'Ứng viên': [
        { label: 'Tìm việc làm', href: '/jobs' },
        { label: 'Hồ sơ CV của tôi', href: '/my-cvs' },
        { label: 'Việc đã ứng tuyển', href: '/user/applications' },
        { label: 'Việc đã lưu', href: '/user/saved-jobs' },
    ],
    'Nhà tuyển dụng': [
        { label: 'Đăng tin tuyển dụng', href: '/company/jobs' },
        { label: 'Quản lý ứng viên', href: '/company/applications' },
        { label: 'Dashboard', href: '/company/dashboard' },
        { label: 'Gói tin đăng', href: '/company/wallet' },
    ],
    'Khám phá': [
        { label: 'Danh sách công ty', href: '/companies' },
        { label: 'Blog tìm việc', href: '/blog' },
        { label: 'Tất cả ngành nghề', href: '/jobs' },
        { label: 'Giới thiệu', href: '/about' },
        { label: 'Liên hệ', href: '/contact' },
    ],
};

export default function Footer() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLinkClick = async (e, title, href) => {
        const isUserSection = title === 'Ứng viên';
        const isEmployerSection = title === 'Nhà tuyển dụng';
        
        const publicLinks = ['/jobs', '/companies', '/blog'];
        if (publicLinks.includes(href)) {
            return; // Let the Link navigate normally for public routes
        }

        if (!user && (isUserSection || isEmployerSection)) {
            e.preventDefault();
            navigate('/login', { state: { from: href, role: isUserSection ? 'user' : 'employer' } });
        } else if (user) {
            if (isUserSection && user.role !== 'user' && user.role !== 'admin') {
                e.preventDefault();
                await logout();
                navigate('/login', { state: { from: href, role: 'user' } });
            } else if (isEmployerSection && user.role !== 'employer' && user.role !== 'admin') {
                e.preventDefault();
                await logout();
                navigate('/login', { state: { from: href, role: 'employer' } });
            }
        }
    };

    return (
        <footer className="bg-slate-900 text-slate-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
                {/* Top grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2.5 mb-4 w-fit">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                                <Briefcase size={18} className="text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">
                                Job
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                                    24h
                                </span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed mb-5 max-w-xs">
                            Nền tảng kết nối ứng viên và nhà tuyển dụng thông minh, sử dụng AI để tìm kiếm cơ hội việc
                            làm phù hợp nhất.
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-indigo-400 flex-shrink-0" />
                                <span>Hà Nội, Việt Nam</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-indigo-400 flex-shrink-0" />
                                <span>support@Job24h.vn</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-indigo-400 flex-shrink-0" />
                                <span>1800 - 6789</span>
                            </div>
                        </div>
                        {/* Socials */}
                        <div className="flex gap-3 mt-5">
                            {[
                                { icon: <Facebook size={17} />, href: 'https://www.facebook.com/chien.tranminh.3192' },
                                { icon: <Youtube size={17} />, href: 'https://www.youtube.com/@minhchien14-9' },
                                { icon: <Linkedin size={17} />, href: 'https://www.linkedin.com/jobs/' },
                            ].map((s, i) => (
                                <a
                                    key={i}
                                    href={s.href}
                                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Nav links */}
                    {Object.entries(FOOTER_LINKS).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="text-white text-sm font-semibold mb-4">{title}</h4>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            to={link.href}
                                            onClick={(e) => handleLinkClick(e, title, link.href)}
                                            className="text-sm hover:text-indigo-400 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Divider + bottom bar */}
                <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                        © {new Date().getFullYear()} Job24h. Bản quyền thuộc về Job24h Vietnam.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <Link to="/terms" className="hover:text-white transition-colors">
                            Điều khoản sử dụng
                        </Link>
                        <Link to="/privacy" className="hover:text-white transition-colors">
                            Chính sách bảo mật
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
