import api from './api';

const adminService = {
  // Auth
  login: (data) => api.post('/admin/auth/login', data),
  logout: () => api.post('/admin/auth/logout'),
  getMe: () => api.get('/admin/auth/me'),
  forgotPassword: (data) => api.post('/admin/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/admin/auth/reset-password/${token}`, data),

  // Teams
  getTeams: (params) => api.get('/admin/teams', { params }),
  createTeam: (data) => api.post('/admin/teams', data),
  bulkImportTeamsJson: (data) => api.post('/admin/teams/bulk-import-json', data),
  getTeam: (id) => api.get(`/admin/teams/${id}`),
  updateTeam: (id, data) => api.put(`/admin/teams/${id}`, data),
  deleteTeam: (id) => api.delete(`/admin/teams/${id}`),
  bulkDeleteTeams: (teamIds) => api.delete('/admin/teams/bulk', { data: { teamIds } }),
  changeTeamStatus: (id, data) => api.put(`/admin/teams/${id}/status`, data),
  resetTeamPassword: (id) => api.put(`/admin/teams/${id}/reset-password`),
  forcePasswordChange: (id, data) => api.put(`/admin/teams/${id}/force-password-change`, data),
  unlockTeam: (id) => api.put(`/admin/teams/${id}/unlock`),
  exportTeams: () => api.get('/admin/teams/export', { responseType: 'blob' }),

  // Members
  addMember: (teamId, data) => api.post(`/admin/teams/${teamId}/members`, data),
  editMember: (teamId, memberId, data) => api.put(`/admin/teams/${teamId}/members/${memberId}`, data),
  removeMember: (teamId, memberId) => api.delete(`/admin/teams/${teamId}/members/${memberId}`),
  changeLead: (teamId, data) => api.put(`/admin/teams/${teamId}/change-lead`, data),

  // Password Requests
  getPasswordRequests: () => api.get('/admin/password-requests'),
  approvePasswordRequest: (id) => api.put(`/admin/password-requests/${id}/approve`),
  denyPasswordRequest: (id, data) => api.put(`/admin/password-requests/${id}/deny`, data),

  // Questions
  getQuestions: (params) => api.get('/admin/questions', { params }),
  createQuestion: (data) => api.post('/admin/questions', data),
  getQuestion: (id) => api.get(`/admin/questions/${id}`),
  updateQuestion: (id, data) => api.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),
  duplicateQuestion: (id) => api.post(`/admin/questions/${id}/duplicate`),
  exportQuestions: () => api.get('/admin/questions/export', { responseType: 'blob' }),

  // Problem Statements
  getProblems: () => api.get('/admin/problems'),
  createProblem: (data) => api.post('/admin/problems', data),
  updateProblem: (id, data) => api.put(`/admin/problems/${id}`, data),
  deleteProblem: (id) => api.delete(`/admin/problems/${id}`),

  // Overrides
  overrideAnswer: (data) => api.post('/admin/overrides/answer', data),
  overrideScore: (data) => api.post('/admin/overrides/score', data),
  overrideSubmission: (data) => api.post('/admin/overrides/submission', data),
  timeExtension: (data) => api.post('/admin/overrides/time-extension', data),
  resetAnswers: (data) => api.post('/admin/overrides/reset-answers', data),

  // Submissions
  getSubmissions: () => api.get('/admin/submissions'),
  getSubmission: (teamId) => api.get(`/admin/submissions/${teamId}`),
  evaluateSubmission: (id, data) => api.put(`/admin/submissions/${id}/evaluate`, data),

  // Results
  getResults: () => api.get('/admin/results'),
  calculateResults: () => api.post('/admin/results/calculate'),
  editResult: (teamId, data) => api.put(`/admin/results/${teamId}`, data),
  publishResults: () => api.post('/admin/results/publish'),
  unpublishResults: () => api.post('/admin/results/unpublish'),
  exportResults: () => api.get('/admin/results/export', { responseTypjue: 'blob' }),

  // Certificates
  generateAllCerts: () => api.post('/admin/certificates/generate/all'),
  generateWinnerCerts: () => api.post('/admin/certificates/generate/winners'),
  emailAllCerts: () => api.post('/admin/certificates/email/all'),

  // Announcements
  getAnnouncements: () => api.get('/admin/announcements'),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/admin/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),
  togglePin: (id) => api.put(`/admin/announcements/${id}/pin`),

  // Email
  sendEmail: (data) => api.post('/admin/email/send', data),
  getEmailLogs: (params) => api.get('/admin/email/logs', { params }),

  // Config
  getConfig: () => api.get('/admin/config'),
  updateConfig: (data) => api.put('/admin/config', data),
  uploadLogo: (data) => api.post('/admin/config/logo', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadBanner: (data) => api.post('/admin/config/banner', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Analytics
  getDashboard: () => api.get('/admin/analytics/dashboard'),
  getRegistrationTrend: (params) => api.get('/admin/analytics/registration-trend', { params }),
  getCollegeWise: () => api.get('/admin/analytics/college-wise'),
  getScoreDistribution: () => api.get('/admin/analytics/score-distribution'),
  getQuestionAnalysis: () => api.get('/admin/analytics/question-analysis'),

  // Reports
  getTeamsReport: (params) => api.get('/admin/reports/teams', { params, responseType: 'blob' }),
  getParticipantsReport: () => api.get('/admin/reports/participants', { responseType: 'blob' }),

  // Audit
  getAuditLogs: (params) => api.get('/admin/audit', { params }),
};

export default adminService;
