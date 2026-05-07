const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const jobSchema = new Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: 'company',
            required: true,
        },

        // Basic info
        title: { type: String, required: true },
        category: { type: Schema.Types.ObjectId, ref: 'industries' },
        location: { type: String, required: true },
        type: {
            type: String,
            enum: ['full-time', 'part-time', 'internship', 'contract', 'freelance'],
            default: 'full-time',
        },

        // Salary
        salaryMin: { type: Number, default: 0 },
        salaryMax: { type: Number, default: 0 },
        salaryNegotiable: { type: Boolean, default: false },

        // Requirements
        experience: { type: String, default: '' },
        education: { type: String, default: '' },
        skills: [{ type: String }],

        // Description
        description: { type: String, default: '' },
        requirements: { type: String, default: '' },
        benefits: { type: String, default: '' },

        // Status
        status: {
            type: String,
            enum: ['pending', 'active', 'rejected'],
            default: 'pending',
        },
        deadline: { type: Date, default: null },

        // Stats
        views: { type: Number, default: 0 },
        applicants: { type: Number, default: 0 },

        // Boost
        isBoosted: { type: Boolean, default: false },
        boostExpiry: { type: Date, default: null },
        boostPackage: { type: String, default: null },
    },
    {
        timestamps: true,
    },
);

// Indexes
jobSchema.index({ companyId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ isBoosted: -1, createdAt: -1 });
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ location: 1 });
jobSchema.index({ type: 1 });

module.exports = mongoose.model('job', jobSchema);
