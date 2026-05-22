const Company = require('../models/company.model');
const Job = require('../models/job.model');
const JobApplication = require('../models/jobApplication.model');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const { OK } = require('../core/success.response');
const { uploadSingle } = require('../config/cloudinaryUpload');
const SendMailCompanyVerified = require('../mail/mailSuccess');
const SendMailCompanyRejected = require('../mail/mailReject');

const { Wallet } = require('../models/wallet.model');

class CompanyController {
    // Get company profile by logged-in user
    async getMyCompany(req, res) {
        const { id: userId } = req.user;

        let company = await Company.findOne({ userId });

        if (!company) {
            // Auto-create company profile for employer
            company = await Company.create({
                userId,
                companyName: 'Công ty của tôi',
            });

            // Also create wallet
            await Wallet.create({ companyId: company._id });
        }

        res.status(200).json({
            success: true,
            data: company,
        });
    }

    async createCompany(req, res) {
        const { id: userId } = req.user;

        const findCompany = await Company.findOne({ userId });
        if (findCompany && findCompany.status === 'pending') {
            throw new BadRequestError('Yêu cầu của bạn đang chờ xử lý');
        }

        const logoUrl = req.file ? await uploadSingle(req.file, 'company-logos') : '';

        const { address, companyName, companySize, description, email, industry, phone, website, foundedYear } =
            req.body;

        const data = await Company.create({
            companyPhone: phone,
            companyEmail: email,
            companyName,
            companyLogo: logoUrl,
            companyAddress: address,
            companyDescription: description,
            industry,
            companySize,
            userId,
            companyWebsite: website,
            foundedYear,
        });

        return new OK({
            message: 'Tạo công ty thành công',
            metadata: data,
        }).send(res);
    }

    // Get company by ID (public)
    async getCompanyById(req, res) {
        const { id } = req.params;

        const company = await Company.findById(id).select('-__v');

        if (!company) {
            throw new NotFoundError('Không tìm thấy công ty');
        }

        res.status(200).json({
            success: true,
            data: company,
        });
    }

    // Update company profile
    async updateCompany(req, res) {
        const { id: userId } = req.user;

        const company = await Company.findOne({ userId });

        if (!company) {
            throw new NotFoundError('Không tìm thấy thông tin công ty');
        }

        const allowedFields = [
            'companyName',
            'companyEmail',
            'companyPhone',
            'companyLogo',
            'companyCover',
            'companyWebsite',
            'companyAddress',
            'companyDescription',
            'industry',
            'companySize',
            'foundedYear',
            'socialLinks',
            'taxCode',
        ];

        const updateData = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const updatedCompany = await Company.findByIdAndUpdate(
            company._id,
            { $set: updateData },
            { new: true, runValidators: true },
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin công ty thành công',
            data: updatedCompany,
        });
    }

    // Upload company logo
    async uploadLogo(req, res) {
        const { id: userId } = req.user;

        if (!req.file) {
            throw new BadRequestError('Vui lòng cung cấp ảnh logo');
        }

        const logoUrl = await uploadSingle(req.file, 'company-logos');
        const company = await Company.findOneAndUpdate({ userId }, { companyLogo: logoUrl }, { new: true });
        const User = require('../models/user.model');
        await User.findByIdAndUpdate(userId, { avatar: logoUrl });

        if (!company) {
            throw new NotFoundError('Không tìm thấy thông tin công ty');
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật logo thành công',
            data: { logo: company.companyLogo },
        });
    }

    // Upload company cover
    async uploadCover(req, res) {
        const { id: userId } = req.user;
        const { cover } = req.body; // Base64 or URL

        if (!cover) {
            throw new BadRequestError('Vui lòng cung cấp ảnh bìa');
        }

        const company = await Company.findOneAndUpdate({ userId }, { companyCover: cover }, { new: true });

        if (!company) {
            throw new NotFoundError('Không tìm thấy thông tin công ty');
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật ảnh bìa thành công',
            data: { cover: company.companyCover },
        });
    }

    // Get company dashboard stats
    async getDashboardStats(req, res) {
        const { id: userId } = req.user;
        const { timeRange = 'all', customDate, customMonth } = req.query; // 'today', 'month', 'all', 'custom_date', 'custom_month'

        const company = await Company.findOne({ userId });
        if (!company) {
            throw new NotFoundError('Không tìm thấy thông tin công ty');
        }

        const companyId = company._id;

        // Build date filter
        let dateFilter = {};
        if (timeRange === 'today') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: startOfDay } };
        } else if (timeRange === 'month') {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: startOfMonth } };
        } else if (timeRange === 'custom_date' && customDate) {
            const startOfDay = new Date(customDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(customDate);
            endOfDay.setHours(23, 59, 59, 999);
            dateFilter = { createdAt: { $gte: startOfDay, $lte: endOfDay } };
        } else if (timeRange === 'custom_month' && customMonth) {
            const [year, month] = customMonth.split('-');
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
            dateFilter = { createdAt: { $gte: startOfMonth, $lte: endOfMonth } };
        }

        // Build filter object for applications
        const appFilter = { companyId, ...dateFilter };
        // Build filter object for jobs
        const jobFilter = { companyId, ...dateFilter };

        // Get stats
        const [totalJobs, activeJobs, totalApplications, pendingApplications, interviewApplications, totalViews] =
            await Promise.all([
                Job.countDocuments(jobFilter),
                Job.countDocuments({ ...jobFilter, status: 'active' }),
                JobApplication.countDocuments(appFilter),
                JobApplication.countDocuments({ ...appFilter, status: 'pending' }),
                JobApplication.countDocuments({ ...appFilter, status: 'interview' }),
                Job.aggregate([{ $match: jobFilter }, { $group: { _id: null, total: { $sum: '$views' } } }]),
            ]);

        // Get 7-day trend data
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const cvTrend = await JobApplication.aggregate([
            {
                $match: {
                    companyId: company._id,
                    createdAt: { $gte: sevenDaysAgo },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    cv: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Get views trend (from jobs)
        const viewsTrend = await Job.aggregate([
            { $match: { companyId: company._id } },
            { $unwind: { path: '$viewsHistory', preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    'viewsHistory.date': { $gte: sevenDaysAgo },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$viewsHistory.date' } },
                    views: { $sum: '$viewsHistory.count' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Combine into 7-day array
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const trendData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = dayNames[date.getDay()];

            const cvData = cvTrend.find((d) => d._id === dateStr);
            const viewsData = viewsTrend.find((d) => d._id === dateStr);

            trendData.push({
                date: dayOfWeek,
                fullDate: dateStr,
                cv: cvData?.cv || 0,
                views: viewsData?.views || 0,
            });
        }

        // Recent applications
        const recentApplications = await JobApplication.find({ companyId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'fullName email avatar')
            .populate('jobId', 'title');

        // Upcoming interviews
        const upcomingInterviews = await JobApplication.find({
            companyId,
            status: 'interview',
        })
            .sort({ 'interview.date': 1 })
            .limit(5)
            .populate('userId', 'fullName email avatar phone')
            .populate('jobId', 'title');

        // Get wallet
        const wallet = await Wallet.findOne({ companyId });

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalJobs,
                    activeJobs,
                    totalApplications,
                    pendingApplications,
                    interviewApplications,
                    totalViews: totalViews[0]?.total || 0,
                    walletBalance: wallet?.balance || 0,
                },
                trendData,
                recentApplications,
                upcomingInterviews,
            },
        });
    }

    async getAllCompany(req, res) {
        const { page = 1, limit = 10, search = '', status = '' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const query = {};
        if (status) query.status = status;
        if (search) query.companyName = { $regex: search, $options: 'i' };

        const [companies, total] = await Promise.all([
            Company.find(query).populate('industry', 'name').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            Company.countDocuments(query),
        ]);

        return new OK({
            message: 'Lấy thông tin công ty thành công',
            metadata: {
                data: companies,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            },
        }).send(res);
    }

    async updateStatusCompany(req, res) {
        const { id } = req.params;
        const { status, reason } = req.body;

        const findCompany = await Company.findByIdAndUpdate(id, { status }, { new: true }).populate('industry');

        if (status === 'approved') {
            await SendMailCompanyVerified(findCompany);
            await Wallet.create({ companyId: findCompany._id });
        }

        if (status === 'rejected' && reason) {
            await SendMailCompanyRejected(findCompany, reason);
        }

        return new OK({
            message: 'success',
            metadata: findCompany,
        }).send(res);
    }
}

module.exports = new CompanyController();
