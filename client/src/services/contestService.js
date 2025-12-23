import api from './authService';

export const contestService = {
  getAllContests: (status) => {
    const url = status ? `/contests?status=${status}` : '/contests';
    return api.get(url);
  },
  
  getContestById: (id) => api.get(`/contests/${id}`),
  
  getMyContests: () => api.get('/contests/my-contests'),
  
  registerForContest: (id) => api.post(`/contests/${id}/register`),
  
  // Admin routes
  createContest: (data) => api.post('/contests', data),
  updateContest: (id, data) => api.put(`/contests/${id}`, data),
  deleteContest: (id) => api.delete(`/contests/${id}`)
};
