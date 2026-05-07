import { useState } from 'react';
import { MapPin, Mail, Phone, Clock, Send, CheckCircle } from 'lucide-react';

const CONTACT_INFO = [
    {
        icon: <MapPin size={20} />,
        title: 'Địa chỉ',
        lines: ['Hà Nội, Việt Nam'],
    },
    {
        icon: <Mail size={20} />,
        title: 'Email',
        lines: ['support@job24h.vn', 'business@job24h.vn'],
    },
    {
        icon: <Phone size={20} />,
        title: 'Hotline',
        lines: ['1800 - 6789', '(Miễn phí 8:00 – 18:00)'],
    },
    {
        icon: <Clock size={20} />,
        title: 'Giờ làm việc',
        lines: ['Thứ 2 – Thứ 6: 8:00 – 18:00', 'Thứ 7: 8:00 – 12:00'],
    },
];

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate sending
        await new Promise((r) => setTimeout(r, 1200));
        setLoading(false);
        setSent(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-cyan-600 text-white py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Liên hệ với chúng tôi</h1>
                    <p className="text-indigo-100 text-lg leading-relaxed">
                        Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy gửi câu hỏi hoặc phản hồi của bạn cho chúng
                        tôi.
                    </p>
                </div>
            </section>

            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-12">
                    {/* Contact info */}
                    <div className="lg:col-span-2 space-y-5">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Thông tin liên hệ</h2>
                        {CONTACT_INFO.map((item) => (
                            <div
                                key={item.title}
                                className="flex gap-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                            >
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 mb-1">{item.title}</p>
                                    {item.lines.map((line, i) => (
                                        <p key={i} className="text-sm text-slate-500">
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                            {sent ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-500 flex items-center justify-center mb-4">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Gửi thành công!</h3>
                                    <p className="text-slate-500 mb-6">
                                        Chúng tôi sẽ phản hồi bạn trong vòng 24 giờ làm việc.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSent(false);
                                            setForm({ name: '', email: '', subject: '', message: '' });
                                        }}
                                        className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                                    >
                                        Gửi tin nhắn khác
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Gửi tin nhắn</h2>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                                    Họ và tên <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    name="name"
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Nguyễn Văn A"
                                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    name="email"
                                                    type="email"
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="email@example.com"
                                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                                Tiêu đề <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                name="subject"
                                                value={form.subject}
                                                onChange={handleChange}
                                                required
                                                placeholder="Chủ đề liên hệ"
                                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                                Nội dung <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="message"
                                                value={form.message}
                                                onChange={handleChange}
                                                required
                                                rows={5}
                                                placeholder="Nhập nội dung tin nhắn của bạn..."
                                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                                        >
                                            {loading ? (
                                                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                            ) : (
                                                <Send size={16} />
                                            )}
                                            {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
