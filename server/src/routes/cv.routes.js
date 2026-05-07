const express = require('express');
const router = express.Router();

const cvController = require('../controller/cv.controller');
const { asyncHandler, authUser } = require('../auth/checkAuth');

const multer = require('multer');
const { uploadSingle } = require('../config/cloudinaryUpload');
const upload = multer({ storage: multer.memoryStorage() });

// CRUD operations (yêu cầu đăng nhập)
router.get('/', authUser, asyncHandler(cvController.getAllCVs));
router.get('/:cvId', authUser, asyncHandler(cvController.getCVById));
router.post('/', authUser, asyncHandler(cvController.createCV));
router.put('/:cvId', authUser, asyncHandler(cvController.updateCV));
router.delete('/:cvId', authUser, asyncHandler(cvController.deleteCV));

// Upload avatar for CV
router.post('/:cvId/avatar', authUser, upload.single('avatar'), asyncHandler(cvController.uploadAvatar));

// Special operations
router.post('/:cvId/clone', authUser, asyncHandler(cvController.cloneCV));
router.patch('/:cvId/default', authUser, asyncHandler(cvController.setDefaultCV));

// Export PDF (yêu cầu đăng nhập)
router.get('/:cvId/export-pdf', authUser, asyncHandler(cvController.exportPDF));

// Export PDF trực tiếp từ data (không cần đăng nhập - dùng cho guest)
router.post('/export-pdf', asyncHandler(cvController.exportPDFDirect));

module.exports = router;
