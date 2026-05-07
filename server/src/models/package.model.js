const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelPackage = new Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String, required: true },
        durationDays: { type: Number, required: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('package', modelPackage);
