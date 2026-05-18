import api from './api';

const adminService = {
  // Auth
  login: (data) => api.post('/console/admin/auth/login', data),
  logout: () => api.post('/console/admin/auth/logout'),
  getMe: () => api.get('/console/admin/auth/me'),
  forgotPassword: (data) => api.post('/console/admin/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/console/admin/auth/reset-password/${token}`, data),

  // Teams
  getTeams: (params) => api.get('/console/admin/teams', { params }),
  createTeam: (data) => api.post('/console/admin/teams', data),
  bulkImportTeamsJson: (data) => api.post('/console/admin/teams/bulk-import-json', data),
  getTeam: (id) => api.get(`/console/admin/teams/${id}`),
  updateTeam: (id, data) => api.put(`/console/admin/teams/${id}`, data),
  deleteTeam: (id) => api.delete(`/console/admin/teams/${id}`),
  bulkDeleteTeams: (teamIds) => api.delete('/console/admin/teams/bulk', { data: { teamIds } }),
  changeTeamStatus: (id, data) => api.put(`/console/admin/teams/${id}/status`, data),
  resetTeamPassword: (id) => api.put(`/console/admin/teams/${id}/reset-password`),
  forcePasswordChange: (id, data) => api.put(`/console/admin/teams/${id}/force-password-change`, data),
  unlockTeam: (id) => api.put(`/console/admin/teams/${id}/unlock`),
  exportTeams: () => api.get('/console/admin/teams/export', { responseType: 'blob' }),

  // Members
  addMember: (teamId, data) => api.post(`/console/admin/teams/${teamId}/members`, data),
  editMember: (teamId, memberId, data) => api.put(`/console/admin/teams/${teamId}/members/${memberId}`, data),
  removeMember: (teamId, memberId) => api.delete(`/console/admin/teams/${teamId}/members/${memberId}`),
  changeLead: (teamId, data) => api.put(`/console/admin/teams/${teamId}/change-lead`, data),

  // Password Requests
  getPasswordRequests: () => api.get('/console/admin/password-requests'),
  approvePasswordRequest: (id) => api.put(`/console/admin/password-requests/${id}/approve`),
  denyPasswordRequest: (id, data) => api.put(`/console/admin/password-requests/${id}/deny`, data),

  // Questions
  getQuestions: (params) => api.get('/console/admin/questions', { params }),
  createQuestion: (data) => api.post('/console/admin/questions', data),
  getQuestion: (id) => api.get(`/console/admin/questions/${id}`),
  updateQuestion: (id, data) => api.put(`/console/admin/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/console/admin/questions/${id}`),
  duplicateQuestion: (id) => api.post(`/console/admin/questions/${id}/duplicate`),
  exportQuestions: () => api.get('/console/admin/questions/export', { responseType: 'blob' }),

  // Problem Statements
  getProblems: () => api.get('/console/admin/problems'),
  createProblem: (data) => api.post('/console/admin/problems', data),
  updateProblem: (id, data) => api.put(`/console/admin/problems/${id}`, data),
  deleteProblem: (id) => api.delete(`/console/admin/problems/${id}`),

  // Overrides
  overrideAnswer: (data) => api.post('/console/admin/overrides/answer', data),
  overrideScore: (data) => api.post('/console/admin/overrides/score', data),
  overrideSubmission: (data) => api.post('/console/admin/overrides/submission', data),
  timeExtension: (data) => api.post('/console/admin/overrides/time-extension', data),
  resetAnswers: (data) => api.post('/console/admin/overrides/reset-answers', data),

  // Submissions
  getSubmissions: () => api.get('/console/admin/submissions'),
  getSubmission: (teamId) => api.get(`/console/admin/submissions/${teamId}`),
  evaluateSubmission: (id, data) => api.put(`/console/admin/submissions/${id}/evaluate`, data),

  // Results
  getResults: () => api.get('/console/admin/results'),
  calculateResults: () => api.post('/console/admin/results/calculate'),
  editResult: (teamId, data) => api.put(`/console/admin/results/${teamId}`, data),
  publishResults: () => api.post('/console/admin/results/publish'),
  unpublishResults: () => api.post('/console/admin/results/unpublish'),
  exportResults: () => api.get('/console/admin/results/export', { responseType: 'blob' }),

  // Certificates
  generateAllCerts: () => api.post('/console/admin/certificates/generate/all'),
  generateWinnerCerts: () => api.post('/console/admin/certificates/generate/winners'),
  emailAllCerts: () => api.post('/console/admin/certificates/email/all'),

  // Announcements
  getAnnouncements: () => api.get('/console/admin/announcements'),
  createAnnouncement: (data) => api.post('/console/admin/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/console/admin/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/console/admin/announcements/${id}`),
  togglePin: (id) => api.put(`/console/admin/announcements/${id}/pin`),

  // Email
  sendEmail: (data) => api.post('/console/admin/email/send', data),
  getEmailLogs: (params) => api.get('/console/admin/email/logs', { params }),

  // Config
  getConfig: () => api.get('/console/admin/config'),
  updateConfig: (data) => api.put('/console/admin/config', data),
  updateTimer: (data) => api.post('/console/admin/config/timer', data),
  uploadLogo: (data) => api.post('/console/admin/config/logo', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadBanner: (data) => api.post('/console/admin/config/banner', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Analytics
  getDashboard: () => api.get('/console/admin/analytics/dashboard'),
  getRegistrationTrend: (params) => api.get('/console/admin/analytics/registration-trend', { params }),
  getCollegeWise: () => api.get('/console/admin/analytics/college-wise'),
  getScoreDistribution: () => api.get('/console/admin/analytics/score-distribution'),
  getQuestionAnalysis: () => api.get('/console/admin/analytics/question-analysis'),

  // Reports
  getTeamsReport: (params) => api.get('/console/admin/reports/teams', { params, responseType: 'blob' }),
  getParticipantsReport: () => api.get('/console/admin/reports/participants', { responseType: 'blob' }),

  // Audit
  getAuditLogs: (params) => api.get('/console/admin/audit', { params }),

  // Staff Management (Volunteer, Mentor, Judge)
  getStaff: (role) => api.get('/console/admin/staff', { params: { role } }),
  createStaff: (data) => api.post('/console/admin/staff', data),
  deleteStaff: (id) => api.delete(`/console/admin/staff/${id}`),
  assignTeamsToJudge: (judgeId, teamIds) => api.post('/console/admin/staff/assign-teams', { judgeId, teamIds }),

  // Meal Passes (Digital Coupon System)
  getMealPasses: () => api.get('/console/admin/meal-passes'),
  createMealPass: (data) => api.post('/console/admin/meal-passes', data),
  updateMealPass: (id, data) => api.put(`/console/admin/meal-passes/${id}`, data),
  deleteMealPass: (id) => api.delete(`/console/admin/meal-passes/${id}`),
  getMealPassStats: () => api.get('/console/admin/meal-passes/stats'),

  // Table Allocation
  assignTable: (teamId, data) => api.put(`/console/admin/tables/${teamId}`, data),
  bulkAssignTables: (assignments) => api.post('/console/admin/tables/bulk', { assignments }),
  getVenueMap: () => api.get('/console/admin/tables/map'),

  // Challenges (Midnight Mini-Challenges)
  getChallenges: () => api.get('/console/admin/challenges'),
  createChallenge: (data) => api.post('/console/admin/challenges', data),
  updateChallenge: (id, data) => api.put(`/console/admin/challenges/${id}`, data),
  deleteChallenge: (id) => api.delete(`/console/admin/challenges/${id}`),
  markChallengeWinner: (challengeId, teamObjectId) => api.post('/console/admin/challenges/mark-winner', { challengeId, teamObjectId }),

  // Judge Scoring (admin view)
  getJudgingScoreboard: () => api.get('/console/admin/judging/scoreboard'),
  getJudges: () => api.get('/console/admin/judging/judges'),
};

export default adminService;

