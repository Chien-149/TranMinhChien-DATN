import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Building2,
    Briefcase,
    Layers,
    Package,
    BookOpen,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronDown,
    ShieldCheck,
    Home,
} from 'lucide-react';
import { useAuth } from '../../store/authStore';

const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    { to: '/admin/users', icon: Users, label: 'Người dùng' },
    { to: '/admin/companies', icon: Building2, label: 'Công ty' },
    { to: '/admin/jobs', icon: Briefcase, label: 'Việc làm' },
    { to: '/admin/industries', icon: Layers, label: 'Ngành nghề' },
    { to: '/admin/packages', icon: Package, label: 'Gói dịch vụ' },
    { to: '/admin/blog', icon: BookOpen, label: 'Bài viết' },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-100 flex font-sans">
            {/* ===== SIDEBAR ===== */}
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <aside
                className={`fixed top-0 left-0 h-full w-60 bg-gradient-to-b from-indigo-900 to-indigo-950 z-30 flex flex-col transition-transform duration-300
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-indigo-800">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow">
                        <ShieldCheck size={20} className="text-indigo-600" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm leading-tight">JobPortal</p>
                        <p className="text-[10px] text-indigo-300 uppercase tracking-widest">Admin Panel</p>
                    </div>
                    <button
                        className="ml-auto lg:hidden text-indigo-300 hover:text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-white/15 text-white shadow-sm'
                                        : 'text-indigo-300 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-4 py-4 border-t border-indigo-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-indigo-300 hover:bg-white/10 hover:text-red-300 transition-all"
                    >
                        <LogOut size={16} />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* ===== MAIN AREA ===== */}
            <div className="flex-1 flex flex-col lg:ml-60 min-h-screen">
                {/* Topbar */}
                <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center shadow-sm">
                    <button
                        className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex-1" />
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Quay về trang chủ"
                    >
                        <Home size={16} />
                        <span className="hidden sm:block">Trang chủ</span>
                    </button>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
