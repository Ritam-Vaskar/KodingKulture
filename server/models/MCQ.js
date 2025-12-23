import mongoose from 'mongoose';

const mcqSchema = new mongoose.Schema({
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  correctAnswers: [{
    type: Number // indices of correct options
  }],
  marks: {
    type: Number,
    required: true,
    default: 1
  },
  negativeMarks: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD'],
    default: 'MEDIUM'
  },
  category: {
    type: String,
    enum: ['APTITUDE', 'TECHNICAL', 'LOGICAL', 'VERBAL'],
    default: 'TECHNICAL'
  },
  explanation: {
    type: String,
    default: null
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
mcqSchema.index({ contestId: 1, order: 1 });

const MCQ = mongoose.model('MCQ', mcqSchema);

export default MCQ;
