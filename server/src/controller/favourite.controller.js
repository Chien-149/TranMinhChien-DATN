const FavouriteService = require('../services/favourite.service');
const { OK } = require('../core/success.response');

class FavouriteController {
    async createFavourite(req, res) {
        const { id } = req.user;
        const { jobId } = req.body;
        const favourite = await FavouriteService.createFavourite(id, jobId);
        new OK({ message: 'success', metadata: favourite }).send(res);
    }

    async getFavouriteByUserId(req, res) {
        const { id } = req.user;
        const favourite = await FavouriteService.getFavouriteByUserId(id);
        new OK({ message: 'success', metadata: favourite }).send(res);
    }

    async getAllFavourites(req, res) {
        const { jobId } = req.params;
        const favourites = await FavouriteService.getAllFavourites(jobId);
        new OK({ message: 'success', metadata: favourites }).send(res);
    }
}

module.exports = new FavouriteController();
