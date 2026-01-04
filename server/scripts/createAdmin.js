import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Admin details
const ADMIN_NAME = 'Admin User';
const ADMIN_EMAIL = 'admin@kodingkulture.com';
const ADMIN_PASSWORD = 'Admin@123';

// User schema (simplified for this script)
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: 'USER' },
    college: String,
    phone: String,
    contestsRegistered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contest' }],
    contestsCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contest' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Role: ${existingAdmin.role}`);

            // Update to ADMIN if not already
            if (existingAdmin.role !== 'ADMIN') {
                existingAdmin.role = 'ADMIN';
                await existingAdmin.save();
                console.log('✅ Updated role to ADMIN');
            }
        } else {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

            // Create admin user
            const admin = await User.create({
                name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                password: hashedPassword,
                role: 'ADMIN',
                college: 'Koding Kulture',
                phone: ''
            });

            console.log('✅ Admin user created successfully!');
            console.log('');
            console.log('   📧 Email: ' + ADMIN_EMAIL);
            console.log('   🔑 Password: ' + ADMIN_PASSWORD);
            console.log('   👑 Role: ADMIN');
        }

        await mongoose.connection.close();
        console.log('');
        console.log('🎉 Done! You can now login with admin credentials.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdmin();
