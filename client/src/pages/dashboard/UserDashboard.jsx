import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { contestService } from '../../services/contestService';
import ContestCard from '../../components/contest/ContestCard';
import Loader from '../../components/common/Loader';
import { User, Trophy, Target, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user } = useAuth();
  const [myContests, setMyContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyContests();
  }, []);

  const fetchMyContests = async () => {
    try {
      const response = await contestService.getMyContests();
      setMyContests(response.data.contests);
    } catch (error) {
      toast.error('Failed to fetch contests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 rounded-2xl">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">{user?.name}</h1>
              <p className="text-gray-400">{user?.email}</p>
              {user?.college && (
                <p className="text-gray-500 text-sm mt-1">{user.college}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Role</div>
              <span className="badge-primary text-lg">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="bg-primary-500/10 p-4 rounded-xl">
                <Calendar className="w-8 h-8 text-primary-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{myContests.length}</div>
                <div className="text-gray-400 text-sm">Contests Joined</div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="bg-primary-500/10 p-4 rounded-xl">
                <Target className="w-8 h-8 text-primary-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{user?.totalScore || 0}</div>
                <div className="text-gray-400 text-sm">Total Score</div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="bg-primary-500/10 p-4 rounded-xl">
                <Trophy className="w-8 h-8 text-primary-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{user?.rank || 'N/A'}</div>
                <div className="text-gray-400 text-sm">Global Rank</div>
              </div>
            </div>
          </div>
        </div>

        {/* My Contests */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">My Contests</h2>
          {myContests.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400 text-lg mb-4">You haven't joined any contests yet</p>
              <a href="/contests" className="btn-primary inline-block">
                Browse Contests
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myContests.map((contest) => (
                <ContestCard key={contest._id} contest={contest} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
