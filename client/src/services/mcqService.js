import api from './authService';

export const mcqService = {
  getMCQsByContest: (contestId) => api.get(`/mcq/contest/${contestId}`),
  
  submitMCQAnswers: (data) => api.post('/mcq/submit', data),
  
  // Admin routes
  createMCQ: (data) => api.post('/mcq', data),
  updateMCQ: (id, data) => api.put(`/mcq/${id}`, data),
  deleteMCQ: (id) => api.delete(`/mcq/${id}`)
};
