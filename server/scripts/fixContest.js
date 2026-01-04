import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixContest() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find the admin user
        const User = mongoose.model('User', new mongoose.Schema({
            name: String,
            email: String,
            role: String
        }));

        const admin = await User.findOne({ email: 'admin@kodingkulture.com' });
        if (!admin) {
            console.log('❌ Admin user not found. Run createAdmin.js first.');
            process.exit(1);
        }
        console.log(`✅ Found admin: ${admin.email} (${admin._id})`);

        // Update the contest to add createdBy
        const Contest = mongoose.model('Contest', new mongoose.Schema({
            title: String,
            createdBy: mongoose.Schema.Types.ObjectId
        }));

        const result = await Contest.updateMany(
            { createdBy: { $exists: false } },
            { $set: { createdBy: admin._id } }
        );

        console.log(`✅ Updated ${result.modifiedCount} contest(s) with createdBy`);

        // Also update contests where createdBy is null
        const result2 = await Contest.updateMany(
            { createdBy: null },
            { $set: { createdBy: admin._id } }
        );

        console.log(`✅ Updated ${result2.modifiedCount} more contest(s)`);

        await mongoose.connection.close();
        console.log('🎉 Done! Contests fixed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixContest();
