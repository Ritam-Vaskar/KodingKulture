import CodingProblem from '../models/CodingProblem.js';
import Contest from '../models/Contest.js';

// @desc    Get coding problems for a contest
// @route   GET /api/coding/contest/:contestId
// @access  Private
export const getCodingProblemsByContest = async (req, res) => {
  try {
    const { contestId } = req.params;

    // Check if user is registered (skip for admin)
    if (req.user.role !== 'ADMIN') {
      const contest = await Contest.findById(contestId);
      if (!contest.participants.includes(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'You are not registered for this contest'
        });
      }
    }

    const problems = await CodingProblem.find({ contestId })
      .sort({ order: 1 })
      .select(req.user.role === 'ADMIN' ? '' : '-testcases'); // Show testcases to admin

    res.status(200).json({
      success: true,
      count: problems.length,
      problems
    });
  } catch (error) {
    console.error('Get coding problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching coding problems'
    });
  }
};

// @desc    Get single coding problem
// @route   GET /api/coding/:id
// @access  Private
export const getCodingProblemById = async (req, res) => {
  try {
    const problem = await CodingProblem.findById(req.params.id)
      .select('-testcases'); // Hide testcases

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.status(200).json({
      success: true,
      problem
    });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching problem'
    });
  }
};

// @desc    Create coding problem (Admin)
// @route   POST /api/coding
// @access  Private/Admin
export const createCodingProblem = async (req, res) => {
  try {
    const problem = await CodingProblem.create(req.body);

    // Update contest total marks
    const contest = await Contest.findById(problem.contestId);
    if (contest) {
      contest.sections.coding.totalMarks += problem.score;
      await contest.save();
    }

    res.status(201).json({
      success: true,
      message: 'Coding problem created successfully',
      problem
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating problem'
    });
  }
};

// @desc    Update coding problem (Admin)
// @route   PUT /api/coding/:id
// @access  Private/Admin
export const updateCodingProblem = async (req, res) => {
  try {
    const problem = await CodingProblem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      problem
    });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating problem'
    });
  }
};

// @desc    Delete coding problem (Admin)
// @route   DELETE /api/coding/:id
// @access  Private/Admin
export const deleteCodingProblem = async (req, res) => {
  try {
    const problem = await CodingProblem.findByIdAndDelete(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting problem'
    });
  }
};
