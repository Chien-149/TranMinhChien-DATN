const { BadRequestError } = require('../core/error.response');
const Favourite = require('../models/favourite.model');
const Job = require('../models/job.model');

class FavouriteService {
    async createFavourite(userId, jobId) {
        const findFavourite = await Favourite.findOne({ userId, jobId });
        if (findFavourite) {
            await Favourite.findByIdAndDelete(findFavourite._id);
            await Job.findByIdAndUpdate(jobId, { $pull: { favourite: userId } });

            throw new BadRequestError('Đã sản phẩm khỏi yêu thích');
        } else {
            const favourite = await Favourite.create({ userId, jobId });
            await Job.findByIdAndUpdate(jobId, { $push: { favourite: userId } });
            return favourite;
        }
    }

    async getFavouriteByUserId(userId) {
        const favourite = await Favourite.find({ userId }).populate({
            path: 'jobId',
            populate: { path: 'companyId', select: 'companyName companyLogo' },
        });
        return favourite;
    }

    async getAllFavourites(jobId) {
        const favourites = await Favourite.find({ jobId });
        return favourites;
    }
}

module.exports = new FavouriteService();
