import { FileText, CheckCircle, AlertTriangle, ShieldCheck, UserCog, Ban, RefreshCw, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const SECTIONS = [
    {
        icon: <CheckCircle size={22} />,
        title: '1. Chấp nhận điều khoản',
        content: `Bằng cách truy cập và sử dụng nền tảng Job24h (website, ứng dụng di động và các dịch vụ liên quan), bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản Sử dụng này.

Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, bạn không được phép truy cập hoặc sử dụng dịch vụ của chúng tôi. Người dùng phải đủ 18 tuổi trở lên để đăng ký tài khoản.`,
    },
    {
        icon: <UserCog size={22} />,
        title: '2. Tài khoản người dùng',
        content: `Khi đăng ký tài khoản, bạn cam kết:
• Cung cấp thông tin chính xác, đầy đủ và cập nhật.
• Bảo mật thông tin đăng nhập (mật khẩu) và chịu trách nhiệm về mọi hoạt động diễn ra dưới tài khoản của mình.
• Thông báo ngay cho chúng tôi nếu phát hiện bất kỳ hành vi sử dụng trái phép nào.
• Không chia sẻ tài khoản cho bên thứ ba sử dụng.

Job24h có quyền tạm ngưng hoặc chấm dứt tài khoản nếu phát hiện vi phạm điều khoản này.`,
    },
    {
        icon: <ShieldCheck size={22} />,
        title: '3. Quy định sử dụng dịch vụ',
        content: `Người dùng cam kết không thực hiện các hành vi sau:
• Đăng tải thông tin sai lệch, gian lận hoặc gây nhầm lẫn về hồ sơ cá nhân hoặc tin tuyển dụng.
• Sử dụng dịch vụ để phát tán spam, quảng cáo không được phép.
• Thu thập dữ liệu người dùng khác mà không có sự đồng ý.
• Can thiệp vào hoạt động bình thường của hệ thống.
• Sử dụng tự động hóa (bot, script) để tương tác với nền tảng mà không có sự cho phép bằng văn bản từ Job24h.`,
    },
    {
        icon: <FileText size={22} />,
        title: '4. Nội dung người dùng',
        content: `Bạn giữ quyền sở hữu đối với nội dung bạn đăng tải (hồ sơ, CV, tin tuyển dụng). Tuy nhiên, khi sử dụng nền tảng, bạn cấp cho Job24h giấy phép không độc quyền để hiển thị, phân phối và quảng bá nội dung đó nhằm mục đích cung cấp dịch vụ.

Job24h có quyền xóa bất kỳ nội dung nào vi phạm điều khoản này hoặc bị coi là không phù hợp theo quyết định của chúng tôi, mà không cần thông báo trước.`,
    },
    {
        icon: <AlertTriangle size={22} />,
        title: '5. Giới hạn trách nhiệm',
        content: `Job24h không chịu trách nhiệm về:
• Tính chính xác, đầy đủ của thông tin do nhà tuyển dụng hoặc ứng viên cung cấp.
• Kết quả tuyển dụng hoặc tuyển dụng không thành công.
• Thiệt hại gián tiếp phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ.
• Nội dung của các trang web bên thứ ba được liên kết từ nền tảng.

Dịch vụ được cung cấp "nguyên trạng" (as-is) và Job24h không đảm bảo dịch vụ sẽ hoạt động liên tục, không có lỗi.`,
    },
    {
        icon: <Ban size={22} />,
        title: '6. Chấm dứt dịch vụ',
        content: `Job24h có quyền chấm dứt hoặc tạm ngưng quyền truy cập của bạn vào dịch vụ ngay lập tức, không cần thông báo trước, vì bất kỳ lý do gì, bao gồm nhưng không giới hạn ở việc vi phạm Điều khoản Sử dụng này.

Người dùng cũng có thể yêu cầu xóa tài khoản bất kỳ lúc nào bằng cách liên hệ với bộ phận hỗ trợ của chúng tôi. Dữ liệu sẽ được xóa trong vòng 30 ngày làm việc.`,
    },
    {
        icon: <RefreshCw size={22} />,
        title: '7. Thay đổi điều khoản',
        content: `Job24h có quyền sửa đổi các Điều khoản Sử dụng này bất cứ lúc nào. Chúng tôi sẽ thông báo về những thay đổi đáng kể qua email đã đăng ký hoặc thông báo trên nền tảng.

Việc bạn tiếp tục sử dụng dịch vụ sau khi thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận các điều khoản mới. Nếu bạn không đồng ý, vui lòng ngừng sử dụng dịch vụ và xóa tài khoản.`,
    },
    {
        icon: <Mail size={22} />,
        title: '8. Liên hệ',
        content: `Nếu bạn có bất kỳ câu hỏi nào về Điều khoản Sử dụng này, vui lòng liên hệ chúng tôi qua:

• Email: legal@job24h.vn
• Điện thoại: 1800 - 6789
• Địa chỉ: Hà Nội, Việt Nam
• Trang liên hệ: job24h.vn/contact`,
    },
];

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-cyan-600 text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
                        <FileText size={32} className="text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
                        Điều khoản sử dụng
                    </h1>
                    <p className="text-indigo-100 text-lg max-w-2xl mx-auto leading-relaxed">
                        Vui lòng đọc kỹ các điều khoản sử dụng trước khi sử dụng dịch vụ của Job24h.
                    </p>
                    <p className="mt-4 text-indigo-200 text-sm">
                        Cập nhật lần cuối: 15/05/2025
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Intro card */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-10">
                        <p className="text-indigo-800 text-sm leading-relaxed">
                            Chào mừng bạn đến với <strong>Job24h</strong> – nền tảng kết nối việc làm thông minh hàng đầu Việt Nam.
                            Các điều khoản dưới đây quy định quyền và nghĩa vụ của bạn khi sử dụng các dịch vụ của chúng tôi.
                            Bằng cách truy cập website, bạn đồng ý tuân thủ các điều khoản này.
                        </p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-8">
                        {SECTIONS.map((section) => (
                            <div
                                key={section.title}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-800">{section.title}</h2>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Footer note */}
                    <div className="mt-12 text-center">
                        <p className="text-slate-500 text-sm mb-4">
                            Bạn có câu hỏi về điều khoản sử dụng?
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            <Mail size={16} />
                            Liên hệ với chúng tôi
                        </Link>
                        <div className="mt-6 text-xs text-slate-400">
                            Xem thêm:{' '}
                            <Link to="/privacy" className="text-indigo-500 hover:text-indigo-700 underline">
                                Chính sách bảo mật
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
