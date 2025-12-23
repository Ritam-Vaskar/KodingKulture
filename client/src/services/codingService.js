import api from './authService';

export const codingService = {
  getProblemsByContest: (contestId) => api.get(`/coding/contest/${contestId}`),
  
  getProblemById: (id) => api.get(`/coding/${id}`),
  
  submitCode: (data) => api.post('/submissions', data),
  
  getSubmissionsByProblem: (problemId) => api.get(`/submissions/problem/${problemId}`),
  
  getSubmissionById: (id) => api.get(`/submissions/${id}`),
  
  // Admin routes
  createProblem: (data) => api.post('/coding', data),
  updateProblem: (id, data) => api.put(`/coding/${id}`, data),
  deleteProblem: (id) => api.delete(`/coding/${id}`)
};
