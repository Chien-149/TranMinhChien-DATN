const express = require('express');
const router = express.Router();
const AdminController = require('../controller/admin.controller');
const { asyncHandler, authAdmin } = require('../auth/checkAuth');

// All admin routes require admin authentication
router.use(authAdmin);

// Dashboard stats
router.get('/stats', asyncHandler(AdminController.getAdminStats));

module.exports = router;
