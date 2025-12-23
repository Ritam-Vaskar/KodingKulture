import api from './authService';

export const leaderboardService = {
  getLeaderboard: (contestId) => api.get(`/leaderboard/${contestId}`),
  
  getUserRank: (contestId) => api.get(`/leaderboard/${contestId}/rank`),
  
  getContestStats: (contestId) => api.get(`/leaderboard/${contestId}/stats`)
};
