const express = require('express');
const router = express.Router();
const walletController = require('../controller/wallet.controller');
const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

// Get top-up packages (public)
router.get('/topup-packages', asyncHandler(walletController.getTopUpPackages));

// ==================== PROTECTED ROUTES ====================
// Get wallet info
router.get('/', authUser, asyncHandler(walletController.getWallet));

// Get transactions
router.get('/transactions', authUser, asyncHandler(walletController.getTransactions));

// Create top-up request
router.post('/topup', authUser, asyncHandler(walletController.createTopUp));

// Cancel top-up
router.delete('/topup/:transactionId', authUser, asyncHandler(walletController.cancelTopUp));

// ==================== ADMIN / WEBHOOK ROUTES ====================
// Confirm top-up (webhook or admin)
router.post('/topup/:transactionId/confirm', asyncHandler(walletController.confirmTopUp));

// Admin add balance
router.post('/admin/add-balance', authAdmin, asyncHandler(walletController.adminAddBalance));

module.exports = router;
