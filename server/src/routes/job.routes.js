const express = require('express');
const router = express.Router();
const jobController = require('../controller/job.controller');
const { asyncHandler, authUser } = require('../auth/checkAuth');

// ==================== PUBLIC ROUTES ====================
// Search jobs
router.get('/search', asyncHandler(jobController.searchJobs));

// Get locations from jobs
router.get('/locations', asyncHandler(jobController.getLocations));

// Get public dashboard stats for homepage
router.get('/dashboard-stats', asyncHandler(jobController.getPublicDashboardStats));

router.get('/admin', asyncHandler(jobController.getJobsByAdmin));

// Get boost packages
router.get('/boost-packages', asyncHandler(jobController.getBoostPackages));

router.get('/list', asyncHandler(jobController.getAllJobs));

// Get job by ID (public)
router.get('/detail/:id', asyncHandler(jobController.getJobById));

router.put('/update/:id', asyncHandler(jobController.updateStatusJob));

// ==================== PROTECTED ROUTES (EMPLOYER) ====================
// Get company's jobs
router.get('/', authUser, asyncHandler(jobController.getCompanyJobs));

// Create new job
router.post('/', authUser, asyncHandler(jobController.createJob));

// Update job
router.put('/:id', authUser, asyncHandler(jobController.updateJob));

// Delete job
router.delete('/:id', authUser, asyncHandler(jobController.deleteJob));

// Toggle job status
router.patch('/:id/toggle-status', authUser, asyncHandler(jobController.toggleJobStatus));

// Duplicate job
router.post('/:id/duplicate', authUser, asyncHandler(jobController.duplicateJob));

// Boost job
router.post('/:id/boost', authUser, asyncHandler(jobController.boostJob));

module.exports = router;
