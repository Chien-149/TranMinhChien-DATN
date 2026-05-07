const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const SendMailInterviewSchedule = async (application, company, job) => {
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
            from: `"${company.companyName}" <${process.env.EMAIL_USER}>`,
            to: application.email,
            subject: `Thư mời phỏng vấn – Vị trí ${job.title}`,
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
                        background: linear-gradient(135deg, #0984e3, #74b9ff);
                        padding: 30px;
                        color: #ffffff;
                        text-align: center;
                    }
                    .content {
                        padding: 30px;
                    }
                    .info-box {
                        margin-top: 20px;
                        padding: 15px 20px;
                        border-left: 4px solid #0984e3;
                        background: #f0f8ff;
                        border-radius: 8px;
                        line-height: 1.7;
                        font-size: 15px;
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
                        <h2>Thư mời phỏng vấn</h2>
                    </div>

                    <div class="content">
                        <p>Chào <strong>${application.fullName}</strong>,</p>

                        <p>
                            Cảm ơn bạn đã ứng tuyển vào vị trí 
                            <strong>${job.title}</strong> tại 
                            <strong>${company.companyName}</strong>.
                        </p>

                        <p>
                            Sau khi xem xét hồ sơ của bạn, chúng tôi đánh giá bạn rất phù hợp và 
                            xin trân trọng gửi đến bạn <strong>thư mời phỏng vấn</strong>.
                        </p>

                        <div class="info-box">
                            <strong>📅 Thời gian:</strong> ${application.interview.date} – ${
                application.interview.time
            }<br/>
                            <strong>📍 Địa điểm:</strong> ${application.interview.location}<br/>
                            <strong>📝 Ghi chú:</strong> ${application.interview.notes || 'Không có'}
                        </div>

                        <p style="margin-top: 20px;">
                            Vui lòng phản hồi email này để xác nhận lịch phỏng vấn.
                        </p>

                        <p>Chúng tôi rất mong được gặp bạn trong buổi phỏng vấn sắp tới.</p>
                    </div>

                    <div class="footer">
                        Trân trọng,<br/>
                        <strong>${company.companyName} – HR Department</strong>
                    </div>
                </div>
            </body>
            </html>
            `,
        });

        console.log('Interview email sent:', info.messageId);
    } catch (error) {
        console.log('Error sending interview email:', error);
    }
};

module.exports = SendMailInterviewSchedule;
