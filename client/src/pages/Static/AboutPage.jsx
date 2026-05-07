import { Briefcase, Target, Users, Award, TrendingUp, Heart } from 'lucide-react';

const STATS = [
    { number: '50,000+', label: 'Tin tuyển dụng' },
    { number: '200,000+', label: 'Ứng viên đăng ký' },
    { number: '10,000+', label: 'Công ty đối tác' },
    { number: '95%', label: 'Tỷ lệ hài lòng' },
];

const VALUES = [
    {
        icon: <Target size={24} />,
        title: 'Sứ mệnh',
        desc: 'Kết nối tài năng Việt với những cơ hội nghề nghiệp tốt nhất, giúp mỗi người tìm được công việc phù hợp với đam mê và năng lực.',
    },
    {
        icon: <Heart size={24} />,
        title: 'Giá trị cốt lõi',
        desc: 'Trung thực, minh bạch và tận tâm là kim chỉ nam trong mọi hoạt động. Chúng tôi đặt lợi ích của ứng viên và nhà tuyển dụng lên hàng đầu.',
    },
    {
        icon: <TrendingUp size={24} />,
        title: 'Tầm nhìn',
        desc: 'Trở thành nền tảng tuyển dụng số 1 Việt Nam, ứng dụng công nghệ AI để tối ưu hóa trải nghiệm tìm kiếm việc làm.',
    },
    {
        icon: <Award size={24} />,
        title: 'Cam kết',
        desc: 'Mang đến dịch vụ chất lượng cao, dữ liệu chính xác và trải nghiệm tìm việc nhanh chóng, hiệu quả cho mọi người dùng.',
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-cyan-600 text-white py-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Briefcase size={24} className="text-white" />
                        </div>
                        <span className="text-3xl font-bold">
                            Job<span className="text-cyan-300">24h</span>
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">Về chúng tôi</h1>
                    <p className="text-indigo-100 text-lg max-w-2xl mx-auto leading-relaxed">
                        Job24h là nền tảng kết nối ứng viên và nhà tuyển dụng thông minh tại Việt Nam, sử dụng công nghệ
                        AI tiên tiến để tìm kiếm cơ hội việc làm phù hợp nhất.
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-4 bg-white border-b border-slate-100">
                <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
                    {STATS.map((s) => (
                        <div key={s.label} className="text-center">
                            <p className="text-3xl font-extrabold text-indigo-600 mb-1">{s.number}</p>
                            <p className="text-sm text-slate-500">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Story */}
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800 mb-5">Câu chuyện của chúng tôi</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Được thành lập với mục tiêu giải quyết bài toán tìm việc tại Việt Nam, Job24h ra đời như
                                một giải pháp công nghệ toàn diện, kết nối hàng triệu ứng viên với hàng nghìn doanh
                                nghiệp trên khắp cả nước.
                            </p>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Chúng tôi tin rằng mỗi người đều xứng đáng có một công việc tốt và mỗi doanh nghiệp đều
                                xứng đáng tìm được nhân tài phù hợp. Đó là động lực để chúng tôi không ngừng cải tiến và
                                phát triển.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                Với sự hỗ trợ của trí tuệ nhân tạo, Job24h giúp quá trình tuyển dụng trở nên nhanh
                                chóng, chính xác và hiệu quả hơn bao giờ hết.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {VALUES.map((v) => (
                                <div
                                    key={v.title}
                                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                                        {v.icon}
                                    </div>
                                    <h3 className="font-semibold text-slate-800 mb-1 text-sm">{v.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team CTA */}
            <section className="py-16 px-4 bg-indigo-50">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                        <Users size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">Đội ngũ của chúng tôi</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Job24h được xây dựng bởi đội ngũ trẻ đầy nhiệt huyết, có chuyên môn sâu về công nghệ và thị
                        trường lao động Việt Nam. Chúng tôi luôn lắng nghe và cải tiến để phục vụ người dùng tốt hơn mỗi
                        ngày.
                    </p>
                </div>
            </section>
        </div>
    );
}
