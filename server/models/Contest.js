import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Contest title is required'],
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required']
  },
  sections: {
    mcq: {
      enabled: {
        type: Boolean,
        default: true
      },
      duration: {
        type: Number, // in minutes
        default: 30
      },
      totalMarks: {
        type: Number,
        default: 0
      }
    },
    coding: {
      enabled: {
        type: Boolean,
        default: true
      },
      duration: {
        type: Number, // in minutes
        default: 120
      },
      totalMarks: {
        type: Number,
        default: 0
      }
    }
  },
  rules: [{
    type: String
  }],
  prizes: [{
    rank: String,
    prize: String
  }],
  status: {
    type: String,
    enum: ['UPCOMING', 'LIVE', 'ENDED'],
    default: 'UPCOMING'
  },
  maxParticipants: {
    type: Number,
    default: null // null means unlimited
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  banner: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
contestSchema.index({ status: 1, startTime: -1 });
contestSchema.index({ isPublished: 1 });

// Virtual for total marks
contestSchema.virtual('totalMarks').get(function() {
  return (this.sections.mcq.totalMarks || 0) + (this.sections.coding.totalMarks || 0);
});

const Contest = mongoose.model('Contest', contestSchema);

export default Contest;
