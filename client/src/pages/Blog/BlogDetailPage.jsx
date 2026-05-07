import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Clock,
    Calendar,
    BookOpen,
    Share2,
    ChevronRight,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import axiosInstance from '../../api/axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getPlainText(html = '') {
    try {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    } catch {
        return html.replace(/<[^>]+>/g, '');
    }
}

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
            <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                {imgUrl ? (
                    <img src={imgUrl} alt={blog.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <BookOpen size={18} />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                </p>
                <p className="text-xs text-slate-400 mt-1">{dayjs(blog.createdAt).fromNow()}</p>
            </div>
        </div>
    );
}

export default function BlogDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        setError(false);

        Promise.all([
            axiosInstance.get(`/api/blog/get-by-id?id=${id}`),
            axiosInstance.get('/api/blog/get-all'),
        ])
            .then(([detailRes, allRes]) => {
                const post = detailRes.data?.metadata;
                const allBlogs = allRes.data?.metadata || [];
                if (!post) {
                    setError(true);
                    return;
                }
                setBlog(post);
                // Related = other blogs, max 5
                setRelated(allBlogs.filter((b) => b._id !== id).slice(0, 5));
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [id]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // ── Loading ──
    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                    <Loader2 size={36} className="animate-spin text-indigo-400" />
                    <p className="text-sm font-medium">Đang tải bài viết...</p>
                </div>
            </div>
        );
    }

    // ── Error ──
    if (error || !blog) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6 text-rose-400">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy bài viết</h2>
                <p className="text-slate-500 max-w-sm mb-8">Bài viết không tồn tại hoặc đã bị xóa.</p>
                <button
                    onClick={() => navigate('/blog')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                >
                    <ArrowLeft size={17} /> Quay lại Blog
                </button>
            </div>
        );
    }

    const imgUrl = blog.image
        ? blog.image.startsWith('http')
            ? blog.image
            : `${API_URL}/uploads/blogs/${blog.image}`
        : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1400';

    const readTime = Math.ceil(getPlainText(blog.content).split(' ').length / 200);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* ── Hero Image ── */}
            <div className="relative h-72 md:h-[420px] w-full overflow-hidden">
                <img
                    src={imgUrl}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src =
                            'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1400';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />

                {/* Back button overlay */}
                <div className="absolute top-6 left-6">
                    <button
                        onClick={() => navigate('/blog')}
                        className="flex items-center gap-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    >
                        <ArrowLeft size={16} />
                        Quay lại Blog
                    </button>
                </div>
            </div>

            {/* ── Content Area ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                <div className="flex flex-col lg:flex-row gap-10 items-start">
                    {/* ── Article ── */}
                    <article className="flex-1 min-w-0">
                        {/* Title Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 mb-6"
                        >
                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400 mb-5">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    {dayjs(blog.createdAt).format('DD/MM/YYYY')}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    {readTime} phút đọc
                                </span>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-1.5 ml-auto text-indigo-500 hover:text-indigo-700 font-semibold transition-colors"
                                >
                                    <Share2 size={14} />
                                    {copied ? 'Đã sao chép!' : 'Chia sẻ'}
                                </button>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                                {blog.title}
                            </h1>
                        </motion.div>

                        {/* Content Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.4 }}
                            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10"
                        >
                            {/* Render content — support plain text & basic HTML */}
                            <div
                                className="prose prose-slate max-w-none
                                    prose-headings:font-bold prose-headings:text-slate-900
                                    prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                                    prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4
                                    prose-strong:text-slate-800 prose-strong:font-bold
                                    prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                                    prose-ul:my-4 prose-li:text-slate-600 prose-li:mb-1
                                    prose-img:rounded-2xl prose-img:shadow-md prose-img:my-6
                                    prose-blockquote:border-indigo-400 prose-blockquote:bg-indigo-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-700
                                "
                                dangerouslySetInnerHTML={{ __html: blog.content }}
                            />
                        </motion.div>

                        {/* Navigation */}
                        <div className="mt-6 flex items-center justify-between">
                            <button
                                onClick={() => navigate('/blog')}
                                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm"
                            >
                                <ArrowLeft size={16} />
                                Tất cả bài viết
                            </button>
                        </div>
                    </article>

                    {/* ── Sidebar ── */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="space-y-5 lg:sticky lg:top-24">
                            {/* Related Articles */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <BookOpen size={16} className="text-indigo-500" />
                                    Bài viết liên quan
                                </h3>
                                {related.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-4">Chưa có bài viết khác.</p>
                                ) : (
                                    related.map((b) => (
                                        <SidebarPost
                                            key={b._id}
                                            blog={b}
                                            onClick={() => navigate(`/blog/${b._id}`)}
                                        />
                                    ))
                                )}
                                <button
                                    onClick={() => navigate('/blog')}
                                    className="mt-4 w-full flex items-center justify-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    Xem tất cả <ChevronRight size={14} />
                                </button>
                            </div>

                            {/* CTA */}
                            <div className="bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-2xl p-6 text-white">
                                <h4 className="font-bold text-base mb-2">Tìm việc phù hợp</h4>
                                <p className="text-indigo-100 text-xs leading-relaxed mb-4">
                                    Hàng ngàn vị trí đang tuyển dụng đang chờ bạn.
                                </p>
                                <button
                                    onClick={() => navigate('/jobs')}
                                    className="w-full py-2.5 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-sm"
                                >
                                    Xem việc làm
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
