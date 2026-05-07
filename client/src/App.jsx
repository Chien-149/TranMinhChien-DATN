import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './store/authStore';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import JobDetailPage from './pages/Job/JobDetailPage';
import JobSearchPage from './pages/Job/JobSearchPage';
import AdminLayout from './pages/Admin/AdminLayout';
import DashboardPage from './pages/Admin/DashboardPage';
import UsersPage from './pages/Admin/UsersPage';
import CompaniesPage from './pages/Admin/CompaniesPage';
import JobsPage from './pages/Admin/JobsPage';
import IndustriesPage from './pages/Admin/IndustriesPage';
import PackagesPage from './pages/Admin/PackagesPage';
import BlogPage from './pages/Admin/BlogPage';
import CompanyLayout from './pages/Company/CompanyLayout';
import CompanyDashboard from './pages/Company/CompanyDashboard';
import CompanyProfile from './pages/Company/CompanyProfile';
import CompanyJobs from './pages/Company/CompanyJobs';
import CompanyApplications from './pages/Company/CompanyApplications';
import CompanyWallet from './pages/Company/CompanyWallet';
import PublicCompanyDetail from './pages/Company/PublicCompanyDetail';
import CompaniesListPage from './pages/Company/CompaniesListPage';
import BlogDetailPage from './pages/Blog/BlogDetailPage';
import PublicBlogPage from './pages/Blog/BlogPage';
import UserLayout from './pages/User/UserLayout';
import UserProfile from './pages/User/UserProfile';
import UserApplications from './pages/User/UserApplications';
import MyCVs from './pages/cv/MyCVs';
import CVBuilder from './pages/cv/CVBuilder';
import CVPreviewPage from './pages/cv/CVPreviewPage';
import UserSavedJobs from './pages/User/UserSavedJobs';
import './index.css';
import MessagerUser from './pages/User/messagerUser';
import CompanyMessager from './pages/Company/CompanyMessager';
import AIChatbot from './components/AIChatbot';
import AboutPage from './pages/Static/AboutPage';
import ContactPage from './pages/Static/ContactPage';

// Placeholder pages – will be built progressively
function PlaceholderPage({ title }) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">{title}</h1>
                <p className="text-slate-400">Trang đang được xây dựng...</p>
            </div>
        </div>
    );
}

function AppLayout() {
    const location = useLocation();
    const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
    const isAdminPage = location.pathname.startsWith('/admin');
    const isCompanyPage = location.pathname.startsWith('/company');
    const isUserPage = location.pathname.startsWith('/user');

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            {!isAuthPage && !isAdminPage && !isCompanyPage && !isUserPage && <Header />}
            <AIChatbot />

            <main className="flex-1">
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/jobs" element={<JobSearchPage />} />
                    <Route path="/jobs/:id" element={<JobDetailPage />} />
                    <Route path="/companies" element={<CompaniesListPage />} />
                    <Route path="/companies/:id" element={<PublicCompanyDetail />} />
                    <Route path="/blog" element={<PublicBlogPage />} />
                    <Route path="/blog/:id" element={<BlogDetailPage />} />
                    <Route path="/ai-assistant" element={<PlaceholderPage title="AI Assistant" />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<PlaceholderPage title="Quên mật khẩu" />} />

                    {/* Candidate routes */}
                    <Route path="/profile" element={<PlaceholderPage title="Hồ sơ cá nhân" />} />
                    <Route path="/my-cv" element={<PlaceholderPage title="Quản lý CV" />} />
                    <Route path="/my-cv/create" element={<PlaceholderPage title="Tạo CV" />} />
                    <Route path="/my-cv/:id" element={<PlaceholderPage title="Chỉnh sửa CV" />} />
                    <Route path="/applications" element={<PlaceholderPage title="Việc đã ứng tuyển" />} />
                    <Route path="/saved-jobs" element={<PlaceholderPage title="Việc đã lưu" />} />
                    <Route path="/messages" element={<PlaceholderPage title="Tin nhắn" />} />
                    <Route path="/ai-cv-review" element={<PlaceholderPage title="AI Review CV" />} />

                    {/* Company / Employer routes */}
                    <Route path="/company" element={<CompanyLayout />}>
                        <Route path="dashboard" element={<CompanyDashboard />} />
                        <Route path="profile" element={<CompanyProfile />} />
                        <Route path="jobs" element={<CompanyJobs />} />
                        <Route path="applications" element={<CompanyApplications />} />
                        <Route path="messages" element={<CompanyMessager />} />
                        <Route path="messager/:id" element={<CompanyMessager />} />
                        <Route path="wallet" element={<CompanyWallet />} />
                    </Route>

                    {/* Standalone CV Builder & Preview */}
                    <Route path="/cv" element={<CVBuilder />} />
                    <Route path="/cv/edit/:cvId" element={<CVBuilder />} />
                    <Route path="/cv/preview/:cvId" element={<CVPreviewPage />} />
                    <Route path="/my-cvs" element={<MyCVs />} />

                    {/* User / Candidate routes */}
                    <Route path="/user" element={<UserLayout />}>
                        <Route path="profile" element={<UserProfile />} />
                        <Route path="applications" element={<UserApplications />} />
                        <Route path="messages" element={<MessagerUser />} />
                        <Route path="messages/:id" element={<MessagerUser />} />
                        <Route path="saved-jobs" element={<UserSavedJobs />} />
                    </Route>

                    {/* Admin routes – use their own AdminLayout */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="companies" element={<CompaniesPage />} />
                        <Route path="jobs" element={<JobsPage />} />
                        <Route path="industries" element={<IndustriesPage />} />
                        <Route path="blog" element={<BlogPage />} />
                        <Route path="packages" element={<PackagesPage />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<PlaceholderPage title="404 – Không tìm thấy trang" />} />
                </Routes>
            </main>
            {!isAuthPage && !isAdminPage && !isCompanyPage && !isUserPage && <Footer />}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppLayout />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
