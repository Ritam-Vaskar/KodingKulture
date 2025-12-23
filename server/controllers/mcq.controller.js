import MCQ from '../models/MCQ.js';
import Result from '../models/Result.js';
import Contest from '../models/Contest.js';

// @desc    Get MCQs for a contest
// @route   GET /api/mcq/contest/:contestId
// @access  Private
export const getMCQsByContest = async (req, res) => {
  try {
    const { contestId } = req.params;

    // Check if user is registered
    const contest = await Contest.findById(contestId);
    if (!contest.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not registered for this contest'
      });
    }

    const mcqs = await MCQ.find({ contestId })
      .sort({ order: 1 })
      .select('-correctAnswers -explanation'); // Hide answers

    res.status(200).json({
      success: true,
      count: mcqs.length,
      mcqs
    });
  } catch (error) {
    console.error('Get MCQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching MCQs'
    });
  }
};

// @desc    Submit MCQ answers
// @route   POST /api/mcq/submit
// @access  Private
export const submitMCQAnswers = async (req, res) => {
  try {
    const { contestId, answers } = req.body; // answers: [{ questionId, selectedOptions, timeTaken }]

    let totalScore = 0;
    const mcqAnswers = [];

    for (const answer of answers) {
      const mcq = await MCQ.findById(answer.questionId);
      
      if (!mcq) continue;

      const isCorrect = JSON.stringify(answer.selectedOptions.sort()) === 
                        JSON.stringify(mcq.correctAnswers.sort());

      let marksAwarded = 0;
      if (isCorrect) {
        marksAwarded = mcq.marks;
      } else if (answer.selectedOptions.length > 0) {
        marksAwarded = -mcq.negativeMarks;
      }

      totalScore += marksAwarded;

      mcqAnswers.push({
        questionId: answer.questionId,
        selectedOptions: answer.selectedOptions,
        isCorrect,
        marksAwarded,
        timeTaken: answer.timeTaken || 0
      });
    }

    // Update result
    const result = await Result.findOneAndUpdate(
      { userId: req.user._id, contestId },
      {
        mcqScore: totalScore,
        mcqAnswers
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'MCQ answers submitted successfully',
      score: totalScore,
      result
    });
  } catch (error) {
    console.error('Submit MCQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting MCQ answers'
    });
  }
};

// @desc    Create MCQ (Admin)
// @route   POST /api/mcq
// @access  Private/Admin
export const createMCQ = async (req, res) => {
  try {
    const mcq = await MCQ.create(req.body);

    // Update contest total marks
    const contest = await Contest.findById(mcq.contestId);
    if (contest) {
      contest.sections.mcq.totalMarks += mcq.marks;
      await contest.save();
    }

    res.status(201).json({
      success: true,
      message: 'MCQ created successfully',
      mcq
    });
  } catch (error) {
    console.error('Create MCQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating MCQ'
    });
  }
};

// @desc    Update MCQ (Admin)
// @route   PUT /api/mcq/:id
// @access  Private/Admin
export const updateMCQ = async (req, res) => {
  try {
    const mcq = await MCQ.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: 'MCQ not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'MCQ updated successfully',
      mcq
    });
  } catch (error) {
    console.error('Update MCQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating MCQ'
    });
  }
};

// @desc    Delete MCQ (Admin)
// @route   DELETE /api/mcq/:id
// @access  Private/Admin
export const deleteMCQ = async (req, res) => {
  try {
    const mcq = await MCQ.findByIdAndDelete(req.params.id);

    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: 'MCQ not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'MCQ deleted successfully'
    });
  } catch (error) {
    console.error('Delete MCQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting MCQ'
    });
  }
};
