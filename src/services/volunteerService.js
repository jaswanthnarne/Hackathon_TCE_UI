import api from './api';

// Uses separate token storage key: 'volunteerToken'
const getAuthHeaders = () => {
  const token = localStorage.getItem('volunteerToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const volunteerApi = {
  // Auth
  login: (data) => api.post('/volunteer/auth/login', data),
  getMe: () => api.get('/volunteer/auth/me', { headers: getAuthHeaders() }),

  // QR Redemption
  redeemByQR: (qrData) => api.post('/volunteer/redeem/qr', { qrData }, { headers: getAuthHeaders() }),
  redeemByTeamId: (teamId, passId) => api.post('/volunteer/redeem/manual', { teamId, passId }, { headers: getAuthHeaders() }),

  // Meal Passes
  getMealPasses: () => api.get('/volunteer/meal-passes', { headers: getAuthHeaders() }),

  // Help Queue
  getHelpRequests: (status) => api.get('/volunteer/help-requests', { params: { status }, headers: getAuthHeaders() }),
  claimRequest: (id) => api.put(`/volunteer/help-requests/${id}/claim`, {}, { headers: getAuthHeaders() }),
  resolveRequest: (id, note) => api.put(`/volunteer/help-requests/${id}/resolve`, { note }, { headers: getAuthHeaders() }),
  getMyClaimed: () => api.get('/volunteer/help-requests/my-claimed', { headers: getAuthHeaders() }),
};

export default volunteerApi;
