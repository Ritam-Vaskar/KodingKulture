import mongoose from 'mongoose';

const codingProblemSchema = new mongoose.Schema({
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Problem description is required']
  },
  inputFormat: {
    type: String,
    required: true
  },
  outputFormat: {
    type: String,
    required: true
  },
  constraints: [{
    type: String
  }],
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  testcases: [{
    input: {
      type: String,
      required: true
    },
    output: {
      type: String,
      required: true
    },
    hidden: {
      type: Boolean,
      default: false
    },
    points: {
      type: Number,
      default: 10
    }
  }],
  score: {
    type: Number,
    required: true,
    default: 100
  },
  difficulty: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD'],
    default: 'MEDIUM'
  },
  timeLimit: {
    type: Number, // in seconds
    default: 2
  },
  memoryLimit: {
    type: Number, // in MB
    default: 256
  },
  tags: [{
    type: String
  }],
  order: {
    type: Number,
    default: 0
  },
  submissionCount: {
    type: Number,
    default: 0
  },
  acceptedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
codingProblemSchema.index({ contestId: 1, order: 1 });

// Virtual for acceptance rate
codingProblemSchema.virtual('acceptanceRate').get(function() {
  if (this.submissionCount === 0) return 0;
  return ((this.acceptedCount / this.submissionCount) * 100).toFixed(2);
});

const CodingProblem = mongoose.model('CodingProblem', codingProblemSchema);

export default CodingProblem;
