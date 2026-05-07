const userRoutes = require('./users.routes');
const candidateProfileRoutes = require('./candidateProfile.routes');
const cvRoutes = require('./cv.routes');
const companyRoutes = require('./company.routes');
const jobRoutes = require('./job.routes');
const walletRoutes = require('./wallet.routes');
const applicationRoutes = require('./application.routes');
const industriesRoutes = require('./industries.routes');
const packageRoutes = require('./package.routes');
const conversationRoutes = require('./conversation.routes');
const messageRoutes = require('./message.routes');
const blogRoutes = require('./blog.routes');
const favouriteRoutes = require('./favourite.routes');
const aiRoutes = require('./ai.routes');
const adminRoutes = require('./admin.routes');
const notificationRoutes = require('./notification.routes');
const companyFollowRoutes = require('./companyFollow.routes');

function routes(app) {
    app.use('/api/users', userRoutes);
    app.use('/candidate', candidateProfileRoutes);
    app.use('/api/cv', cvRoutes);
    app.use('/api/company', companyRoutes);
    app.use('/api/jobs', jobRoutes);
    app.use('/api/wallet', walletRoutes);
    app.use('/api/applications', applicationRoutes);
    app.use('/api/industries', industriesRoutes);
    app.use('/api/packages', packageRoutes);
    app.use('/api/conversation', conversationRoutes);
    app.use('/api/message', messageRoutes);
    app.use('/api/blog', blogRoutes);
    app.use('/api/favourite', favouriteRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/company-follow', companyFollowRoutes);
}

module.exports = routes;
