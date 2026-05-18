import api from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('judgeToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const judgeApi = {
  // Auth
  login: (data) => api.post('/judge/auth/login', data),
  getMe: () => api.get('/judge/auth/me', { headers: getAuthHeaders() }),

  // Judging
  getAssignedTeams: () => api.get('/judge/teams', { headers: getAuthHeaders() }),
  submitScore: (data) => api.post('/judge/score', data, { headers: getAuthHeaders() }),
  getScoreboard: () => api.get('/judge/scoreboard', { headers: getAuthHeaders() }),

  // Venue Map
  getVenueMap: () => api.get('/judge/venue-map', { headers: getAuthHeaders() }),
};

export default judgeApi;
