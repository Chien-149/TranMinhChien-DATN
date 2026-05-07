const { OK } = require('../core/success.response');
const modelIndustries = require('../models/industries.model');
const modelJobs = require('../models/job.model');
const { uploadSingle } = require('../config/cloudinaryUpload');

class industriesController {
    async createIndustries(req, res) {
        const { name } = req.body;
        const imageUrl = req.file ? await uploadSingle(req.file, 'industries') : '';
        const data = await modelIndustries.create({ image: imageUrl, name });
        return new OK({
            message: 'Create industries successfully',
            data,
        }).send(res);
    }

    async getAllCategory(req, res) {
        const data = await modelIndustries.aggregate([
            {
                $lookup: {
                    from: 'jobs', // tên collection job
                    localField: '_id', // industries._id
                    foreignField: 'category', // job.category
                    as: 'jobs',
                },
            },
            {
                $addFields: {
                    jobCount: { $size: '$jobs' },
                },
            },
            {
                $project: {
                    jobs: 0, // ẩn danh sách jobs vì bạn chỉ cần jobCount
                },
            },
        ]);

        return new OK({
            message: 'Get all industries successfully',
            metadata: data,
        }).send(res);
    }
}

module.exports = new industriesController();
