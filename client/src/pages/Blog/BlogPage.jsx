import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Search,
    Clock,
    ArrowRight,
    Newspaper,
    TrendingUp,
    BookMarked,
    Loader2,
} from 'lucide-react';
import axiosInstance from '../../api/axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Hàm lấy plain text từ HTML content
function getPlainText(html = '') {
    try {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    } catch {
        return html.replace(/<[^>]+>/g, '');
    }
}

// ─── Blog Card (Featured / large) ────────────────────────────────────────────
function FeaturedCard({ blog, onClick }) {
    const imgUrl = blog.image
        ? blog.image.startsWith('http')
            ? blog.image
            : `${API_URL}/uploads/blogs/${blog.image}`
        : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=900';

    const excerpt = getPlainText(blog.content).slice(0, 180) + '...';

    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClick}
            className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200 cursor-pointer hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-200 transition-all duration-300"
        >
            {/* Image */}
            <div className="relative h-72 overflow-hidden">
                <img
                    src={imgUrl}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        e.currentTarget.src =
                            'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=900';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
                <span className="absolute top-4 left-4 text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-full shadow-md">
                    Nổi bật
                </span>
            </div>

            {/* Content */}
            <div className="p-7">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <Clock size={12} />
                    <span>{dayjs(blog.createdAt).fromNow()}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{Math.ceil(getPlainText(blog.content).split(' ').length / 200)} phút đọc</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug mb-3 line-clamp-2">
                    {blog.title}
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-5">{excerpt}</p>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 group-hover:gap-3 transition-all">
                    Đọc tiếp <ArrowRight size={15} />
                </span>
            </div>
        </motion.article>
    );
}

// ─── Blog Card (Regular) ─────────────────────────────────────────────────────
function BlogCard({ blog, index, onClick }) {
    const imgUrl = blog.image
        ? blog.image.startsWith('http')
            ? blog.image
            : `${API_URL}/uploads/blogs/${blog.image}`
        : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600';

    const excerpt = getPlainText(blog.content).slice(0, 110) + '...';

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            onClick={onClick}
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 cursor-pointer hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-200 flex flex-col"
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={imgUrl}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        e.currentTarget.src =
                            'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2.5">
                    <Clock size={11} />
                    <span>{dayjs(blog.createdAt).fromNow()}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{Math.ceil(getPlainText(blog.content).split(' ').length / 200)} phút đọc</span>
                </div>
                <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2 leading-snug">
                    {blog.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 flex-1">{excerpt}</p>
                <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:gap-2.5 transition-all">
                        Xem bài viết <ArrowRight size={13} />
                    </span>
                </div>
            </div>
        </motion.article>
    );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function SkeletonCard({ big = false }) {
    return (
        <div className={`bg-white rounded-2xl overflow-hidden border border-slate-200 animate-pulse flex flex-col ${big ? 'rounded-3xl' : ''}`}>
            <div className={big ? 'h-72 bg-slate-100' : 'h-48 bg-slate-100'} />
            <div className="p-5 space-y-3">
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="h-5 bg-slate-100 rounded w-3/4" />
                <div className="h-5 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-5/6" />
            </div>
        </div>
    );
}

// ─── Sidebar Recent Post ─────────────────────────────────────────────────────
function SidebarPost({ blog, onClick }) {
    const imgUrl = blog.image
        ? blog.image.startsWith('http')
            ? blog.image
            : `${API_URL}/uploads/blogs/${blog.image}`
        : null;

    return (
        <div
            onClick={onClick}
            className="group flex gap-3 cursor-pointer py-3 border-b border-slate-100 last:border-none hover:opacity-80 transition-opacity"
        >
            <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                {imgUrl ? (
                    <img src={imgUrl} alt={blog.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <BookOpen size={20} />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                </p>
                <p className="text-xs text-slate-400 mt-1">{dayjs(blog.createdAt).fromNow()}</p>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BlogPage() {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        axiosInstance
            .get('/api/blog/get-all')
            .then((res) => {
                setBlogs(res.data?.metadata || []);
            })
            .catch(() => setBlogs([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = blogs.filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase()),
    );

    const featured = filtered[0];
    const rest = filtered.slice(1);
    const recent = blogs.slice(0, 5);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* ── Hero ── */}
            <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 overflow-hidden">
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                        backgroundSize: '32px 32px',
                    }}
                />
                <div className="absolute top-[-20%] right-0 w-[40%] h-[200%] bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-[-30%] left-[-5%] w-[30%] h-[150%] bg-cyan-400/10 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 text-indigo-300 text-sm font-semibold mb-4 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                            <Newspaper size={14} />
                            Blog & Kiến thức
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
                            Góc{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">
                                chia sẻ
                            </span>{' '}
                            nghề nghiệp
                        </h1>
                        <p className="text-indigo-200 text-base max-w-lg mb-8 leading-relaxed">
                            Khám phá các bài viết về kỹ năng nghề nghiệp, xu hướng tuyển dụng và lời khuyên từ chuyên gia.
                        </p>

                        {/* Search */}
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài viết..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white text-slate-800 outline-none shadow-xl placeholder:text-slate-400 text-sm font-medium"
                            />
                        </div>

                        {/* Stats */}
                        <div className="flex gap-8 mt-8 text-sm text-indigo-300">
                            <span className="flex items-center gap-2">
                                <BookOpen size={15} />
                                <strong className="text-white">{blogs.length}</strong> bài viết
                            </span>
                            <span className="flex items-center gap-2">
                                <TrendingUp size={15} />
                                Cập nhật thường xuyên
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* ── Articles ── */}
                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="space-y-6">
                                <SkeletonCard big />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <SkeletonCard key={i} />
                                    ))}
                                </div>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200 text-center px-6">
                                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-300 mb-6">
                                    <BookOpen size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">
                                    Không tìm thấy bài viết
                                </h3>
                                <p className="text-slate-500 text-sm max-w-sm">
                                    Thử tìm với từ khóa khác hoặc xem tất cả bài viết.
                                </p>
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="mt-5 px-6 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors text-sm"
                                    >
                                        Xóa tìm kiếm
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Featured post */}
                                {featured && !search && (
                                    <div className="mb-8">
                                        <FeaturedCard
                                            blog={featured}
                                            onClick={() => navigate(`/blog/${featured._id}`)}
                                        />
                                    </div>
                                )}

                                {/* Section header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-slate-800">
                                        {search ? `Kết quả: "${search}"` : 'Tất cả bài viết'}
                                        <span className="ml-2 text-sm font-normal text-slate-400">
                                            ({filtered.length} bài)
                                        </span>
                                    </h2>
                                </div>

                                {/* Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {(search ? filtered : rest).map((blog, i) => (
                                        <BlogCard
                                            key={blog._id}
                                            blog={blog}
                                            index={i}
                                            onClick={() => navigate(`/blog/${blog._id}`)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <aside className="w-full lg:w-80 flex-shrink-0">
                        <div className="space-y-6 lg:sticky lg:top-24">
                            {/* Recent Posts */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                                    <BookMarked size={17} className="text-indigo-500" />
                                    Bài viết mới nhất
                                </h3>
                                {loading ? (
                                    <div className="space-y-3">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="flex gap-3 animate-pulse py-3 border-b border-slate-100">
                                                <div className="w-16 h-16 rounded-xl bg-slate-100 flex-shrink-0" />
                                                <div className="flex-1 space-y-2 pt-1">
                                                    <div className="h-3 bg-slate-100 rounded w-full" />
                                                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                                                    <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div>
                                        {recent.map((blog) => (
                                            <SidebarPost
                                                key={blog._id}
                                                blog={blog}
                                                onClick={() => navigate(`/blog/${blog._id}`)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* CTA Card */}
                            <div className="bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-2xl p-6 text-white">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                    <TrendingUp size={22} className="text-white" />
                                </div>
                                <h4 className="font-bold text-lg mb-2">Tìm việc ngay hôm nay</h4>
                                <p className="text-indigo-100 text-sm leading-relaxed mb-5">
                                    Khám phá hàng ngàn cơ hội việc làm hấp dẫn đang chờ bạn.
                                </p>
                                <button
                                    onClick={() => navigate('/jobs')}
                                    className="w-full py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-sm"
                                >
                                    Tìm việc ngay
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
