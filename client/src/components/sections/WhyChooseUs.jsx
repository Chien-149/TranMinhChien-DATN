import { motion } from 'framer-motion';
import { Shield, Zap, Bot, Users, Star, HeartHandshake } from 'lucide-react';

const FEATURES = [
    {
        icon: <Bot size={26} />,
        title: 'AI Gợi ý việc làm',
        desc: 'Hệ thống AI phân tích CV và gợi ý vị trí phù hợp nhất với kỹ năng và kinh nghiệm của bạn.',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-100',
    },
    {
        icon: <Zap size={26} />,
        title: 'Ứng tuyển nhanh chóng',
        desc: 'Chỉ một cú click, CV của bạn đã đến tay nhà tuyển dụng. Theo dõi trạng thái hồ sơ theo thời gian thực.',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
    },
    {
        icon: <Shield size={26} />,
        title: 'Việc làm uy tín',
        desc: 'Toàn bộ tin tuyển dụng được kiểm duyệt chặt chẽ. Chúng tôi đảm bảo chất lượng và tính xác thực.',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
    },
    {
        icon: <HeartHandshake size={26} />,
        title: 'Kết nối trực tiếp',
        desc: 'Chat trực tiếp với nhà tuyển dụng, trao đổi công việc nhanh hơn, không qua trung gian.',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-100',
    },
    {
        icon: <Users size={26} />,
        title: 'Cộng đồng ứng viên',
        desc: 'Hàng ngàn ứng viên đang tìm kiếm cơ hội mới mỗi ngày. Hãy là người đầu tiên ứng tuyển.',
        color: 'text-cyan-600',
        bg: 'bg-cyan-50',
        border: 'border-cyan-100',
    },
    {
        icon: <Star size={26} />,
        title: 'AI Viết & Review CV',
        desc: 'Sử dụng AI để tối ưu CV, nhận gợi ý cải thiện chuyên sâu từ chuyên gia trí tuệ nhân tạo.',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
        border: 'border-violet-100',
    },
];

export default function WhyChooseUs() {
    return (
        <section className="bg-slate-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-3">
                        Tại sao chọn Job24h?
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                        Nền tảng tìm việc{' '}
                        <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                            thông minh nhất
                        </span>
                    </h2>
                    <p className="text-slate-500 max-w-xl mx-auto text-sm">
                        Job24h kết hợp công nghệ AI hiện đại với kho dữ liệu việc làm phong phú, giúp bạn tìm được công
                        việc mơ ước nhanh nhất.
                    </p>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07, duration: 0.35 }}
                            className={`flex gap-4 p-5 rounded-2xl border bg-white hover:shadow-md transition-all duration-200 ${f.border}`}
                        >
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${f.bg} ${f.color}`}
                            >
                                {f.icon}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 mb-1">{f.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
