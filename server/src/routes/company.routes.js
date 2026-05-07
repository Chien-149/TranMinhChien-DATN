const express = require('express');
const router = express.Router();
const companyController = require('../controller/company.controller');
const { asyncHandler, authUser } = require('../auth/checkAuth');

const multer = require('multer');
const { uploadSingle } = require('../config/cloudinaryUpload');
const upload = multer({ storage: multer.memoryStorage() });

// Protected routes (require login)
router.get('/me', authUser, asyncHandler(companyController.getMyCompany));
router.put('/me', authUser, asyncHandler(companyController.updateCompany));
router.put('/me/logo', authUser, upload.single('logo'), asyncHandler(companyController.uploadLogo));
router.put('/me/cover', authUser, asyncHandler(companyController.uploadCover));
router.get('/dashboard', authUser, asyncHandler(companyController.getDashboardStats));
router.post('/create', authUser, upload.single('logo'), asyncHandler(companyController.createCompany));

router.get('/list', asyncHandler(companyController.getAllCompany));
router.put('/update/:id', asyncHandler(companyController.updateStatusCompany));

// Public routes
router.get('/:id', asyncHandler(companyController.getCompanyById));

module.exports = router;
