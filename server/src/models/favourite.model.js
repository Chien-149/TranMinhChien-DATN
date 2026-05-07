const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelFavourite = new Schema(
    {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'job', required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('favourite', modelFavourite);
