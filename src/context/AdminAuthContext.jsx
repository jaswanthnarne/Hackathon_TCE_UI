import { createContext, useContext, useState, useEffect } from 'react';
import adminService from '../services/adminService';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminUser');
    if (token && storedAdmin) {
      try { setAdmin(JSON.parse(storedAdmin)); } catch { localStorage.removeItem('adminUser'); }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const { data } = await adminService.login(credentials);
    localStorage.setItem('adminToken', data.data.token);
    localStorage.setItem('adminUser', JSON.stringify(data.data.admin));
    setAdmin(data.data.admin);
    return data;
  };

  const logout = async () => {
    try { await adminService.logout(); } catch {}
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};

export default AdminAuthContext;
