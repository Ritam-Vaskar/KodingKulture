import api from './authService';

const contestService = {
  getAllContests: async (status) => {
    const url = status ? `/contests?status=${status}` : '/contests';
    const response = await api.get(url);
    return response.data;
  },
  
  getContestById: async (id) => {
    const response = await api.get(`/contests/${id}`);
    return response.data;
  },
  
  getMyContests: async () => {
    const response = await api.get('/contests/my-contests');
    return response.data;
  },
  
  registerForContest: async (id) => {
    const response = await api.post(`/contests/${id}/register`);
    return response.data;
  },
  
  // Admin routes
  createContest: async (data) => {
    const response = await api.post('/contests', data);
    return response.data;
  },
  
  updateContest: async (id, data) => {
    const response = await api.put(`/contests/${id}`, data);
    return response.data;
  },
  
  deleteContest: async (id) => {
    const response = await api.delete(`/contests/${id}`);
    return response.data;
  }
};

export default contestService;
