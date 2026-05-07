const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notificationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
            index: true,
        },
        type: {
            type: String,
            // cv_viewed: company viewed candidate's CV
            // application_status: recruiter changed application status
            // job_match: a new job matches candidate's profile
            enum: ['cv_viewed', 'application_status', 'job_match'],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        // extra data for linking
        meta: {
            jobId: { type: Schema.Types.ObjectId, ref: 'job', default: null },
            applicationId: { type: Schema.Types.ObjectId, ref: 'jobApplication', default: null },
            companyId: { type: Schema.Types.ObjectId, ref: 'company', default: null },
            companyName: { type: String, default: '' },
            companyLogo: { type: String, default: '' },
            status: { type: String, default: '' }, // new status value for application_status
        },
    },
    { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('notification', notificationSchema);
