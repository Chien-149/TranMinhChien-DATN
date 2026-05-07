const express = require('express');
const router = express.Router();

const { asyncHandler, authUser } = require('../auth/checkAuth');

const candidateProfileController = require('../controller/candidateProfile.controller');

router.put('/update', authUser, asyncHandler(candidateProfileController.updateCandidateProfile));

module.exports = router;
