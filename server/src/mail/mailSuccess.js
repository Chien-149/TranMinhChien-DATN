const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const SendMailCompanyVerified = async (company) => {
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
            subject: `Công ty ${company.companyName} đã được xác thực`,
            html: `
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: 'Roboto', sans-serif;
                        background-color: #f2f4f8;
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
                        background: linear-gradient(135deg, #00b894, #55efc4);
                        padding: 30px;
                        color: #ffffff;
                        text-align: center;
                    }
                    .content {
                        padding: 30px;
                    }
                    .company-info {
                        margin-top: 20px;
                        padding: 15px 20px;
                        border-left: 4px solid #00b894;
                        background: #f8f9fa;
                        border-radius: 8px;
                        line-height: 1.7;
                    }
                    .logo {
                        width: 80px;
                        height: 80px;
                        border-radius: 10px;
                        object-fit: cover;
                        margin-bottom: 15px;
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
                        <h2>Công ty của bạn đã được xác thực</h2>
                    </div>

                    <div class="content">
                        <p>Xin chúc mừng! Công ty <strong>${
                            company.companyName
                        }</strong> đã được đội ngũ <strong>Moho</strong> kiểm duyệt và xác thực thành công.</p>
                        
                        <div class="company-info">
                            <p><strong>Tên công ty:</strong> ${company.companyName}</p>
                            <p><strong>Ngành nghề:</strong> ${company.industry?.name || 'Chưa cập nhật'}</p>
                            <p><strong>Quy mô:</strong> ${company.companySize || 'Chưa cập nhật'}</p>
                            <p><strong>Năm thành lập:</strong> ${company.foundedYear || 'Chưa cập nhật'}</p>
                            <p><strong>Địa chỉ:</strong> ${company.companyAddress || 'Chưa cập nhật'}</p>
                            <p><strong>Website:</strong> ${company.companyWebsite || 'Chưa cập nhật'}</p>
                        </div>

                        <p style="margin-top: 25px;">
                            Bạn đã có toàn quyền sử dụng các chức năng dành cho nhà tuyển dụng:
                            đăng tin tuyển dụng, quản lý hồ sơ ứng viên, tin nhắn và nhiều hơn nữa.
                        </p>
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

        console.log('Company verified email sent:', info.messageId);
    } catch (error) {
        console.log('Error sending company verified email:', error);
    }
};

module.exports = SendMailCompanyVerified;
