const Job = require('../models/job.model');
const Company = require('../models/company.model');
const JobApplication = require('../models/jobApplication.model');
const Favourite = require('../models/favourite.model');
const CompanyFollow = require('../models/companyFollow.model');
const { Wallet, Transaction } = require('../models/wallet.model');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../core/error.response');
const { OK } = require('../core/success.response');
const { createAndEmitNotification } = require('../services/notification.service');

// Boost packages config
const BOOST_PACKAGES = {
    '1day': { name: '1 ngày', duration: 1, price: 50000 },
    '3days': { name: '3 ngày', duration: 3, price: 120000 },
    '7days': { name: '7 ngày', duration: 7, price: 250000 },
    '30days': { name: '30 ngày', duration: 30, price: 800000 },
};

class JobController {
    // Get all jobs for company (employer)
    async getCompanyJobs(req, res) {
        const { id: userId } = req.user;
        const { status, page = 1, limit = 20, search } = req.query;

        const company = await Company.findOne({ userId });
        if (!company) {
            throw new NotFoundError('Không tìm thấy thông tin công ty');
        }

        const query = { companyId: company._id };

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.$text = { $search: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [jobs, total] = await Promise.all([
            Job.find(query).sort({ isBoosted: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            Job.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            data: {
                jobs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    }

    // Get job by ID
    async getJobById(req, res) {
        const { id } = req.params;
        const { incrementView } = req.query;

        const job = await Job.findById(id).populate('companyId');

        const findFavourite = await Favourite.find({ jobId: id });

        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng');
        }

        // Increment view count if requested (for public view)
        if (incrementView === 'true') {
            await Job.findByIdAndUpdate(id, { $inc: { views: 1 } });
        }

        res.status(200).json({
            success: true,
            data: { ...job._doc, favourite: findFavourite },
        });
    }

    // Create new job
    async createJob(req, res) {
        const { id: userId } = req.user;

        const company = await Company.findOne({ userId });
        if (!company) {
            throw new NotFoundError('Không tìm thấy thông tin công ty');
        }

        const jobData = {
            companyId: company._id,
            title: req.body.title,
            category: req.body.category,
            location: req.body.location,
            type: req.body.type,
            salaryMin: req.body.salaryMin,
            salaryMax: req.body.salaryMax,
            salaryNegotiable: req.body.salaryNegotiable,
            experience: req.body.experience,
            education: req.body.education,
            skills: req.body.skills || [],
            description: req.body.description,
            requirements: req.body.requirements,
            benefits: req.body.benefits,
            deadline: req.body.deadline,
        };

        const job = await Job.create(jobData);

        // Notify all followers of this company about the new job
        const followers = await CompanyFollow.find({ companyId: company._id }).select('userId').lean();
        if (followers.length > 0) {
            const notifPromises = followers.map((follow) =>
                createAndEmitNotification({
                    userId: follow.userId,
                    type: 'job_match',
                    title: 'Công ty bạn theo dõi vừa đăng việc mới!',
                    message: `${company.companyName} vừa đăng tin tuyển dụng: "${job.title}"`,
                    meta: {
                        jobId: job._id,
                        companyId: company._id,
                        companyName: company.companyName,
                        companyLogo: company.companyLogo || '',
                    },
                }),
            );
            await Promise.allSettled(notifPromises);
        }

        res.status(201).json({
            success: true,
            message: 'Tạo tin tuyển dụng thành công',
            data: job,
        });
    }

    // Update job
    async updateJob(req, res) {
        const { id: userId } = req.user;
        const { id: jobId } = req.params;

        const company = await Company.findOne({ userId });
        if (!company) {
            throw new NotFoundError('Không tìm thấy thông tin công ty');
        }

        const job = await Job.findOne({ _id: jobId, companyId: company._id });
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng');
        }

        const allowedFields = [
            'title',
            'department',
            'location',
            'type',
            'salaryMin',
            'salaryMax',
            'salaryNegotiable',
            'experience',
            'education',
            'skills',
            'description',
            'requirements',
            'benefits',
            'deadline',
            'status',
        ];

        const updateData = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const updatedJob = await Job.findByIdAndUpdate(jobId, { $set: updateData }, { new: true, runValidators: true });

        res.status(200).json({
            success: true,
            message: 'Cập nhật tin tuyển dụng thành công',
            data: updatedJob,
        });
    }

    // Delete job
    async deleteJob(req, res) {
        const { id: userId } = req.user;
        const { id: jobId } = req.params;

        const company = await Company.findOne({ userId });
        if (!company) {
            throw new NotFoundError('Không tìm thấy thông tin công ty');
        }

        const job = await Job.findOne({ _id: jobId, companyId: company._id });
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng');
        }

        // Delete related applications
        await JobApplication.deleteMany({ jobId });

        await Job.findByIdAndDelete(jobId);

        res.status(200).json({
            success: true,
            message: 'Xóa tin tuyển dụng thành công',
        });
    }

    // Toggle job status (active/paused)
    async toggleJobStatus(req, res) {
        const { id: userId } = req.user;
        const { id: jobId } = req.params;

        const company = await Company.findOne({ userId });
        if (!company) {
            throw new NotFoundError('Không tìm thấy thông tin công ty');
        }

        const job = await Job.findOne({ _id: jobId, companyId: company._id });
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng');
        }

        const newStatus = job.status === 'active' ? 'paused' : 'active';

        const updatedJob = await Job.findByIdAndUpdate(jobId, { status: newStatus }, { new: true });

        res.status(200).json({
            success: true,
            message: `Đã ${newStatus === 'active' ? 'kích hoạt' : 'tạm dừng'} tin tuyển dụng`,
            data: updatedJob,
        });
    }

    // Duplicate job
    async duplicateJob(req, res) {
        const { id: userId } = req.user;
        const { id: jobId } = req.params;

        const company = await Company.findOne({ userId });
        if (!company) {
            throw new NotFoundError('Không tìm thấy thông tin công ty');
        }

        const job = await Job.findOne({ _id: jobId, companyId: company._id });
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng');
        }

        const duplicatedJob = await Job.create({
            companyId: company._id,
            title: `${job.title} (Copy)`,
            department: job.department,
            location: job.location,
            type: job.type,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryNegotiable: job.salaryNegotiable,
            experience: job.experience,
            education: job.education,
            skills: job.skills,
            description: job.description,
            requirements: job.requirements,
            benefits: job.benefits,
            status: 'paused',
        });

        res.status(201).json({
            success: true,
            message: 'Sao chép tin tuyển dụng thành công',
            data: duplicatedJob,
        });
    }

    // Boost job to top
    async boostJob(req, res) {
        const { id: userId } = req.user;
        const { id: jobId } = req.params;
        const { packageId } = req.body; // '1day', '3days', '7days', '30days'

        const boostPackage = BOOST_PACKAGES[packageId];
        if (!boostPackage) {
            throw new BadRequestError('Gói đẩy tin không hợp lệ');
        }

        const company = await Company.findOne({ userId });
        if (!company) {
            throw new NotFoundError('Không tìm thấy thông tin công ty');
        }

        const job = await Job.findOne({ _id: jobId, companyId: company._id });
        if (!job) {
            throw new NotFoundError('Không tìm thấy tin tuyển dụng');
        }

        // Check wallet balance
        const wallet = await Wallet.findOne({ companyId: company._id });
        if (!wallet || wallet.balance < boostPackage.price) {
            throw new BadRequestError('Số dư ví không đủ. Vui lòng nạp thêm tiền.');
        }

        // Calculate boost expiry
        const boostExpiry = new Date();
        boostExpiry.setDate(boostExpiry.getDate() + boostPackage.duration);

        // Deduct from wallet
        const newBalance = wallet.balance - boostPackage.price;
        await Wallet.findByIdAndUpdate(wallet._id, {
            balance: newBalance,
            $inc: { totalSpent: boostPackage.price },
        });

        // Create transaction
        await Transaction.create({
            companyId: company._id,
            type: 'boost',
            amount: -boostPackage.price,
            paymentMethod: 'wallet',
            relatedJob: jobId,
            boostPackage: packageId,
            boostDuration: boostPackage.duration,
            status: 'success',
            description: `Đẩy tin "${job.title}" - ${boostPackage.name}`,
            balanceAfter: newBalance,
        });

        // Update job boost status
        const updatedJob = await Job.findByIdAndUpdate(
            jobId,
            {
                isBoosted: true,
                boostExpiry,
                boostPackage: packageId,
            },
            { new: true },
        );

        res.status(200).json({
            success: true,
            message: `Đã đẩy tin lên TOP trong ${boostPackage.name}`,
            data: {
                job: updatedJob,
                transaction: {
                    amount: boostPackage.price,
                    newBalance,
                },
            },
        });
    }

    // Get boost packages
    async getBoostPackages(req, res) {
        const packages = Object.entries(BOOST_PACKAGES).map(([id, pkg]) => ({
            id,
            ...pkg,
        }));

        res.status(200).json({
            success: true,
            data: packages,
        });
    }

    // PUBLIC: Search jobs
    async searchJobs(req, res) {
        const { keyword, location, type, category, experience, companyId, salaryMin, salaryMax, page = 1, limit = 20 } = req.query;

        const query = {
            status: 'active',
            $or: [{ deadline: { $gte: new Date() } }, { deadline: null }],
        };

        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
            ];
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (type) {
            query.type = type;
        }

        if (category) {
            query.category = category;
        }

        if (experience) {
            query.experience = experience;
        }

        if (companyId) {
            query.companyId = companyId;
        }

        if (salaryMin) {
            query.salaryMax = { $gte: parseInt(salaryMin) };
        }

        if (salaryMax) {
            query.salaryMin = { $lte: parseInt(salaryMax) };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [jobs, total] = await Promise.all([
            Job.find(query)
                .sort({ isBoosted: -1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('companyId', 'companyName companyLogo industry')
                .populate('category', 'name'),
            Job.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            data: {
                jobs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    }

    async getAllJobs(req, res) {
        const date = new Date();

        const jobs = await Job.find({
            status: 'active',
            $or: [
                { isBoosted: true, boostExpiry: { $gt: date } }, // boost còn hạn
                { isBoosted: false }, // job thường
            ],
        })
            .populate('companyId', 'companyName companyLogo industry')
            .sort({
                isBoosted: -1, // job boost lên đầu
                boostExpiry: -1, // boost còn hạn lâu hơn đứng trước
                createdAt: -1, // job mới hơn đứng trước
            });

        return new OK({
            message: 'success',
            metadata: jobs,
        }).send(res);
    }

    async getJobsByAdmin(req, res) {
        const { page = 1, limit = 10, search = '', status = '' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const query = {};
        if (status) query.status = status;
        if (search) query.title = { $regex: search, $options: 'i' };

        const [jobs, total] = await Promise.all([
            Job.find(query)
                .populate('companyId', 'companyName companyLogo industry')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Job.countDocuments(query),
        ]);

        return new OK({
            message: 'success',
            metadata: {
                data: jobs,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            },
        }).send(res);
    }

    async updateStatusJob(req, res) {
        const { id } = req.params;
        const { status } = req.body;

        const findJob = await Job.findByIdAndUpdate(id, { status }, { new: true }).populate(
            'companyId',
            'companyName companyLogo industry',
        );

        return new OK({
            message: 'success',
            metadata: findJob,
        }).send(res);
    }

    // Lấy danh sách địa điểm từ jobs
    async getLocations(req, res) {
        const jobs = await Job.find({ status: 'active' }).select('location');

        // Trích xuất phường/quận từ địa chỉ đầy đủ
        const locationSet = new Set();

        jobs.forEach((job) => {
            if (job.location) {
                const location = job.location;

                // Tìm Phường, Quận, Thành phố trong địa chỉ
                const patterns = [
                    /Phường\s+[^,]+/gi,
                    /Quận\s+[^,]+/gi,
                    /Thành\s+phố\s+[^,]+/gi,
                    /TP\.\s*[^,]+/gi,
                    /P\.\s*[^,]+/gi,
                    /Q\.\s*[^,]+/gi,
                ];

                patterns.forEach((pattern) => {
                    const matches = location.match(pattern);
                    if (matches) {
                        matches.forEach((match) => {
                            locationSet.add(match.trim());
                        });
                    }
                });

                // Nếu không tìm thấy pattern, lấy phần cuối của địa chỉ (thường là phường/quận)
                if (locationSet.size === 0) {
                    const parts = location.split(',').map((p) => p.trim());
                    if (parts.length > 0) {
                        // Lấy phần cuối hoặc phần có chứa "Phường", "Quận"
                        for (let i = parts.length - 1; i >= 0; i--) {
                            if (
                                parts[i].toLowerCase().includes('phường') ||
                                parts[i].toLowerCase().includes('quận') ||
                                parts[i].toLowerCase().includes('thành phố')
                            ) {
                                locationSet.add(parts[i].trim());
                                break;
                            }
                        }
                    }
                }
            }
        });

        // Chuyển Set thành mảng và sắp xếp
        const locations = Array.from(locationSet).sort();

        res.status(200).json({
            success: true,
            data: locations,
        });
    }

    // PUBLIC: Get dashboard stats for homepage
    async getPublicDashboardStats(req, res) {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // 1. Số việc làm mới trong 24h gần nhất
        const jobsLast24h = await Job.countDocuments({
            status: 'active',
            deadline: { $gte: now },
            createdAt: { $gte: yesterday },
        });

        // 2. Tổng số việc làm đang tuyển
        const totalActiveJobs = await Job.countDocuments({
            status: 'active',
            deadline: { $gte: now },
        });

        // 3. Số công ty đang tuyển
        const companiesHiring = await Job.distinct('companyId', {
            status: 'active',
            deadline: { $gte: now },
        });

        // 4. Việc làm mới nhất (5 jobs)
        const recentJobs = await Job.find({
            status: 'active',
            deadline: { $gte: now },
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('companyId', 'companyName companyLogo')
            .select('title location deadline salaryMin salaryMax companyId');

        // 5. Nhu cầu tuyển dụng theo ngành (top 5)
        const demandByCategory = await Job.aggregate([
            {
                $match: {
                    status: 'active',
                    deadline: { $gte: now },
                },
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'industries',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'categoryInfo',
                },
            },
            {
                $unwind: {
                    path: '$categoryInfo',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    name: { $ifNull: ['$categoryInfo.name', 'Khác'] },
                    value: '$count',
                },
            },
            { $sort: { value: -1 } },
            { $limit: 5 },
        ]);

        // 6. Dữ liệu tăng trưởng 7 ngày gần nhất
        const growthData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const count = await Job.countDocuments({
                status: 'active',
                createdAt: { $gte: startOfDay, $lte: endOfDay },
            });

            growthData.push({
                date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                value: count,
            });
        }

        return new OK({
            message: 'Get public dashboard stats successfully',
            metadata: {
                stats: {
                    jobsLast24h,
                    totalActiveJobs,
                    companiesHiring: companiesHiring.length,
                },
                recentJobs: recentJobs.map((job) => ({
                    _id: job._id,
                    title: job.title,
                    location: job.location,
                    logo: job.companyId?.companyLogo,
                    company: job.companyId?.companyName,
                    deadline: job.deadline,
                    salaryMin: job.salaryMin,
                    salaryMax: job.salaryMax,
                })),
                demandByCategory,
                growthData,
            },
        }).send(res);
    }
}

module.exports = new JobController();
