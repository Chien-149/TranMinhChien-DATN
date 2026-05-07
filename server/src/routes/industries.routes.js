const express = require('express');
const router = express.Router();

const multer = require('multer');
const { uploadSingle } = require('../config/cloudinaryUpload');
const upload = multer({ storage: multer.memoryStorage() });

const { asyncHandler, authUser } = require('../auth/checkAuth');

const industriesController = require('../controller/industries.controller');

router.post('/create', upload.single('image'), asyncHandler(industriesController.createIndustries));
router.get('/list', asyncHandler(industriesController.getAllCategory));

module.exports = router;
