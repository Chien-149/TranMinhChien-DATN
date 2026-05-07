const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const SendMailInterviewSuccess = async (application, company, job) => {
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

        await transport.sendMail({
            from: `"${company.companyName}" <${process.env.EMAIL_USER}>`,
            to: application.email,
            subject: `Xác nhận phỏng vấn thành công – Vị trí ${job.title}`,
            html: `
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:600px;margin:0 auto;padding:24px">
                    <h2 style="color:#0f766e">Chúc mừng bạn đã phỏng vấn thành công</h2>
                    <p>Chào <strong>${application.fullName}</strong>,</p>
                    <p>
                        ${company.companyName} xin chúc mừng bạn đã vượt qua vòng phỏng vấn cho vị trí
                        <strong>${job.title}</strong>.
                    </p>
                    <p>
                        Chúng tôi sẽ sớm liên hệ với bạn để trao đổi các bước tiếp theo.
                    </p>
                    <p>Trân trọng,<br/><strong>${company.companyName}</strong></p>
                </div>
            `,
        });
    } catch (error) {
        console.log('Error sending success interview email:', error);
    }
};

module.exports = SendMailInterviewSuccess;
