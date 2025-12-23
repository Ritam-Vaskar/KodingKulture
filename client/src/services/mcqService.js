import api from './authService';

const mcqService = {
  getMCQsByContest: async (contestId) => {
    const response = await api.get(`/mcq/contest/${contestId}`);
    return response.data;
  },
  
  submitMCQAnswers: async (contestId, answers) => {
    const response = await api.post('/mcq/submit', { contestId, answers });
    return response.data;
  },
  
  // Admin routes
  createMCQ: async (data) => {
    const response = await api.post('/mcq', data);
    return response.data;
  },
  
  updateMCQ: async (id, data) => {
    const response = await api.put(`/mcq/${id}`, data);
    return response.data;
  },
  
  deleteMCQ: async (id) => {
    const response = await api.delete(`/mcq/${id}`);
    return response.data;
  }
};

export default mcqService;
