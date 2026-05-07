const { OK } = require('../core/success.response');
const CompanyFollow = require('../models/companyFollow.model');
const Company = require('../models/company.model');
const { NotFoundError } = require('../core/error.response');

class CompanyFollowController {
    // Toggle follow / unfollow a company
    async toggleFollow(req, res) {
        const { id: userId } = req.user;
        const { companyId } = req.body;

        const existing = await CompanyFollow.findOne({ userId, companyId });

        if (existing) {
            await CompanyFollow.findByIdAndDelete(existing._id);
            return new OK({ message: 'Đã bỏ theo dõi công ty', metadata: { following: false } }).send(res);
        }

        await CompanyFollow.create({ userId, companyId });
        return new OK({ message: 'Đã theo dõi công ty', metadata: { following: true } }).send(res);
    }

    // Check if current user follows a company
    async checkFollow(req, res) {
        const { id: userId } = req.user;
        const { companyId } = req.params;

        const existing = await CompanyFollow.findOne({ userId, companyId });
        return new OK({ message: 'success', metadata: { following: !!existing } }).send(res);
    }

    // Get all companies followed by the current user
    async getFollowedCompanies(req, res) {
        const { id: userId } = req.user;

        const follows = await CompanyFollow.find({ userId })
            .populate('companyId', 'companyName companyLogo companyAddress industry')
            .sort({ createdAt: -1 })
            .lean();

        return new OK({ message: 'success', metadata: follows.map((f) => f.companyId) }).send(res);
    }

    // Get total follower count for a company (public)
    async getFollowerCount(req, res) {
        const { companyId } = req.params;
        const count = await CompanyFollow.countDocuments({ companyId });
        return new OK({ message: 'success', metadata: { count } }).send(res);
    }
}

module.exports = new CompanyFollowController();
