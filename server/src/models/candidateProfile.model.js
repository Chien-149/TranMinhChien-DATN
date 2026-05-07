const mongoose = require('mongoose');

//// bảng thông tin cá nhân user

const CandidateProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        headline: String,
        summary: String,
        skills: [String],

        experience: [
            {
                company: String,
                position: String,
                startDate: Date,
                endDate: Date,
                description: String,
            },
        ],

        education: [
            {
                school: String,
                degree: String,
                major: String,
                startDate: Date,
                endDate: Date,
            },
        ],
    },
    { timestamps: true },
);

module.exports = mongoose.model('candidate', CandidateProfileSchema);
