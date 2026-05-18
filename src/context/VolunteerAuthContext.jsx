import { createContext, useContext, useState, useEffect } from 'react';
import volunteerApi from '../services/volunteerService';

const VolunteerAuthContext = createContext(null);

export const VolunteerAuthProvider = ({ children }) => {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('volunteerToken');
    const stored = localStorage.getItem('volunteerUser');
    if (token && stored) {
      try { setStaff(JSON.parse(stored)); } catch { localStorage.removeItem('volunteerUser'); }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const { data } = await volunteerApi.login({ ...credentials, role: credentials.role || 'volunteer' });
    localStorage.setItem('volunteerToken', data.data.token);
    localStorage.setItem('volunteerUser', JSON.stringify(data.data.staff));
    setStaff(data.data.staff);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('volunteerToken');
    localStorage.removeItem('volunteerUser');
    setStaff(null);
  };

  return (
    <VolunteerAuthContext.Provider value={{ staff, loading, login, logout, isAuthenticated: !!staff }}>
      {children}
    </VolunteerAuthContext.Provider>
  );
};

export const useVolunteerAuth = () => {
  const context = useContext(VolunteerAuthContext);
  if (!context) throw new Error('useVolunteerAuth must be used within VolunteerAuthProvider');
  return context;
};

export default VolunteerAuthContext;
