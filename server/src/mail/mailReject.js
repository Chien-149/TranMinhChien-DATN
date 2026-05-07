const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const SendMailCompanyRejected = async (company, reason) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        const info = await transport.sendMail({
            from: `"Moho" <${process.env.EMAIL_USER}>`,
            to: company.companyEmail,
            subject: `Xác thực công ty ${company.companyName} – Bị từ chối`,
            html: `
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: 'Roboto', sans-serif;
                        background-color: #f7f8fa;
                        margin: 0;
                        padding: 0;
                        color: #2d3436;
                    }
                    .container {
                        max-width: 600px;
                        margin: 30px auto;
                        background-color: #ffffff;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 6px 12px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #d63031, #ff7675);
                        padding: 30px;
                        color: #ffffff;
                        text-align: center;
                    }
                    .content {
                        padding: 30px;
                    }
                    .reason-box {
                        margin-top: 20px;
                        padding: 15px 20px;
                        border-left: 4px solid #d63031;
                        background: #fff5f5;
                        border-radius: 8px;
                        line-height: 1.7;
                        font-size: 15px;
                        color: #b33939;
                    }
                    .footer {
                        text-align: center;
                        font-size: 14px;
                        padding: 20px;
                        background-color: #f1f2f6;
                        color: #636e72;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Xác thực công ty không thành công</h2>
                    </div>

                    <div class="content">
                        <p>Chào <strong>${company.companyName}</strong>,</p>

                        <p>
                            Đội ngũ kiểm duyệt của <strong>Moho</strong> đã xem xét hồ sơ công ty của bạn.
                            Rất tiếc, yêu cầu xác thực công ty <strong>không được chấp thuận</strong> vào thời điểm này.
                        </p>

                        <div class="reason-box">
                            <strong>Lý do từ chối:</strong><br/>
                            ${reason}
                        </div>

                        <p style="margin-top: 20px;">
                            Bạn vui lòng cập nhật lại thông tin doanh nghiệp hoặc bổ sung giấy tờ cần thiết,
                            sau đó gửi lại yêu cầu xác thực.
                        </p>

                        <p>Nếu bạn cần hỗ trợ thêm, hãy liên hệ bộ phận CSKH của chúng tôi.</p>
                    </div>

                    <div class="footer">
                        Trân trọng,<br/>
                        <strong>Moho Team</strong>
                    </div>
                </div>
            </body>
            </html>
            `,
        });

        console.log('Company rejected email sent:', info.messageId);
    } catch (error) {
        console.log('Error sending company rejected email:', error);
    }
};

module.exports = SendMailCompanyRejected;
