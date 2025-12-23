import { useState, useEffect } from 'react';
import contestService from '../../services/contestService';
import ContestCard from '../../components/contest/ContestCard';
import Loader from '../../components/common/Loader';
import { Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const ContestList = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchContests();
  }, [filter]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'ALL' ? '' : filter;
      const data = await contestService.getAllContests(statusFilter);
      setContests(data.contests);
    } catch (error) {
      toast.error('Failed to fetch contests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterButtons = [
    { label: 'All', value: 'ALL' },
    { label: 'Live', value: 'LIVE' },
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'Ended', value: 'ENDED' }
  ];

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">All Contests</h1>
          <p className="text-gray-400">Browse and participate in exciting coding contests</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-gray-400">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filter:</span>
          </div>
          <div className="flex gap-3">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === btn.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contest Grid */}
        {contests.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 text-lg">No contests found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((contest) => (
              <ContestCard key={contest._id} contest={contest} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestList;
