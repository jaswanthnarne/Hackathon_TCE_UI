import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    // dynamically import teamService (since it exposes public API route)
    import('../../../services/teamService').then(mod => {
      mod.default.getHackathonInfo().then(res => setConfig(res.data.data.config)).catch(() => {});
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-secondary-600 to-primary-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {config?.logoUrl ? <img src={config.logoUrl} alt="Logo" className="w-20 h-20 mx-auto object-contain mb-2 rounded" /> : null}
          <h1 className="text-4xl font-black text-white mb-2">{config?.name || 'TCE Hackathon'}</h1>
          <p className="text-white/70">Admin Panel</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50" placeholder="admin@tcehack.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50" placeholder="••••••••" required />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                <input type="checkbox" checked={form.rememberMe} onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })} className="rounded border-white/30" />
                Remember me
              </label>
              <a href="/admin/forgot-password" className="text-sm text-white/70 hover:text-white">Forgot password?</a>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-white/90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>
        </div>
        <p className="text-center mt-4 text-white/50 text-sm">{config?.venue?.collegeName || 'TCE College'}, {config?.venue?.address || 'Gadag'}</p>
      </div>
    </div>
  );
};

export default AdminLogin;
