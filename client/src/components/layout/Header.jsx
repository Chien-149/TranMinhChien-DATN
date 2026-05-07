import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    Building2,
    FileText,
    Bot,
    Menu,
    X,
    Search,
    Bell,
    MessageSquare,
    ChevronDown,
    LogOut,
    User,
    LayoutDashboard,
    BookmarkCheck,
    ClipboardList,
    Settings,
    Wallet,
    Plus,
    Shield,
} from 'lucide-react';
import { useAuth } from '../../store/authStore';
import { Dropdown, Badge, Avatar, Tooltip } from 'antd';
import NotificationBell from '../NotificationBell';

const navLinks = [
    { label: 'Việc làm', href: '/jobs', icon: <Briefcase size={16} /> },
    { label: 'Công ty', href: '/companies', icon: <Building2 size={16} /> },
    { label: 'Blog', href: '/blog', icon: <FileText size={16} /> },
];

const getCandidateMenuItems = (navigate, logout) => [
    {
        label: (
            <span className="flex items-center gap-2" onClick={() => navigate('/user/profile')}>
                <User size={15} /> Hồ sơ của tôi
            </span>
        ),
        key: 'user',
    },
    {
        label: (
            <span className="flex items-center gap-2" onClick={() => navigate('/my-cvs')}>
                <ClipboardList size={15} /> Quản lý CV
            </span>
        ),
        key: 'cv',
    },
    {
        label: (
            <span className="flex items-center gap-2" onClick={() => navigate('/user/applications')}>
                <Briefcase size={15} /> Việc đã ứng tuyển
            </span>
        ),
        key: 'applications',
    },
    {
        label: (
            <span className="flex items-center gap-2" onClick={() => navigate('/user/saved-jobs')}>
                <BookmarkCheck size={15} /> Việc đã lưu
            </span>
        ),
        key: 'saved',
    },
    { type: 'divider' },
    {
        label: (
            <span className="flex items-center gap-2 text-red-500" onClick={logout}>
                <LogOut size={15} /> Đăng xuất
            </span>
        ),
        key: 'logout',
    },
];

const getEmployerMenuItems = (navigate, logout) => [
    {
        label: (
            <span className="flex items-center gap-2" onClick={() => navigate('/company/dashboard')}>
                <LayoutDashboard size={15} /> Dashboard
            </span>
        ),
        key: 'dashboard',
    },
    {
        label: (
            <span className="flex items-center gap-2" onClick={() => navigate('/company/profile')}>
                <Building2 size={15} /> Hồ sơ công ty
            </span>
        ),
        key: 'company',
    },
    {
        label: (
            <span className="flex items-center gap-2" onClick={() => navigate('/company/jobs')}>
                <Briefcase size={15} /> Quản lý tin đăng
            </span>
        ),
        key: 'jobs',
    },
    {
        label: (
            <span className="flex items-center gap-2" onClick={() => navigate('/company/wallet')}>
                <Wallet size={15} /> Ví & Giao dịch
            </span>
        ),
        key: 'wallet',
    },
    { type: 'divider' },
    {
        label: (
            <span className="flex items-center gap-2 text-red-500" onClick={logout}>
                <LogOut size={15} /> Đăng xuất
            </span>
        ),
        key: 'logout',
    },
];

const getAdminMenuItems = (navigate, logout) => [
    {
        label: (
            <span className="flex items-center gap-2" onClick={() => navigate('/admin/dashboard')}>
                <Shield size={15} /> Admin Dashboard
            </span>
        ),
        key: 'admin',
    },
    { type: 'divider' },
    {
        label: (
            <span className="flex items-center gap-2 text-red-500" onClick={logout}>
                <LogOut size={15} /> Đăng xuất
            </span>
        ),
        key: 'logout',
    },
];

export default function Header() {
    const { user, logout } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchRef = useRef(null);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    useEffect(() => {
        if (searchOpen) searchRef.current?.focus();
    }, [searchOpen]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/jobs?keyword=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const getMenuItems = () => {
        if (!user) return [];
        if (user.role === 'admin') return getAdminMenuItems(navigate, handleLogout);
        if (user.role === 'employer') return getEmployerMenuItems(navigate, handleLogout);
        return getCandidateMenuItems(navigate, handleLogout);
    };

    const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + '/');

    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled ? 'bg-white border-b border-slate-200 shadow-sm' : 'bg-white/80 backdrop-blur-md'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                                <Briefcase size={18} className="text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-800 hidden sm:block">
                                Job
                                <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                                    24h
                                </span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-1 mx-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive(link.href)
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Right side */}
                        <div className="flex items-center gap-1.5">
                            {/* Search */}
                            <AnimatePresence mode="wait">
                                {searchOpen ? (
                                    <motion.form
                                        key="search-open"
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 260, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                                        onSubmit={handleSearch}
                                        className="hidden sm:flex items-center overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 w-full">
                                            <Search size={15} className="text-slate-400 flex-shrink-0" />
                                            <input
                                                ref={searchRef}
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Tìm việc làm..."
                                                className="bg-transparent text-slate-800 text-sm outline-none flex-1 placeholder:text-slate-400"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setSearchOpen(false)}
                                                className="text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </motion.form>
                                ) : (
                                    <motion.button
                                        key="search-btn"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setSearchOpen(true)}
                                        className="hidden sm:flex p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                                    >
                                        <Search size={19} />
                                    </motion.button>
                                )}
                            </AnimatePresence>

                            {user ? (
                                <>
                                    {/* Messages */}
                                    <Tooltip title="Tin nhắn" placement="bottom">
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    user.role === 'employer' ? '/employer/messages' : '/user/messages',
                                                )
                                            }
                                            className="hidden sm:flex p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                                        >
                                            <MessageSquare size={19} />
                                        </button>
                                    </Tooltip>

                                    {/* Notifications */}
                                    <NotificationBell />

                                    {/* Employer: Post job button */}
                                    {user.role === 'employer' && (
                                        <button
                                            onClick={() => navigate('/company/jobs')}
                                            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300"
                                        >
                                            <Plus size={15} />
                                            Đăng tin
                                        </button>
                                    )}

                                    {/* User dropdown */}
                                    <Dropdown
                                        menu={{ items: getMenuItems() }}
                                        trigger={['click']}
                                        placement="bottomRight"
                                    >
                                        <button className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 transition-all">
                                            <div className="hidden md:flex flex-col items-end">
                                                <span className="text-sm font-semibold text-slate-800 leading-tight line-clamp-1 max-w-[120px]">
                                                    {user.fullName}
                                                </span>
                                                <span className="text-xs text-slate-400 capitalize">
                                                    {user.role === 'user'
                                                        ? 'Ứng viên'
                                                        : user.role === 'employer'
                                                          ? 'Nhà tuyển dụng'
                                                          : 'Admin'}
                                                </span>
                                            </div>
                                            <Avatar
                                                src={
                                                    user.avatar
                                                        ? user.avatar.startsWith('http')
                                                            ? user.avatar
                                                            : `${import.meta.env.VITE_API_URL}/uploads/avatars/${user.avatar}`
                                                        : undefined
                                                }
                                                size={34}
                                                className="ring-2 ring-indigo-100 ring-offset-1"
                                            >
                                                {!user.avatar && user.fullName?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                            <ChevronDown size={14} className="text-slate-400 hidden md:block" />
                                        </button>
                                    </Dropdown>
                                </>
                            ) : (
                                <div className="hidden sm:flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                                    >
                                        Đăng ký
                                    </Link>
                                </div>
                            )}

                            {/* Hamburger */}
                            <button
                                onClick={() => setMobileOpen((v) => !v)}
                                className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                                aria-label="Toggle menu"
                            >
                                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile search bar */}
                <AnimatePresence>
                    {searchOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="sm:hidden px-4 pb-3 border-t border-slate-100"
                        >
                            <form
                                onSubmit={handleSearch}
                                className="flex items-center gap-2 mt-3 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2"
                            >
                                <Search size={15} className="text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tìm việc làm..."
                                    className="bg-transparent text-slate-800 text-sm outline-none flex-1 placeholder:text-slate-400"
                                />
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile menu drawer */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="lg:hidden overflow-hidden bg-white border-b border-slate-200"
                        >
                            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
                                {/* User info */}
                                {user && (
                                    <div className="flex items-center gap-3 p-3 mb-3 bg-indigo-50 rounded-xl">
                                        <Avatar src={user.avatar || undefined} size={40}>
                                            {!user.avatar && user.fullName?.charAt(0)?.toUpperCase()}
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{user.fullName}</p>
                                            <p className="text-xs text-slate-500">
                                                {user.role === 'user'
                                                    ? 'Ứng viên'
                                                    : user.role === 'employer'
                                                      ? 'Nhà tuyển dụng'
                                                      : 'Admin'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Nav links */}
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                            isActive(link.href)
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                    >
                                        {link.icon}
                                        {link.label}
                                    </Link>
                                ))}

                                <div className="pt-2 border-t border-slate-100 mt-2">
                                    {user ? (
                                        <div className="space-y-1">
                                            <button
                                                onClick={() => {
                                                    navigate('/messages');
                                                    setMobileOpen(false);
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                            >
                                                <MessageSquare size={16} /> Tin nhắn
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigate('/user');
                                                    setMobileOpen(false);
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                            >
                                                <Settings size={16} /> Cài đặt tài khoản
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setMobileOpen(false);
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all"
                                            >
                                                <LogOut size={16} /> Đăng xuất
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2 pt-2">
                                            <Link
                                                to="/login"
                                                onClick={() => setMobileOpen(false)}
                                                className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all"
                                            >
                                                Đăng nhập
                                            </Link>
                                            <Link
                                                to="/register"
                                                onClick={() => setMobileOpen(false)}
                                                className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
                                            >
                                                Đăng ký miễn phí
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </>
    );
}
