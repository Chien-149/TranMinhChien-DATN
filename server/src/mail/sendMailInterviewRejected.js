const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const SendMailInterviewRejected = async (application, company, job, reason) => {
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
            subject: `Kết quả phỏng vấn – Vị trí ${job.title}`,
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
                        <h2>Kết quả phỏng vấn</h2>
                    </div>

                    <div class="content">
                        <p>Chào <strong>${application.fullName}</strong>,</p>

                        <p>
                            Cảm ơn bạn đã dành thời gian tham gia phỏng vấn cho vị trí 
                            <strong>${job.title}</strong> tại 
                            <strong>${company.companyName}</strong>.
                        </p>

                        <p>
                            Sau quá trình trao đổi và xem xét tổng thể, chúng tôi rất tiếc phải thông báo rằng 
                            bạn <strong>chưa phù hợp</strong> với yêu cầu của vị trí này tại thời điểm hiện tại.
                        </p>

                        ${
                            reason
                                ? `
                        <div class="reason-box">
                            <strong>Lý do phản hồi:</strong><br/>
                            ${reason}
                        </div>
                        `
                                : ''
                        }

                        <p style="margin-top: 20px;">
                            Đây không phải là đánh giá thấp năng lực của bạn mà chủ yếu liên quan đến mức độ 
                            phù hợp với vị trí tuyển dụng.
                        </p>

                        <p>
                            Chúng tôi rất trân trọng sự quan tâm của bạn dành cho công ty và hy vọng sẽ được 
                            hợp tác cùng bạn trong những cơ hội phù hợp hơn trong tương lai.
                        </p>
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

        console.log('Interview rejection email sent:', info.messageId);
    } catch (error) {
        console.log('Error sending interview rejection email:', error);
    }
};

module.exports = SendMailInterviewRejected;
