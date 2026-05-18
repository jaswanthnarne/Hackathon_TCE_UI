import api from './api';

const teamService = {
  login: (data) => api.post('/team/auth/login', data),
  changePassword: (data) => api.post('/team/auth/change-password', data),
  forgotPassword: (data) => api.post('/team/auth/forgot-password', data),
  getProfile: () => api.get('/team/profile'),
  getMembers: () => api.get('/team/members'),
  inviteMember: (data) => api.post('/team/members/invite', data),
  getPendingInvites: () => api.get('/team/members/invites'),
  cancelInvite: (inviteId) => api.delete(`/team/members/invites/${inviteId}`),
  removeMember: (memberId) => api.delete(`/team/members/${memberId}`),
  updateMember: (memberId, data) => api.put(`/team/members/${memberId}`, data),
  getInviteDetails: (token) => api.get(`/public/invite/${token}`),
  acceptInvite: (token) => api.post(`/public/invite/${token}/accept`),
  declineInvite: (token) => api.post(`/public/invite/${token}/decline`),
  getQuestions: () => api.get('/team/questions'),
  getAnswerStatus: () => api.get('/team/questions/status'),
  saveAnswer: (data) => api.post('/team/questions/answer', data),
  submitAll: () => api.post('/team/questions/submit'),
  getResults: () => api.get('/team/questions/results'),
  getProblems: () => api.get('/team/problems'),
  selectProblem: (problemId) => api.post('/team/problems/select', { problemId }),
  submitProject: (data) => api.post('/team/submission', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getSubmission: () => api.get('/team/submission'),
  resubmitProject: (data) => api.put('/team/submission', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAnnouncements: () => api.get('/team/announcements'),
  getLeaderboard: () => api.get('/team/leaderboard'),
  getCertificate: () => api.get('/team/certificate'),
  getHackathonInfo: () => api.get('/public/hackathon-info'),

  // Wallet (Digital Coupons)
  getWallet: () => api.get('/team/wallet'),
  tapRedeem: (passId) => api.post('/team/wallet/tap-redeem', { passId }),

  // Help Desk
  requestHelp: (data) => api.post('/team/help/request', data),
  getMyHelpRequests: () => api.get('/team/help/my-requests'),

  // Challenges
  getActiveChallenges: () => api.get('/team/challenges'),
  submitChallengeProof: (data) => api.post('/team/challenges/submit', data),
  getMyBadges: () => api.get('/team/badges'),

  // Venue Map
  getVenueMap: () => api.get('/team/venue-map'),
};

export default teamService;
