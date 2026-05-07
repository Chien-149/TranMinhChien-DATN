import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, ArrowRight, Briefcase, BadgeCheck } from 'lucide-react';
import { companyAPI } from '../../api/company.api';

function CompanyCard({ company, index }) {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            onClick={() => navigate(`/companies/${company._id}`)}
            className="group flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-50 transition-all duration-200"
        >
            {/* Logo */}
            <div className="w-14 h-14 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {company.companyLogo ? (
                    <img
                        src={company.companyLogo}
                        alt={company.companyName}
                        className="w-full h-full object-contain p-1.5"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                ) : (
                    <Building2 size={24} className="text-slate-300" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                        {company.companyName}
                    </p>
                    {company.isVerified && (
                        <BadgeCheck size={14} className="text-indigo-500 flex-shrink-0" />
                    )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    {company.companyAddress && (
                        <span className="flex items-center gap-1">
                            <MapPin size={11} /> {company.companyAddress.split(',').pop()?.trim()}
                        </span>
                    )}
                    {company.companySize && (
                        <span className="flex items-center gap-1">
                            <Briefcase size={11} /> {company.companySize} nhân viên
                        </span>
                    )}
                </div>
            </div>

            <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </motion.div>
    );
}

export default function TopCompanies() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        companyAPI.getAll({ limit: 12 })
            .then((res) => {
                const data = res.data?.metadata || res.data?.data || [];
                // only approved companies
                const approved = Array.isArray(data) ? data.filter(c => c.status === 'approved') : [];
                setCompanies(approved.slice(0, 12));
            })
            .catch(() => setCompanies([]))
            .finally(() => setLoading(false));
    }, []);

    if (!loading && companies.length === 0) return null;

    return (
        <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-2">
                            <Building2 size={15} />
                            Nhà tuyển dụng
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Công ty{' '}
                            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                                hàng đầu
                            </span>
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                            Khám phá các doanh nghiệp uy tín đang tuyển dụng
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/companies')}
                        className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group flex-shrink-0"
                    >
                        Tất cả công ty
                        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {companies.map((company, i) => (
                            <CompanyCard key={company._id} company={company} index={i} />
                        ))}
                    </div>
                )}

                <div className="mt-8 flex justify-center sm:hidden">
                    <button
                        onClick={() => navigate('/companies')}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                    >
                        Tất cả công ty <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </section>
    );
}
