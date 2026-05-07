const express = require('express');
const router = express.Router();
const companyFollowController = require('../controller/companyFollow.controller');
const { asyncHandler, authUser } = require('../auth/checkAuth');

router.post('/toggle', authUser, asyncHandler(companyFollowController.toggleFollow));
router.get('/check/:companyId', authUser, asyncHandler(companyFollowController.checkFollow));
router.get('/following', authUser, asyncHandler(companyFollowController.getFollowedCompanies));
router.get('/count/:companyId', asyncHandler(companyFollowController.getFollowerCount));

module.exports = router;
