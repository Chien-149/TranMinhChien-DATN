const { Wallet, Transaction } = require('../models/wallet.model');
const Company = require('../models/company.model');
const { BadRequestError, NotFoundError } = require('../core/error.response');

// Top-up packages with bonus
const TOPUP_PACKAGES = {
    100000: { amount: 100000, bonus: 0 },
    200000: { amount: 200000, bonus: 0 },
    500000: { amount: 500000, bonus: 5 }, // 5% bonus
    1000000: { amount: 1000000, bonus: 10 }, // 10% bonus
    2000000: { amount: 2000000, bonus: 15 }, // 15% bonus
    5000000: { amount: 5000000, bonus: 20 }, // 20% bonus
};

class WalletController {
    // Get wallet info
    async getWallet(req, res) {
        const { id: userId } = req.user;

        const company = await Company.findOne({ userId });
        if (!company) {
            throw new NotFoundError('Không tìm thấy thông tin công ty');
        }

        let wallet = await Wallet.findOne({ companyId: company._id });

        // Create wallet if not exists
        if (!wallet) {
            wallet = await Wallet.create({ companyId: company._id });
        }

        res.status(200).json({
            success: true,
            data: wallet,
        });
    }

    // Get transaction history
    async getTransactions(req, res) {
        const { id: userId } = req.user;
        const { type, status, page = 1, limit = 20 } = req.query;

        const company = await Company.findOne({ userId });
        if (!company) {
            throw new NotFoundError('Không tìm thấy thông tin công ty');
        }

        const query = { companyId: company._id };

        if (type && type !== 'all') {
            query.type = type;
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('relatedJob', 'title'),
            Transaction.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    }

    // Create top-up request
    async createTopUp(req, res) {
        const { id: userId } = req.user;

        const { amount, paymentMethod } = req.body;

        if (!amount || amount < 50000) {
            throw new BadRequestError('Số tiền nạp tối thiểu là 50.000đ');
        }

        const company = await Company.findOne({ userId });
        if (!company) {
            throw new NotFoundError('Không tìm thấy thông tin công ty');
        }

        let wallet = await Wallet.findOne({ companyId: company._id });
        if (!wallet) {
            wallet = await Wallet.create({ companyId: company._id });
        }

        // Calculate bonus
        const packageInfo = TOPUP_PACKAGES[amount];
        const bonusPercent = packageInfo?.bonus || 0;
        const bonusAmount = Math.floor((amount * bonusPercent) / 100);
        const totalAmount = amount + bonusAmount;

        // Create pending transaction
        const transaction = await Transaction.create({
            companyId: company._id,
            type: 'topup',
            amount: totalAmount,
            paymentMethod: paymentMethod || 'bank',
            status: 'pending',
            description:
                bonusAmount > 0
                    ? `Nạp ${amount.toLocaleString()}đ + Bonus ${bonusAmount.toLocaleString()}đ (${bonusPercent}%)`
                    : `Nạp ${amount.toLocaleString()}đ`,
            note: `Original: ${amount}, Bonus: ${bonusAmount}`,
        });

        // Generate payment info based on method
        let paymentInfo = {};

        if (paymentMethod === 'bank') {
            paymentInfo = {
                bankName: 'Vietcombank',
                accountNumber: '1234567890123',
                accountName: 'CONG TY TNHH JOB FINDER',
                content: `TOPUP ${transaction._id}`,
                amount: amount,
            };
        } else if (paymentMethod === 'momo') {
            paymentInfo = {
                phone: '0987654321',
                name: 'JOB FINDER',
                content: `TOPUP ${transaction._id}`,
                amount: amount,
            };
        } else if (paymentMethod === 'vnpay') {
            // In real app, generate VNPay payment URL
            paymentInfo = {
                qrCode: `https://api.vietqr.io/image/970436-1234567890123-print.jpg?amount=${amount}&addInfo=TOPUP%20${transaction._id}`,
                amount: amount,
            };
        }

        res.status(201).json({
            success: true,
            message: 'Tạo yêu cầu nạp tiền thành công',
            data: {
                transaction,
                paymentInfo,
                bonus: {
                    percent: bonusPercent,
                    amount: bonusAmount,
                    total: totalAmount,
                },
            },
        });
    }

    // Confirm top-up (Admin or webhook)
    async confirmTopUp(req, res) {
        const { transactionId } = req.params;
        const { paymentRef } = req.body;

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            throw new NotFoundError('Không tìm thấy giao dịch');
        }

        if (transaction.status !== 'pending') {
            throw new BadRequestError('Giao dịch đã được xử lý');
        }

        if (transaction.type !== 'topup') {
            throw new BadRequestError('Giao dịch không hợp lệ');
        }

        // Update wallet
        const wallet = await Wallet.findOne({ companyId: transaction.companyId });
        const newBalance = wallet.balance + transaction.amount;

        await Wallet.findByIdAndUpdate(wallet._id, {
            balance: newBalance,
            $inc: { totalTopUp: transaction.amount },
        });

        // Update transaction
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            transactionId,
            {
                status: 'success',
                paymentRef: paymentRef || '',
                balanceAfter: newBalance,
            },
            { new: true },
        );

        res.status(200).json({
            success: true,
            message: 'Xác nhận nạp tiền thành công',
            data: {
                transaction: updatedTransaction,
                newBalance,
            },
        });
    }

    // Cancel top-up
    async cancelTopUp(req, res) {
        const { id: userId } = req.user;
        const { transactionId } = req.params;

        const company = await Company.findOne({ userId });
        if (!company) {
            throw new NotFoundError('Không tìm thấy thông tin công ty');
        }

        const transaction = await Transaction.findOne({
            _id: transactionId,
            companyId: company._id,
        });

        if (!transaction) {
            throw new NotFoundError('Không tìm thấy giao dịch');
        }

        if (transaction.status !== 'pending') {
            throw new BadRequestError('Không thể hủy giao dịch đã xử lý');
        }

        await Transaction.findByIdAndUpdate(transactionId, {
            status: 'cancelled',
        });

        res.status(200).json({
            success: true,
            message: 'Đã hủy yêu cầu nạp tiền',
        });
    }

    // Get top-up packages
    async getTopUpPackages(req, res) {
        const packages = Object.entries(TOPUP_PACKAGES).map(([amount, info]) => ({
            amount: parseInt(amount),
            bonus: info.bonus,
            bonusAmount: Math.floor((parseInt(amount) * info.bonus) / 100),
            total: parseInt(amount) + Math.floor((parseInt(amount) * info.bonus) / 100),
        }));

        res.status(200).json({
            success: true,
            data: packages,
        });
    }

    // Admin: Add balance manually
    async adminAddBalance(req, res) {
        const { companyId, amount, note } = req.body;

        if (!companyId || !amount) {
            throw new BadRequestError('Thiếu thông tin');
        }

        const wallet = await Wallet.findOne({ companyId });
        if (!wallet) {
            throw new NotFoundError('Không tìm thấy ví');
        }

        const newBalance = wallet.balance + amount;

        await Wallet.findByIdAndUpdate(wallet._id, {
            balance: newBalance,
            $inc: { totalTopUp: amount > 0 ? amount : 0 },
        });

        await Transaction.create({
            companyId,
            type: amount > 0 ? 'topup' : 'other',
            amount,
            paymentMethod: 'admin',
            status: 'success',
            description: note || 'Admin điều chỉnh số dư',
            balanceAfter: newBalance,
        });

        res.status(200).json({
            success: true,
            message: 'Cập nhật số dư thành công',
            data: { newBalance },
        });
    }
}

module.exports = new WalletController();
