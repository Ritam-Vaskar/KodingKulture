import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import leaderboardService from '../../services/leaderboardService';
import Loader from '../../components/common/Loader';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const { contestId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    fetchStats();
  }, [contestId]);

  const fetchLeaderboard = async () => {
    try {
      const data = await leaderboardService.getLeaderboard(contestId);
      setLeaderboard(data.leaderboard);
    } catch (error) {
      toast.error('Failed to fetch leaderboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await leaderboardService.getContestStats(contestId);
      setStats(data.stats);
    } catch (error) {
      console.error(error);
    }
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</span>;
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Leaderboard</h1>
          {stats && <p className="text-gray-400">{stats.contestTitle}</p>}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="card text-center">
              <div className="text-3xl font-bold text-primary-500 mb-2">{stats.totalParticipants}</div>
              <div className="text-gray-400">Total Participants</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-primary-500 mb-2">{stats.submitted}</div>
              <div className="text-gray-400">Submitted</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-primary-500 mb-2">{stats.averageScore.toFixed(1)}</div>
              <div className="text-gray-400">Average Score</div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="card overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-800 border-b border-dark-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Participant</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">MCQ Score</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Coding Score</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Total Score</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Time Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {leaderboard.map((entry, index) => (
                    <tr 
                      key={entry._id} 
                      className={`hover:bg-dark-800 transition-colors ${
                        entry.rank <= 3 ? 'bg-primary-500/5' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getRankIcon(entry.rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-white">{entry.userId?.name}</div>
                          <div className="text-sm text-gray-400">{entry.userId?.college}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-300">{entry.mcqScore || 0}</td>
                      <td className="px-6 py-4 text-center text-gray-300">{entry.codingScore || 0}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-primary-500">{entry.totalScore}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-400">
                        {Math.floor(entry.timeTaken / 60)} mins
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
