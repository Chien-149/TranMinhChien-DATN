const express = require('express');
const router = express.Router();

const { authUser } = require('../auth/checkAuth');

const multer = require('multer');
const { uploadSingle } = require('../config/cloudinaryUpload');
const upload = multer({ storage: multer.memoryStorage() });

const controllerBlog = require('../controller/blog.controller');

router.post('/upload-image', upload.single('image'), controllerBlog.uploadImage);
router.post('/create', authUser, controllerBlog.createBlog);
router.get('/get-all', controllerBlog.getAllBlog);
router.post('/update', authUser, controllerBlog.updateBlog);
router.post('/delete', authUser, controllerBlog.deleteBlog);
router.get('/get-by-id', controllerBlog.getBlogById);

module.exports = router;
