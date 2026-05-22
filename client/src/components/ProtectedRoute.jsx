import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authStore';

/**
 * ProtectedRoute – bảo vệ route theo role.
 *
 * Props:
 *   allowedRoles  – mảng các role được phép, vd: ['admin'] | ['user'] | ['employer']
 *   redirectTo    – nơi redirect khi không đủ quyền (mặc định '/login')
 *   children      – nội dung cần bảo vệ
 */
export default function ProtectedRoute({ allowedRoles = [], redirectTo = '/login', children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Đang fetch session → chưa render gì (tránh flash)
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Chưa đăng nhập → về trang login, giữ lại đường dẫn gốc
    if (!user) {
        return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
    }

    // Đăng nhập rồi nhưng sai role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Điều hướng về trang chủ phù hợp theo role
        const roleHome = {
            admin: '/admin/dashboard',
            employer: '/company/dashboard',
            user: '/',
        };
        const fallback = roleHome[user.role] ?? '/';
        return <Navigate to={fallback} replace />;
    }

    return children;
}
