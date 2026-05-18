import { createContext, useContext, useState, useEffect } from 'react';
import judgeApi from '../services/judgeService';

const JudgeAuthContext = createContext(null);

export const JudgeAuthProvider = ({ children }) => {
  const [judge, setJudge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('judgeToken');
    const stored = localStorage.getItem('judgeUser');
    if (token && stored) {
      try { setJudge(JSON.parse(stored)); } catch { localStorage.removeItem('judgeUser'); }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const { data } = await judgeApi.login({ ...credentials, role: 'judge' });
    localStorage.setItem('judgeToken', data.data.token);
    localStorage.setItem('judgeUser', JSON.stringify(data.data.staff));
    setJudge(data.data.staff);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('judgeToken');
    localStorage.removeItem('judgeUser');
    setJudge(null);
  };

  return (
    <JudgeAuthContext.Provider value={{ judge, loading, login, logout, isAuthenticated: !!judge }}>
      {children}
    </JudgeAuthContext.Provider>
  );
};

export const useJudgeAuth = () => {
  const context = useContext(JudgeAuthContext);
  if (!context) throw new Error('useJudgeAuth must be used within JudgeAuthProvider');
  return context;
};

export default JudgeAuthContext;
