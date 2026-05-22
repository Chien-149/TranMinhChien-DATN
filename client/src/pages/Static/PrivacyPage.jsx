import { Shield, Eye, Database, Share2, Lock, UserCheck, RefreshCw, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const SECTIONS = [
    {
        icon: <Eye size={22} />,
        title: '1. Thông tin chúng tôi thu thập',
        content: `Chúng tôi thu thập các loại thông tin sau khi bạn sử dụng dịch vụ Job24h:

Thông tin bạn cung cấp trực tiếp:
• Thông tin cá nhân: Họ tên, ngày sinh, giới tính, địa chỉ email, số điện thoại.
• Thông tin nghề nghiệp: CV, hồ sơ xin việc, kinh nghiệm làm việc, học vấn, kỹ năng.
• Thông tin tài khoản: Tên đăng nhập, mật khẩu (được mã hóa), ảnh đại diện.

Thông tin thu thập tự động:
• Dữ liệu thiết bị: Địa chỉ IP, loại trình duyệt, hệ điều hành.
• Dữ liệu hành vi: Trang đã truy cập, thời gian sử dụng, từ khóa tìm kiếm.
• Cookie và công nghệ theo dõi tương tự.`,
    },
    {
        icon: <Database size={22} />,
        title: '2. Mục đích sử dụng thông tin',
        content: `Thông tin thu thập được sử dụng nhằm các mục đích sau:
• Cung cấp và cải thiện dịch vụ kết nối việc làm.
• Cá nhân hóa trải nghiệm tìm kiếm và gợi ý việc làm phù hợp.
• Gửi thông báo về các tin tuyển dụng mới, cập nhật dịch vụ.
• Xác thực danh tính và bảo mật tài khoản.
• Phân tích xu hướng thị trường lao động để cải thiện sản phẩm.
• Tuân thủ các nghĩa vụ pháp lý.`,
    },
    {
        icon: <Share2 size={22} />,
        title: '3. Chia sẻ thông tin với bên thứ ba',
        content: `Job24h không bán thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp sau:

• Với nhà tuyển dụng: Khi bạn ứng tuyển vào một vị trí, hồ sơ của bạn sẽ được chia sẻ với nhà tuyển dụng đó.
• Đối tác dịch vụ: Các nhà cung cấp dịch vụ hỗ trợ hoạt động của chúng tôi (email, phân tích dữ liệu, lưu trữ đám mây) với điều kiện họ cam kết bảo mật dữ liệu.
• Yêu cầu pháp lý: Khi được yêu cầu bởi cơ quan nhà nước có thẩm quyền theo quy định pháp luật Việt Nam.
• Chuyển nhượng kinh doanh: Trong trường hợp sáp nhập hoặc mua lại, với thông báo trước cho người dùng.`,
    },
    {
        icon: <Lock size={22} />,
        title: '4. Bảo mật thông tin',
        content: `Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức để bảo vệ thông tin của bạn:

• Mã hóa SSL/TLS cho tất cả dữ liệu truyền tải.
• Mật khẩu được mã hóa một chiều (bcrypt) – chúng tôi không lưu mật khẩu dạng thô.
• Kiểm soát truy cập nội bộ nghiêm ngặt, chỉ nhân viên có thẩm quyền mới truy cập được dữ liệu.
• Kiểm tra bảo mật định kỳ và vá lỗi kịp thời.

Tuy nhiên, không có phương thức truyền tải qua internet hay lưu trữ điện tử nào là 100% an toàn. Chúng tôi cam kết thông báo cho bạn trong vòng 72 giờ nếu phát hiện vi phạm dữ liệu ảnh hưởng đến thông tin của bạn.`,
    },
    {
        icon: <UserCheck size={22} />,
        title: '5. Quyền của người dùng',
        content: `Bạn có các quyền sau đối với dữ liệu cá nhân của mình:
• Quyền truy cập: Yêu cầu bản sao thông tin cá nhân chúng tôi đang lưu trữ về bạn.
• Quyền chỉnh sửa: Cập nhật hoặc sửa đổi thông tin không chính xác.
• Quyền xóa: Yêu cầu xóa tài khoản và dữ liệu cá nhân (trong phạm vi pháp luật cho phép).
• Quyền từ chối: Từ chối nhận email marketing bất kỳ lúc nào qua link hủy đăng ký.
• Quyền di chuyển dữ liệu: Nhận dữ liệu của bạn ở định dạng có thể đọc được.

Để thực hiện các quyền này, vui lòng liên hệ: privacy@job24h.vn`,
    },
    {
        icon: <Shield size={22} />,
        title: '6. Cookie và công nghệ theo dõi',
        content: `Chúng tôi sử dụng cookie để:
• Duy trì phiên đăng nhập của bạn.
• Ghi nhớ tùy chọn và cài đặt.
• Phân tích lưu lượng truy cập và hành vi người dùng (Google Analytics).
• Cải thiện hiệu suất và trải nghiệm nền tảng.

Bạn có thể kiểm soát cookie thông qua cài đặt trình duyệt. Tuy nhiên, việc tắt cookie có thể ảnh hưởng đến một số tính năng của dịch vụ.`,
    },
    {
        icon: <RefreshCw size={22} />,
        title: '7. Thay đổi chính sách',
        content: `Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian để phản ánh những thay đổi trong thực tiễn của chúng tôi hoặc theo yêu cầu pháp lý.

Khi có thay đổi đáng kể, chúng tôi sẽ:
• Gửi email thông báo đến địa chỉ đã đăng ký.
• Hiển thị thông báo nổi bật trên nền tảng.
• Cập nhật ngày "Cập nhật lần cuối" ở đầu trang này.

Vui lòng kiểm tra trang này định kỳ để cập nhật thông tin mới nhất.`,
    },
    {
        icon: <Mail size={22} />,
        title: '8. Liên hệ về bảo mật',
        content: `Nếu bạn có câu hỏi, khiếu nại hoặc yêu cầu liên quan đến việc bảo vệ dữ liệu cá nhân, vui lòng liên hệ với chúng tôi:

• Email bảo mật: privacy@job24h.vn
• Email hỗ trợ: support@job24h.vn
• Điện thoại: 1800 - 6789 (Thứ 2 – Thứ 6, 8:00 – 17:30)
• Địa chỉ: Hà Nội, Việt Nam

Chúng tôi cam kết phản hồi trong vòng 5 ngày làm việc.`,
    },
];

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-cyan-600 via-indigo-700 to-indigo-800 text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
                        <Shield size={32} className="text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
                        Chính sách bảo mật
                    </h1>
                    <p className="text-indigo-100 text-lg max-w-2xl mx-auto leading-relaxed">
                        Sự bảo mật thông tin của bạn là ưu tiên hàng đầu của chúng tôi. Tìm hiểu cách Job24h thu thập, sử dụng và bảo vệ dữ liệu cá nhân.
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
                    <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-6 mb-10">
                        <div className="flex items-start gap-3">
                            <Shield size={20} className="text-cyan-600 flex-shrink-0 mt-0.5" />
                            <p className="text-cyan-800 text-sm leading-relaxed">
                                Job24h cam kết bảo vệ quyền riêng tư và thông tin cá nhân của người dùng theo đúng quy định của
                                <strong> Luật An ninh mạng 2018</strong> và <strong>Nghị định 13/2023/NĐ-CP</strong> về bảo vệ dữ liệu cá nhân của Việt Nam.
                                Chính sách này mô tả cách chúng tôi xử lý dữ liệu của bạn một cách minh bạch và có trách nhiệm.
                            </p>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="space-y-8">
                        {SECTIONS.map((section) => (
                            <div
                                key={section.title}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0">
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
                            Có thắc mắc về chính sách bảo mật?
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            <Mail size={16} />
                            Liên hệ bộ phận bảo mật
                        </Link>
                        <div className="mt-6 text-xs text-slate-400">
                            Xem thêm:{' '}
                            <Link to="/terms" className="text-indigo-500 hover:text-indigo-700 underline">
                                Điều khoản sử dụng
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
