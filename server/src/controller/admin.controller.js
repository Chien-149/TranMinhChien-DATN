const User = require('../models/users.model');
const Company = require('../models/company.model');
const Job = require('../models/job.model');
const JobApplication = require('../models/jobApplication.model');
const { Wallet, Transaction } = require('../models/wallet.model');
const { OK } = require('../core/success.response');

class AdminController {
    // Get admin dashboard stats
    async getAdminStats(req, res) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Get basic stats
        const [totalUsers, totalEmployers, totalJobs, activeJobs, pendingJobs, totalApplications] = await Promise.all([
            User.countDocuments({ role: 'candidate' }),
            Company.countDocuments({ status: 'approved' }),
            Job.countDocuments(),
            Job.countDocuments({ status: 'active' }),
            Job.countDocuments({ status: 'pending' }),
            JobApplication.countDocuments(),
        ]);

        // Get stats for current month
        const [newUsersThisMonth, newJobsThisMonth, newApplicationsThisMonth] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Job.countDocuments({ createdAt: { $gte: startOfMonth } }),
            JobApplication.countDocuments({ createdAt: { $gte: startOfMonth } }),
        ]);

        // Get stats for last month (for comparison)
        const [newUsersLastMonth, newJobsLastMonth] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
            Job.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
        ]);

        // Calculate growth percentages
        const userGrowth =
            newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 : 0;
        const jobGrowth = newJobsLastMonth > 0 ? ((newJobsThisMonth - newJobsLastMonth) / newJobsLastMonth) * 100 : 0;

        // Get revenue stats from Transaction model (type: momo/vnpay)
        let totalRevenue = 0;
        let monthlyRevenue = 0;
        let lastMonthRevenue = 0;
        let weeklyRevenueData = [];

        try {
            // Get revenue from transactions with momo/vnpay type
            const [totalRevenueResult, revenueThisMonthResult, revenueLastMonthResult] = await Promise.all([
                Transaction.aggregate([
                    { $match: { type: { $in: ['momo', 'vnpay'] } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
                Transaction.aggregate([
                    { $match: { type: { $in: ['momo', 'vnpay'] }, createdAt: { $gte: startOfMonth } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
                Transaction.aggregate([
                    {
                        $match: {
                            type: { $in: ['momo', 'vnpay'] },
                            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
                        },
                    },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
            ]);

            totalRevenue = totalRevenueResult[0]?.total || 0;
            monthlyRevenue = revenueThisMonthResult[0]?.total || 0;
            lastMonthRevenue = revenueLastMonthResult[0]?.total || 0;

            // Get weekly revenue data
            weeklyRevenueData = await Transaction.aggregate([
                {
                    $match: {
                        type: { $in: ['momo', 'vnpay'] },
                        createdAt: { $gte: sevenDaysAgo },
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        amount: { $sum: '$amount' },
                    },
                },
                { $sort: { _id: 1 } },
            ]);
        } catch (err) {
            console.log('Revenue stats error:', err.message);
        }

        const revenueGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

        // Build 7-day revenue array
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const weeklyRevenue = [];
        const maxRevenue = Math.max(...weeklyRevenueData.map((d) => d.amount), 1);

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = dayNames[date.getDay()];
            const dayData = weeklyRevenueData.find((d) => d._id === dateStr);
            const amount = dayData?.amount || 0;

            weeklyRevenue.push({
                day: dayOfWeek,
                fullDate: dateStr,
                amount: amount,
                value: Math.round((amount / maxRevenue) * 100),
            });
        }

        // Get recent activities (combined from different sources)
        const [recentUsers, recentJobs, recentCompanies] = await Promise.all([
            User.find().sort({ createdAt: -1 }).limit(5).select('fullName email avatar createdAt role'),
            Job.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('companyId', 'companyName companyLogo')
                .select('title createdAt'),
            Company.find({ status: 'pending' })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('companyName companyLogo createdAt'),
        ]);

        // Format recent activities
        const recentActivities = [];

        recentUsers.forEach((user) => {
            recentActivities.push({
                id: user._id,
                type: 'user',
                title: 'Người dùng mới đăng ký',
                name: user.fullName || user.email,
                avatar: user.avatar,
                time: user.createdAt,
                color: 'bg-blue-500',
            });
        });

        recentJobs.forEach((job) => {
            recentActivities.push({
                id: job._id,
                type: 'job',
                title: 'Tin tuyển dụng mới',
                name: job.companyId?.companyName || 'Unknown',
                avatar: job.companyId?.companyLogo,
                time: job.createdAt,
                color: 'bg-emerald-500',
            });
        });

        recentCompanies.forEach((company) => {
            recentActivities.push({
                id: company._id,
                type: 'employer',
                title: 'Đăng ký nhà tuyển dụng',
                name: company.companyName,
                avatar: company.companyLogo,
                time: company.createdAt,
                color: 'bg-violet-500',
            });
        });

        // Sort by time and take top 10
        recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));
        const topActivities = recentActivities.slice(0, 10);

        // Get top employers
        const topEmployers = await Job.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: '$companyId',
                    jobs: { $sum: 1 },
                    views: { $sum: '$views' },
                },
            },
            { $sort: { jobs: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'companies',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'company',
                },
            },
            { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'industries',
                    localField: 'company.industry',
                    foreignField: '_id',
                    as: 'industryInfo',
                },
            },
            {
                $project: {
                    _id: 1,
                    name: '$company.companyName',
                    logo: '$company.companyLogo',
                    industry: { $arrayElemAt: ['$industryInfo.name', 0] },
                    jobs: 1,
                    views: 1,
                },
            },
        ]);

        // Get pending items counts
        const [pendingCompanies, pendingJobsCount] = await Promise.all([
            Company.countDocuments({ status: 'pending' }),
            Job.countDocuments({ status: 'pending' }),
        ]);

        // Get today's new items
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const [newUsersToday, newJobsToday] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: startOfToday } }),
            Job.countDocuments({ createdAt: { $gte: startOfToday } }),
        ]);

        return new OK({
            message: 'Lấy thống kê admin thành công',
            metadata: {
                stats: {
                    totalUsers,
                    totalEmployers,
                    totalJobs,
                    activeJobs,
                    pendingJobs,
                    totalApplications,
                    totalRevenue,
                    monthlyRevenue,
                    userGrowth: parseFloat(userGrowth.toFixed(1)),
                    jobGrowth: parseFloat(jobGrowth.toFixed(1)),
                    revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
                },
                quickStats: {
                    pendingApproval: pendingCompanies + pendingJobsCount,
                    newToday: newUsersToday + newJobsToday,
                    activeNow: activeJobs,
                    completedThisMonth: newApplicationsThisMonth,
                },
                weeklyRevenue,
                recentActivities: topActivities,
                topEmployers,
            },
        }).send(res);
    }
}

module.exports = new AdminController();
