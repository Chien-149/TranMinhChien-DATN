import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LayoutGrid, ImageOff } from 'lucide-react';
import { industriesAPI } from '../../api/industries.api';

// Fallback gradient colors per index
const GRADIENTS = [
    'from-indigo-500 to-indigo-700',
    'from-cyan-500 to-cyan-700',
    'from-emerald-500 to-emerald-700',
    'from-violet-500 to-violet-700',
    'from-rose-500 to-rose-700',
    'from-amber-500 to-amber-600',
    'from-sky-500 to-sky-700',
    'from-fuchsia-500 to-fuchsia-700',
    'from-teal-500 to-teal-700',
    'from-orange-500 to-orange-700',
];

const BG_LIGHTS = [
    'bg-indigo-50 border-indigo-100 hover:border-indigo-300',
    'bg-cyan-50 border-cyan-100 hover:border-cyan-300',
    'bg-emerald-50 border-emerald-100 hover:border-emerald-300',
    'bg-violet-50 border-violet-100 hover:border-violet-300',
    'bg-rose-50 border-rose-100 hover:border-rose-300',
    'bg-amber-50 border-amber-100 hover:border-amber-300',
    'bg-sky-50 border-sky-100 hover:border-sky-300',
    'bg-fuchsia-50 border-fuchsia-100 hover:border-fuchsia-300',
    'bg-teal-50 border-teal-100 hover:border-teal-300',
    'bg-orange-50 border-orange-100 hover:border-orange-300',
];

const TEXT_COLORS = [
    'text-indigo-700',
    'text-cyan-700',
    'text-emerald-700',
    'text-violet-700',
    'text-rose-700',
    'text-amber-700',
    'text-sky-700',
    'text-fuchsia-700',
    'text-teal-700',
    'text-orange-700',
];

function IndustryCard({ industry, index }) {
    const navigate = useNavigate();
    const colorIdx = index % GRADIENTS.length;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
            onClick={() => navigate(`/jobs?category=${industry._id}`)}
            className={`group relative flex flex-col items-center justify-center p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${BG_LIGHTS[colorIdx]}`}
        >
            {/* Image / Icon */}
            <div className="w-16 h-16 mb-3 rounded-2xl overflow-hidden flex items-center justify-center shadow-sm">
                {industry.image ? (
                    <img
                        src={
                            industry.image.startsWith('http')
                                ? industry.image
                                : `${import.meta.env.VITE_API_URL}/uploads/industries/${industry.image}`
                        }
                        alt={industry.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div
                    className={`w-full h-full bg-gradient-to-br ${GRADIENTS[colorIdx]} flex items-center justify-center ${industry.image ? 'hidden' : 'flex'}`}
                >
                    <span className="text-white text-2xl font-bold">{industry.name?.charAt(0)?.toUpperCase()}</span>
                </div>
            </div>

            {/* Name */}
            <p
                className={`text-sm font-semibold text-center leading-tight ${TEXT_COLORS[colorIdx]} group-hover:opacity-80 transition-opacity`}
            >
                {industry.name}
            </p>

            {/* Arrow on hover */}
            <ArrowRight
                size={14}
                className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity ${TEXT_COLORS[colorIdx]}`}
            />
        </motion.div>
    );
}

export default function TopIndustries() {
    const navigate = useNavigate();
    const [industries, setIndustries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        industriesAPI
            .getAll()
            .then((res) => setIndustries(res.data?.metadata || []))
            .catch(() => setIndustries([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="bg-slate-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-2">
                            <LayoutGrid size={15} />
                            Khám phá theo ngành nghề
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Top ngành nghề{' '}
                            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                                nổi bật
                            </span>
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                            {industries.length > 0
                                ? `${industries.length} ngành nghề đang có việc làm hot nhất`
                                : 'Đang tải danh mục...'}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/jobs')}
                        className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group flex-shrink-0"
                    >
                        Xem tất cả
                        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Skeleton */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="h-36 rounded-2xl bg-slate-200 animate-pulse" />
                        ))}
                    </div>
                ) : industries.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-center">
                        <ImageOff size={36} className="text-slate-300 mb-3" />
                        <p className="text-slate-400 text-sm">Chưa có danh mục ngành nghề nào</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {industries.map((industry, i) => (
                            <IndustryCard key={industry._id} industry={industry} index={i} />
                        ))}
                    </div>
                )}

                {/* Mobile: view all */}
                <div className="mt-8 flex justify-center sm:hidden">
                    <button
                        onClick={() => navigate('/jobs')}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                    >
                        Xem tất cả <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </section>
    );
}
