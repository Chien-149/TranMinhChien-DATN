const { BadRequestError, NotFoundError } = require('../core/error.response');
const { OK } = require('../core/success.response');

const JobApplication = require('../models/jobApplication.model');
const Company = require('../models/company.model');
const SendMailInterviewSchedule = require('../mail/sendMailInterviewSchedule');
const SendMailInterviewRejected = require('../mail/sendMailInterviewRejected');
const SendMailInterviewSuccess = require('../mail/sendMailInterviewSuccess');
const { createAndEmitNotification } = require('../services/notification.service');

class ApplicationController {
    async applyForJob(req, res, next) {
        const { jobId } = req.body;
        const { id: userId } = req.user;
        const { fullName, phone, email, coverLetter, companyId } = req.body;
        const cvFile = req.file;

        if (!jobId || !userId || !fullName || !phone || !email || !coverLetter || !cvFile) {
            throw new BadRequestError('Missing required fields');
        }

        const jobApplication = await JobApplication.create({
            jobId,
            companyId,
            userId,
            fullName,
            phone,
            email,
            coverLetter,
            cvId: cvFile.filename,
        });

        return new OK({
            message: 'Ứng tuyển thành công',
            metadata: jobApplication,
        }).send(res);
    }

    async getAllJobApplications(req, res, next) {
        const { id: userId } = req.user;
        const findCompany = await Company.findOne({ userId });
        const applications = await JobApplication.find({ companyId: findCompany._id }).populate('jobId');
        return new OK({
            message: 'Lấy danh sách ứng tuyển thành công',
            metadata: applications,
        }).send(res);
    }

    // Company views candidate CV → emit notification to candidate
    async markCVViewed(req, res, next) {
        const { applicationId } = req.params;
        const { id: userId } = req.user;

        const findCompany = await Company.findOne({ userId });
        if (!findCompany) throw new NotFoundError('Không tìm thấy công ty');

        const application = await JobApplication.findById(applicationId).populate('jobId');
        if (!application) throw new NotFoundError('Không tìm thấy ứng tuyển');

        await createAndEmitNotification({
            userId: application.userId,
            type: 'cv_viewed',
            title: 'Công ty đã xem CV của bạn',
            message: `${findCompany.companyName} vừa xem hồ sơ ứng tuyển cho vị trí "${application.jobId?.title || 'chưa xác định'}"`,
            meta: {
                applicationId: application._id,
                jobId: application.jobId?._id || null,
                companyId: findCompany._id,
                companyName: findCompany.companyName,
                companyLogo: findCompany.companyLogo || '',
            },
        });

        return new OK({ message: 'Đã ghi nhận xem CV' }).send(res);
    }

    async accpectJobApplication(req, res, next) {
        const { cvId, date, location, notes, time } = req.body;
        const findApplication = await JobApplication.findOne({ _id: cvId }).populate('jobId');
        if (!findApplication) throw new NotFoundError('Không tìm thấy ứng tuyển');

        findApplication.status = 'interview';
        findApplication.interview = { date, location, notes, time };
        await findApplication.save();

        const findCompany = await Company.findOne({ _id: findApplication.companyId });
        await SendMailInterviewSchedule(findApplication, findCompany, findApplication.jobId);

        await createAndEmitNotification({
            userId: findApplication.userId,
            type: 'application_status',
            title: 'Nhà tuyển dụng phản hồi hồ sơ của bạn',
            message: `${findCompany?.companyName || 'Nhà tuyển dụng'} đã mời bạn phỏng vấn cho vị trí "${findApplication.jobId?.title || ''}"`,
            meta: {
                applicationId: findApplication._id,
                jobId: findApplication.jobId?._id || null,
                companyId: findCompany?._id || null,
                companyName: findCompany?.companyName || '',
                companyLogo: findCompany?.companyLogo || '',
                status: 'interview',
            },
        });

        return new OK({ message: 'Duyệt ứng tuyển thành công', metadata: findApplication }).send(res);
    }

    async interviewSuccess(req, res, next) {
        const { cvId } = req.body;
        const findApplication = await JobApplication.findOne({ _id: cvId }).populate('jobId');
        if (!findApplication) throw new NotFoundError('Không tìm thấy ứng tuyển');

        findApplication.status = 'interview_success';
        await findApplication.save();

        const findCompany = await Company.findOne({ _id: findApplication.companyId });
        await SendMailInterviewSuccess(findApplication, findCompany, findApplication.jobId);

        await createAndEmitNotification({
            userId: findApplication.userId,
            type: 'application_status',
            title: 'Kết quả phỏng vấn',
            message: `Chúc mừng bạn! ${findCompany?.companyName || 'Nhà tuyển dụng'} đã đánh giá bạn phỏng vấn thành công cho vị trí "${findApplication.jobId?.title || ''}"`,
            meta: {
                applicationId: findApplication._id,
                jobId: findApplication.jobId?._id || null,
                companyId: findCompany?._id || null,
                companyName: findCompany?.companyName || '',
                companyLogo: findCompany?.companyLogo || '',
                status: 'interview_success',
            },
        });

        return new OK({ message: 'Cập nhật trạng thái thành công', metadata: findApplication }).send(res);
    }

    async rejectJobApplication(req, res, next) {
        const { cvId, reason } = req.body;
        const findApplication = await JobApplication.findOne({ _id: cvId }).populate('jobId');
        if (!findApplication) throw new NotFoundError('Không tìm thấy ứng tuyển');

        findApplication.status = 'rejected';
        findApplication.rejection = { reason, rejectedAt: new Date() };
        await findApplication.save();

        const findCompany = await Company.findOne({ _id: findApplication.companyId });
        await SendMailInterviewRejected(findApplication, findCompany, findApplication.jobId, reason);

        await createAndEmitNotification({
            userId: findApplication.userId,
            type: 'application_status',
            title: 'Nhà tuyển dụng đã phản hồi hồ sơ',
            message: `${findCompany?.companyName || 'Nhà tuyển dụng'} đã từ chối hồ sơ của bạn cho vị trí "${findApplication.jobId?.title || ''}"`,
            meta: {
                applicationId: findApplication._id,
                jobId: findApplication.jobId?._id || null,
                companyId: findCompany?._id || null,
                companyName: findCompany?.companyName || '',
                companyLogo: findCompany?.companyLogo || '',
                status: 'rejected',
            },
        });

        return new OK({ message: 'Từ chối ứng tuyển thành công', metadata: findApplication }).send(res);
    }

    async getJobsByUser(req, res) {
        const { id } = req.user;
        const jobs = await JobApplication.find({ userId: id }).populate('jobId').populate('companyId');
        return new OK({ message: 'success', metadata: jobs }).send(res);
    }
}

module.exports = new ApplicationController();
