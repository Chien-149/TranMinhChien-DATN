import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Briefcase,
    FileText,
    MessageSquare,
    Wallet,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Bell,
} from 'lucide-react';
import { useAuth } from '../../store/authStore';
import NotificationBell from '../../components/NotificationBell';

const navItems = [
    { to: '/company/dashboard', icon: LayoutDashboard, label: 'Thống kê' },
    { to: '/company/profile', icon: Building2, label: 'Thông tin công ty' },
    { to: '/company/jobs', icon: Briefcase, label: 'Quản lý tin tuyển dụng' },
    { to: '/company/applications', icon: FileText, label: 'Quản lý CV' },
    { to: '/company/messages', icon: MessageSquare, label: 'Quản lý tin nhắn' },
    { to: '/company/wallet', icon: Wallet, label: 'Ví & Nạp tiền' },
];

export default function CompanyLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-100 flex font-sans">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-30 flex flex-col transition-transform duration-300
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                    <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
                        <Building2 size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-800 text-sm leading-tight">JobPortal</p>
                        <p className="text-[10px] text-indigo-500 uppercase tracking-widest font-medium">
                            Nhà tuyển dụng
                        </p>
                    </div>
                    <button
                        className="ml-auto lg:hidden text-slate-400 hover:text-slate-700"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                                    {label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-4 py-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                        <LogOut size={16} />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main area */}
            <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
                {/* Topbar */}
                <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center gap-4 shadow-sm">
                    <button
                        className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex-1" />

                    <NotificationBell />

                    <div className="flex items-center gap-2 pl-3 border-l border-slate-200 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {user?.avatar ? (
                                <img
                                    src={
                                        user.avatar.startsWith('http')
                                            ? user.avatar
                                            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/avatars/${user.avatar}`
                                    }
                                    alt={user.fullName}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                user?.fullName?.charAt(0)?.toUpperCase() || 'C'
                            )}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-semibold text-slate-800 leading-tight">
                                {user?.fullName || 'Công ty'}
                            </p>
                            <p className="text-[11px] text-indigo-500 uppercase font-medium tracking-wide">Employer</p>
                        </div>
                        <ChevronDown size={14} className="text-slate-400 ml-1" />
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
