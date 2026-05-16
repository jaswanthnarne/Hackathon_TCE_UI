import { createContext, useContext, useState, useEffect } from 'react';
import teamService from '../services/teamService';

const TeamAuthContext = createContext(null);

export const TeamAuthProvider = ({ children }) => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('teamToken');
    const storedTeam = localStorage.getItem('teamUser');
    if (token && storedTeam) {
      try { setTeam(JSON.parse(storedTeam)); } catch { localStorage.removeItem('teamUser'); }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const { data } = await teamService.login(credentials);
    localStorage.setItem('teamToken', data.data.token);
    localStorage.setItem('teamUser', JSON.stringify(data.data.team));
    setTeam(data.data.team);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('teamToken');
    localStorage.removeItem('teamUser');
    setTeam(null);
  };

  const updateTeam = (updates) => {
    const updated = { ...team, ...updates };
    setTeam(updated);
    localStorage.setItem('teamUser', JSON.stringify(updated));
  };

  return (
    <TeamAuthContext.Provider value={{ team, loading, login, logout, updateTeam, isAuthenticated: !!team }}>
      {children}
    </TeamAuthContext.Provider>
  );
};

export const useTeamAuth = () => {
  const context = useContext(TeamAuthContext);
  if (!context) throw new Error('useTeamAuth must be used within TeamAuthProvider');
  return context;
};

export default TeamAuthContext;
