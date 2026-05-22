const express = require('express');
const router = express.Router();

const { asyncHandler, authUser } = require('../auth/checkAuth');

const packageController = require('../controller/package.controller');

router.post('/create', authUser, asyncHandler(packageController.createPackage));
router.get('/list', asyncHandler(packageController.getAllPackage));
router.put('/:id', authUser, asyncHandler(packageController.updatePackage));
router.delete('/:id', authUser, asyncHandler(packageController.deletePackage));
router.post('/payment', authUser, asyncHandler(packageController.createPaymentPackage));
router.get('/momo', asyncHandler(packageController.momoCallBack));
router.get('/vnpay', asyncHandler(packageController.vnpayCallback));
router.post('/up-to-job', authUser, asyncHandler(packageController.upToJob));

router.get('/transaction', authUser, asyncHandler(packageController.getTransaction));

module.exports = router;
