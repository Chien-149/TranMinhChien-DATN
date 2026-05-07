const mongoose = require('mongoose');

const companyFollowSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'company',
            required: true,
        },
    },
    { timestamps: true },
);

// One user can only follow a company once
companyFollowSchema.index({ userId: 1, companyId: 1 }, { unique: true });
companyFollowSchema.index({ companyId: 1 });

module.exports = mongoose.model('companyFollow', companyFollowSchema);
