const express = require('express');
const router = express.Router();

const { asyncHandler, authUser } = require('../auth/checkAuth');

const favouriteController = require('../controller/favourite.controller');

router.post('/create', authUser, asyncHandler(favouriteController.createFavourite));
router.get('/get-favourite-by-user-id', authUser, asyncHandler(favouriteController.getFavouriteByUserId));
router.get('/list/:jobId', asyncHandler(favouriteController.getAllFavourites));

module.exports = router;
