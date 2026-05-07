const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Wallet schema - stores company wallet balance
const walletSchema = new Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: 'company',
            required: true,
            unique: true,
        },

        balance: { type: Number, default: 0 },
        totalTopUp: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    },
);

const transactionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        amount: { type: Number, required: true },
        type: { type: String, enum: ['momo', 'vnpay', 'boost'], required: true },

        // Số dư trước và sau giao dịch
        balanceBefore: { type: Number, default: 0 },
        balanceAfter: { type: Number, default: 0 },

        // Trạng thái giao dịch
        status: {
            type: String,
            enum: ['pending', 'success', 'failed', 'cancelled'],
            default: 'pending',
        },

        // Mô tả giao dịch
        description: { type: String, default: '' },
    },
    {
        timestamps: true,
    },
);

const Wallet = mongoose.model('wallet', walletSchema);
const Transaction = mongoose.model('transaction', transactionSchema);

module.exports = { Wallet, Transaction };
