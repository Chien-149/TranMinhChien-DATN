const CandidateProfile = require('../models/candidateProfile.model');
const { BadRequestError } = require('../core/error.response');

class candidateProfileService {
    async updateOrCreateCandidateProfile(userId, profileData) {
        const { headline, summary, skills, experience, education } = profileData;

        // Check if profile exists
        let profile = await CandidateProfile.findOne({ userId });

        if (profile) {
            // Update existing profile
            profile.headline = headline || profile.headline;
            profile.summary = summary || profile.summary;
            profile.skills = skills || profile.skills;
            profile.experience = experience || profile.experience;
            profile.education = education || profile.education;
            
            await profile.save();
        } else {
            // Create new profile
            profile = await CandidateProfile.create({
                userId,
                headline,
                summary,
                skills: skills || [],
                experience: experience || [],
                education: education || [],
            });
        }

        return profile;
    }

    async getCandidateProfile(userId) {
        const profile = await CandidateProfile.findOne({ userId });
        return profile;
    }
}

module.exports = new candidateProfileService();
