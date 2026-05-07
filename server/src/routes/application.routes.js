const express = require('express');
const router = express.Router();
const applicationController = require('../controller/application.controller');
const { asyncHandler, authUser } = require('../auth/checkAuth');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/cv');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

router.post('/apply', authUser, upload.single('cvFile'), asyncHandler(applicationController.applyForJob));
router.get('/list', authUser, asyncHandler(applicationController.getAllJobApplications));
router.post('/accept', authUser, asyncHandler(applicationController.accpectJobApplication));
router.post('/interview-success', authUser, asyncHandler(applicationController.interviewSuccess));
router.post('/reject', authUser, asyncHandler(applicationController.rejectJobApplication));
router.get('/user', authUser, asyncHandler(applicationController.getJobsByUser));
router.post('/:applicationId/viewed', authUser, asyncHandler(applicationController.markCVViewed));

module.exports = router;
