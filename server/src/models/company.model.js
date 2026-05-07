const mongoose = require('mongoose');

//// bảng thông tin doanh nghiệp
const CompanySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
            unique: true,
        },

        // Basic info
        companyName: { type: String, required: true },
        taxCode: { type: String, required: true },
        companyEmail: { type: String, default: '' },
        companyPhone: { type: String, default: '' },
        companyLogo: { type: String, default: '' },
        companyCover: { type: String, default: '' },
        companyWebsite: { type: String, default: '' },
        companyAddress: { type: String, default: '' },
        companyDescription: { type: String, default: '' },

        // Additional info
        industry: { type: mongoose.Schema.Types.ObjectId, ref: 'industries', default: null },
        companySize: { type: String, default: '' }, // 1-10, 11-50, 51-200, 201-500, 500+
        foundedYear: { type: Number, default: null },

        // Social links
        socialLinks: {
            facebook: { type: String, default: '' },
            linkedin: { type: String, default: '' },
            twitter: { type: String, default: '' },
            youtube: { type: String, default: '' },
        },

        // Verification status
        isVerified: { type: Boolean, default: false },
        verifiedAt: { type: Date, default: null },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    },
    { timestamps: true },
);

// Index
CompanySchema.index({ userId: 1 });
CompanySchema.index({ companyName: 'text' });

module.exports = mongoose.model('company', CompanySchema);
