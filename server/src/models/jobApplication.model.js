const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const jobApplicationSchema = new Schema(
    {
        jobId: {
            type: Schema.Types.ObjectId,
            ref: 'job',
            required: true,
        },
        companyId: {
            type: Schema.Types.ObjectId,
            ref: 'company',
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        cvId: {
            type: String,
            default: '',
            required: true,
        },

        fullName: {
            type: String,
            default: '',
            required: true,
        },
        phone: {
            type: String,
            default: '',
            required: true,
        },

        email: {
            type: String,
            default: '',
            required: true,
        },

        // Application status
        status: {
            type: String,
            enum: ['pending', 'reviewing', 'interview', 'interview_success', 'accepted', 'rejected'],
            default: 'pending',
        },

        // Cover letter / message
        coverLetter: { type: String, default: '' },

        interview: {
            location: { type: String, default: '' }, // For offline interviews
            notes: { type: String, default: '' },
            time: { type: String, default: '' },
            date: { type: String, default: '' },
        },

        // Rejection info
        rejection: {
            reason: { type: String, default: '' },
            rejectedAt: { type: Date, default: null },
        },
    },
    {
        timestamps: true,
    },
);

// Indexes
jobApplicationSchema.index({ jobId: 1 });
jobApplicationSchema.index({ companyId: 1, status: 1 });
jobApplicationSchema.index({ userId: 1 });
jobApplicationSchema.index({ status: 1, createdAt: -1 });

// Ensure one user can only apply once per job
jobApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('jobApplication', jobApplicationSchema);
