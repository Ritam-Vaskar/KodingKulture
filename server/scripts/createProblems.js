import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// CodingProblem schema
const codingProblemSchema = new mongoose.Schema({
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    inputFormat: { type: String, required: true },
    outputFormat: { type: String, required: true },
    constraints: [{ type: String }],
    examples: [{
        input: String,
        output: String,
        explanation: String
    }],
    testcases: [{
        input: { type: String, required: true },
        output: { type: String, required: true },
        hidden: { type: Boolean, default: false },
        points: { type: Number, default: 10 }
    }],
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
    score: { type: Number, default: 100 },
    timeLimit: { type: Number, default: 2 },
    memoryLimit: { type: Number, default: 256 },
    tags: [{ type: String }],
    order: { type: Number, default: 0 }
}, { timestamps: true });

const CodingProblem = mongoose.model('CodingProblem', codingProblemSchema);

// Contest schema (simplified)
const contestSchema = new mongoose.Schema({
    title: String,
    description: String,
    startTime: Date,
    endTime: Date,
    duration: Number,
    status: { type: String, enum: ['SCHEDULED', 'LIVE', 'COMPLETED'], default: 'SCHEDULED' },
    isPublished: { type: Boolean, default: false },
    sections: {
        mcq: { enabled: Boolean, totalMarks: Number },
        coding: { enabled: Boolean, totalMarks: Number }
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rules: [String],
    prizes: [String]
}, { timestamps: true });

const Contest = mongoose.model('Contest', contestSchema);

// Problem definitions (same as earlier)
const PROBLEMS = [
    {
        title: 'Two Sum',
        description: 'Given two integers A and B, print their sum.',
        inputFormat: 'A single line containing two space-separated integers A and B.',
        outputFormat: 'Print the sum of A and B.',
        constraints: ['1 ≤ A, B ≤ 10^9'],
        difficulty: 'EASY',
        score: 50,
        timeLimit: 2,
        memoryLimit: 256,
        tags: ['math', 'basics'],
        order: 1,
        examples: [
            { input: '12 13', output: '25', explanation: '12 + 13 = 25' },
            { input: '100 200', output: '300', explanation: '100 + 200 = 300' }
        ],
        testcases: [
            { input: '12 13', output: '25', hidden: false, points: 10 },
            { input: '100 200', output: '300', hidden: false, points: 10 },
            { input: '1 1', output: '2', hidden: true, points: 10 },
            { input: '999999999 1', output: '1000000000', hidden: true, points: 10 },
            { input: '0 0', output: '0', hidden: true, points: 10 }
        ]
    },
    {
        title: 'Fibonacci Number',
        description: `Given a non-negative integer N, find the Nth Fibonacci number.

The Fibonacci sequence is defined as:
F(0) = 0
F(1) = 1
F(N) = F(N-1) + F(N-2) for N > 1`,
        inputFormat: 'A single integer N.',
        outputFormat: 'Print the Nth Fibonacci number.',
        constraints: ['0 ≤ N ≤ 30'],
        difficulty: 'EASY',
        score: 50,
        timeLimit: 2,
        memoryLimit: 256,
        tags: ['recursion', 'dynamic-programming', 'basics'],
        order: 2,
        examples: [
            { input: '5', output: '5', explanation: 'F(5) = F(4) + F(3) = 3 + 2 = 5' },
            { input: '10', output: '55', explanation: 'The sequence is 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55' }
        ],
        testcases: [
            { input: '5', output: '5', hidden: false, points: 10 },
            { input: '10', output: '55', hidden: false, points: 10 },
            { input: '0', output: '0', hidden: true, points: 10 },
            { input: '1', output: '1', hidden: true, points: 10 },
            { input: '20', output: '6765', hidden: true, points: 10 }
        ]
    }
];

async function createProblemsAndContest() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check for existing LIVE or SCHEDULED contest
        let contest = await Contest.findOne({
            status: { $in: ['LIVE', 'SCHEDULED'] },
            isPublished: true
        });

        if (contest) {
            console.log(`📋 Found existing contest: "${contest.title}" (${contest.status})`);
        } else {
            // Create a new contest
            const now = new Date();
            const startTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
            const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

            contest = await Contest.create({
                title: 'Weekly Challenge #1',
                description: 'Test your coding skills with 2 problems - Two Sum and Fibonacci!',
                startTime: startTime,
                endTime: endTime,
                duration: 120,
                status: 'LIVE',
                isPublished: true,
                sections: {
                    mcq: { enabled: false, totalMarks: 0 },
                    coding: { enabled: true, totalMarks: 100 }
                },
                rules: ['No cheating allowed', 'Complete all questions within time limit'],
                prizes: ['1st Prize: Certificate', '2nd Prize: Certificate', '3rd Prize: Certificate']
            });

            console.log(`✅ Created new contest: "${contest.title}"`);
        }

        // Delete existing problems for this contest
        const deleted = await CodingProblem.deleteMany({ contestId: contest._id });
        console.log(`🗑️  Deleted ${deleted.deletedCount} existing problems`);

        // Create new problems
        for (const problemData of PROBLEMS) {
            const problem = await CodingProblem.create({
                ...problemData,
                contestId: contest._id
            });
            console.log(`✅ Created problem: "${problem.title}" with ${problem.testcases.length} test cases`);
        }

        console.log('');
        console.log('🎉 Done! Problems created successfully.');
        console.log(`   Contest: ${contest.title}`);
        console.log(`   Contest ID: ${contest._id}`);
        console.log(`   Status: ${contest.status}`);
        console.log(`   Problems: ${PROBLEMS.length}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createProblemsAndContest();
