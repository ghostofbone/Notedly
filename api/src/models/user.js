const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            index: { unique: true },
        },
        email: {
            type: String,
            required: true,
            index: { unique: true },
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
        },
        notes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Note', // Reference the Note model
            },
        ],
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', UserSchema);
module.exports = User;