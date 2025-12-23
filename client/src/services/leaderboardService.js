import api from './authService';

const leaderboardService = {
  getLeaderboard: async (contestId) => {
    const response = await api.get(`/leaderboard/${contestId}`);
    return response.data;
  },
  
  getUserRank: async (contestId) => {
    const response = await api.get(`/leaderboard/${contestId}/rank`);
    return response.data;
  },
  
  getContestStats: async (contestId) => {
    const response = await api.get(`/leaderboard/${contestId}/stats`);
    return response.data;
  },
  
  generateCertificate: async (contestId) => {
    const response = await api.post(`/leaderboard/${contestId}/certificate`);
    return response.data;
  }
};

export default leaderboardService;
