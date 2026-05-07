const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const cvSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
        name: { type: String, default: 'CV của tôi' },
        template: { type: String, default: 'modern' },
        isDefault: { type: Boolean, default: false },

        // Profile
        profile: {
            fullName: { type: String, default: '' },
            role: { type: String, default: '' },
            dob: { type: String, default: '' },
            gender: { type: String, default: '' },
            phone: { type: String, default: '' },
            email: { type: String, default: '' },
            address: { type: String, default: '' },
            avatar: { type: String, default: '' },
            summary: { type: String, default: '' },
            linkedin: { type: String, default: '' },
            github: { type: String, default: '' },
            website: { type: String, default: '' },
        },

        // Education
        education: [
            {
                school: { type: String, default: '' },
                year: { type: String, default: '' },
                major: { type: String, default: '' },
                gpa: { type: String, default: '' },
            },
        ],

        // Skills
        skills: [
            {
                name: { type: String, default: '' },
                level: { type: Number, default: 70 },
            },
        ],

        // Experience
        experience: [
            {
                company: { type: String, default: '' },
                position: { type: String, default: '' },
                start: { type: String, default: '' },
                end: { type: String, default: '' },
                current: { type: Boolean, default: false },
                description: { type: String, default: '' },
                achievements: [{ type: String }],
            },
        ],

        // Projects
        projects: [
            {
                name: { type: String, default: '' },
                role: { type: String, default: '' },
                description: { type: String, default: '' },
                tech: [{ type: String }],
                link: { type: String, default: '' },
                demo: { type: String, default: '' },
            },
        ],

        // Certifications
        certifications: [
            {
                name: { type: String, default: '' },
                issuer: { type: String, default: '' },
                date: { type: String, default: '' },
            },
        ],

        // Languages
        languages: [
            {
                name: { type: String, default: '' },
                level: { type: String, default: '' },
            },
        ],

        hobbies: { type: String, default: '' },
        objective: { type: String, default: '' },
    },
    {
        timestamps: true,
    },
);

// Index for faster queries
cvSchema.index({ userId: 1 });
cvSchema.index({ userId: 1, isDefault: 1 });

module.exports = mongoose.model('cv', cvSchema);
