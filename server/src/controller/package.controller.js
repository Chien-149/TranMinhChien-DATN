const { OK } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');
const modelPackage = require('../models/package.model');
const modelUser = require('../models/users.model');
const { Transaction } = require('../models/wallet.model');
const modelJob = require('../models/job.model');

const crypto = require('crypto');
const axios = require('axios');
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');
const dayjs = require('dayjs');

function generatePayID() {
    // Tạo ID thanh toán bao gồm cả giây để tránh trùng lặp
    const now = new Date();
    const timestamp = now.getTime();
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    return `PAY${timestamp}${seconds}${milliseconds}`;
}

class PackageController {
    async createPackage(req, res) {
        const { name, price, description, durationDays } = req.body;
        const data = await modelPackage.create({ name, price, description, durationDays });
        return new OK({
            message: 'Create package successfully',
            metadata: data,
        }).send(res);
    }

    async getAllPackage(req, res) {
        const data = await modelPackage.find();
        return new OK({
            message: 'Get all packages successfully',
            metadata: data,
        }).send(res);
    }

    async createPaymentPackage(req, res) {
        const { price, paymentMethod } = req.body;
        const { id: userId } = req.user;
        try {
            if (paymentMethod === 'vnpay') {
                const vnpay = new VNPay({
                    tmnCode: 'DH2F13SW',
                    secureSecret: '7VJPG70RGPOWFO47VSBT29WPDYND0EJG',
                    vnpayHost: 'https://sandbox.vnpayment.vn',
                    testMode: true, // tùy chọn
                    hashAlgorithm: 'SHA512', // tùy chọn
                    loggerFn: ignoreLogger, // tùy chọn
                });
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const vnpayResponse = await vnpay.buildPaymentUrl({
                    vnp_Amount: price, //
                    vnp_IpAddr: '127.0.0.1', //
                    vnp_TxnRef: `${userId} + ${generatePayID()}`, // Sử dụng paymentId thay vì singlePaymentId
                    vnp_OrderInfo: `Thanh toan don hang ${userId}`,
                    vnp_OrderType: ProductCode.Other,
                    vnp_ReturnUrl: `http://localhost:3000/api/packages/vnpay`, //
                    vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
                    vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
                    vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
                });
                return new OK({ message: 'Thanh toán thông báo', metadata: vnpayResponse }).send(res);
            }
            if (paymentMethod === 'momo') {
                var partnerCode = 'MOMO';
                var accessKey = 'F8BBA842ECF85';
                var secretkey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
                var requestId = partnerCode + new Date().getTime();
                var orderId = requestId;
                var orderInfo = `thanh toan ${userId}`; // nội dung giao dịch thanh toán
                var redirectUrl = 'http://localhost:3000/api/packages/momo'; // 8080
                var ipnUrl = 'http://localhost:3000/api/packages/momo';
                var amount = price;
                var requestType = 'captureWallet';
                var extraData = ''; //pass empty value if your merchant does not have stores

                var rawSignature =
                    'accessKey=' +
                    accessKey +
                    '&amount=' +
                    amount +
                    '&extraData=' +
                    extraData +
                    '&ipnUrl=' +
                    ipnUrl +
                    '&orderId=' +
                    orderId +
                    '&orderInfo=' +
                    orderInfo +
                    '&partnerCode=' +
                    partnerCode +
                    '&redirectUrl=' +
                    redirectUrl +
                    '&requestId=' +
                    requestId +
                    '&requestType=' +
                    requestType;
                //puts raw signature

                //signature
                var signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');

                //json object send to MoMo endpoint
                const requestBody = JSON.stringify({
                    partnerCode: partnerCode,
                    accessKey: accessKey,
                    requestId: requestId,
                    amount: amount,
                    orderId: orderId,
                    orderInfo: orderInfo,
                    redirectUrl: redirectUrl,
                    ipnUrl: ipnUrl,
                    extraData: extraData,
                    requestType: requestType,
                    signature: signature,
                    lang: 'en',
                });

                const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                return new OK({ message: 'Thanh toán thông báo', metadata: response.data }).send(res);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async getTransaction(req, res) {
        const { id } = req.user;

        const data = await Transaction.find({ userId: id });
        return new OK({
            message: 'Get all transactions successfully',
            metadata: data,
        }).send(res);
    }

    async momoCallBack(req, res) {
        const { orderInfo, resultCode, amount } = req.query;

        if (resultCode === '0') {
            const userId = orderInfo.split(' ')[2];
            const user = await modelUser.findById(userId);
            if (!user) {
                return new BadRequestError({
                    message: 'User not found',
                }).send(res);
            }
            const balanceBefore = user.balance;
            const finalAmount = Number(amount);

            user.balance = balanceBefore + finalAmount;
            await user.save();
            await Transaction.create({
                userId: userId,
                amount: finalAmount,
                type: 'momo',
                balanceBefore: balanceBefore,
                balanceAfter: user.balance,
                status: 'success',
                description: `Nạp tiền qua MoMo`,
            });
            return res.redirect(`${process.env.URL_CLIENT}/company/wallet`);
        }
    }

    async vnpayCallback(req, res) {
        const { vnp_ResponseCode, vnp_Amount, vnp_OrderInfo } = req.query;
        if (vnp_ResponseCode === '00') {
            const userId = vnp_OrderInfo.split(' ')[4];

            const user = await modelUser.findById(userId);
            if (!user) {
                return new Error({
                    message: 'User not found',
                }).send(res);
            }
            const balanceBefore = user.balance;
            const finalAmount = Number(vnp_Amount / 100);

            user.balance = balanceBefore + finalAmount;
            await user.save();
            await Transaction.create({
                userId: userId,
                amount: finalAmount,
                type: 'vnpay',
                balanceBefore: balanceBefore,
                balanceAfter: user.balance,
                status: 'success',
                description: `Nạp tiền qua VNPay`,
            });
            return res.redirect(`${process.env.URL_CLIENT}/company/wallet`);
        }
    }

    async upToJob(req, res) {
        const { jobId, packageId } = req.body;
        const { id } = req.user;
        const job = await modelJob.findById(jobId);
        if (!job) {
            return new BadRequestError({
                message: 'Job not found',
            }).send(res);
        }
        const package2 = await modelPackage.findById(packageId);
        if (!package2) {
            return new BadRequestError({
                message: 'Package not found',
            }).send(res);
        }

        const findUser = await modelUser.findById(id);

        if (findUser.balance < package2.price) {
            throw new BadRequestError('Số dư không đủ để đẩy tin');
        }

        const balanceBefore = findUser.balance;
        const balanceAfter = balanceBefore - package2.price;

        job.isBoosted = true;
        job.boostExpiry = dayjs().add(package2.durationDays, 'day').toDate();
        job.boostPackage = package2._id;

        await modelUser.findByIdAndUpdate(id, { balance: balanceAfter });
        await job.save();

        // Ghi lại lịch sử giao dịch trừ tiền
        await Transaction.create({
            userId: id,
            amount: package2.price,
            type: 'boost', // Hoặc có thể dùng 1 giá trị enum khác nếu model có type enum strict
            balanceBefore,
            balanceAfter,
            status: 'success',
            description: `Đẩy tin "${job.title}" lên top`,
        });

        return new OK({
            message: 'Job boosted successfully',
            metadata: job,
        }).send(res);
    }
}

module.exports = new PackageController();
