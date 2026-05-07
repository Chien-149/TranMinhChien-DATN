import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { User, FileText, Briefcase, MessageSquare, Heart, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../store/authStore';
import Header from '../../components/layout/Header';

const navItems = [
    { to: '/user/profile', icon: User, label: 'Hồ sơ của tôi' },
    { to: '/user/applications', icon: Briefcase, label: 'Việc làm đã ứng tuyển' },
    { to: '/my-cvs', icon: FileText, label: 'CV của tôi' },
    { to: '/user/messages', icon: MessageSquare, label: 'Tin nhắn' },
    { to: '/user/saved-jobs', icon: Heart, label: 'Việc làm yêu thích' },
];

export default function UserLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const avatarLetter = user?.fullName?.charAt(0)?.toUpperCase() || 'U';

    return (
        <div className="min-h-screen bg-slate-50 font-sans max-w-7xl mx-auto relative xl:border-x border-slate-200 shadow-sm">
            {/* Header dùng component sẵn có (fixed top-0 z-50) */}
            <Header />

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-20 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex pt-16 lg:pt-0">
                {/* Sidebar */}
                <aside
                    className={`fixed top-16 left-0 lg:sticky lg:top-16 lg:left-auto lg:translate-x-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 z-30 flex flex-col
                        shadow-sm transition-transform duration-300
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    {/* User card */}
                    <div className="mx-3 my-4 p-4 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-2xl text-white shadow-lg shadow-indigo-200/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center font-bold text-base flex-shrink-0 ring-2 ring-white/40 overflow-hidden">
                                {user?.avatar ? (
                                    <img
                                        src={
                                            user.avatar.startsWith('http')
                                                ? user.avatar
                                                : `${import.meta.env.VITE_API_URL}/uploads/avatars/${user.avatar}`
                                        }
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    avatarLetter
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-sm leading-tight truncate">
                                    {user?.fullName || 'Ứng viên'}
                                </p>
                                <p className="text-indigo-100 text-xs mt-0.5 truncate">{user?.email || ''}</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav items */}
                    <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                        {navItems.map(({ to, icon: Icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={() => setSidebarOpen(false)}
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
                                        {isActive && (
                                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Logout */}
                    <div className="px-3 py-4 border-t border-slate-100">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium
                            text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                            <LogOut size={18} />
                            Đăng xuất
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1 min-h-[calc(100vh-4rem)] flex flex-col lg:pt-16">
                    {/* Mobile topbar toggle */}
                    <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
                        <button
                            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                        <span className="text-sm font-semibold text-slate-700">Menu cá nhân</span>
                    </div>

                    <main className="flex-1 p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
