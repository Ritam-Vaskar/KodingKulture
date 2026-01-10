import mongoose from 'mongoose';

const contestRegistrationSchema = new mongoose.Schema({
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to ensure unique registration per user per contest
contestRegistrationSchema.index({ contestId: 1, userId: 1 }, { unique: true });

const ContestRegistration = mongoose.model('ContestRegistration', contestRegistrationSchema);

export default ContestRegistration;
