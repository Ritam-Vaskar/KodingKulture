import Result from '../models/Result.js';
import Contest from '../models/Contest.js';

// @desc    Generate certificate for user
// @route   POST /api/leaderboard/:contestId/certificate
// @access  Private
export const generateCertificate = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user._id;

    const result = await Result.findOne({ contestId, userId })
      .populate('contestId', 'title')
      .populate('userId', 'name email');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    if (result.status !== 'SUBMITTED' && result.status !== 'EVALUATED') {
      return res.status(400).json({
        success: false,
        message: 'Contest not completed yet'
      });
    }

    // Simple certificate data (can be extended with PDF generation using pdfkit)
    const certificateData = {
      certificateId: `CERT-${contestId.slice(-6)}-${userId.toString().slice(-6)}`,
      userName: result.userId.name,
      contestTitle: result.contestId.title,
      rank: result.rank,
      score: result.totalScore,
      issueDate: new Date().toLocaleDateString(),
      certificateUrl: `${process.env.CLIENT_URL}/certificate/${result._id}`
    };

    // Update result with certificate info
    result.certificateGenerated = true;
    result.certificateUrl = certificateData.certificateUrl;
    await result.save();

    res.status(200).json({
      success: true,
      certificate: certificateData
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating certificate'
    });
  }
};

// @desc    Get leaderboard for a contest
// @route   GET /api/leaderboard/:contestId
// @access  Public
export const getLeaderboard = async (req, res) => {
  try {
    const { contestId } = req.params;

    const results = await Result.find({ 
      contestId,
      status: { $in: ['SUBMITTED', 'EVALUATED'] }
    })
      .populate('userId', 'name email college avatar')
      .sort({ totalScore: -1, timeTaken: 1 })
      .lean();

    // Assign ranks with tie-breaker
    let currentRank = 1;
    for (let i = 0; i < results.length; i++) {
      if (i > 0) {
        const prev = results[i - 1];
        const curr = results[i];
        
        if (curr.totalScore === prev.totalScore && curr.timeTaken === prev.timeTaken) {
          results[i].rank = results[i - 1].rank;
        } else {
          currentRank = i + 1;
          results[i].rank = currentRank;
        }
      } else {
        results[i].rank = currentRank;
      }

      // Update rank in database
      await Result.findByIdAndUpdate(results[i]._id, { rank: results[i].rank });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      leaderboard: results
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard'
    });
  }
};

// @desc    Get user's rank in contest
// @route   GET /api/leaderboard/:contestId/rank
// @access  Private
export const getUserRank = async (req, res) => {
  try {
    const { contestId } = req.params;

    const result = await Result.findOne({
      userId: req.user._id,
      contestId
    }).populate('userId', 'name email');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No result found for this contest'
      });
    }

    res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Get rank error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching rank'
    });
  }
};

// @desc    Get contest statistics
// @route   GET /api/leaderboard/:contestId/stats
// @access  Public
export const getContestStats = async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    const totalParticipants = contest.participants.length;
    const submitted = await Result.countDocuments({
      contestId,
      status: { $in: ['SUBMITTED', 'EVALUATED'] }
    });

    const avgScore = await Result.aggregate([
      { $match: { contestId: contest._id, status: { $in: ['SUBMITTED', 'EVALUATED'] } } },
      { $group: { _id: null, avgScore: { $avg: '$totalScore' } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalParticipants,
        submitted,
        averageScore: avgScore[0]?.avgScore || 0,
        contestTitle: contest.title
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching stats'
    });
  }
};
