import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamAuth } from '../../../context/TeamAuthContext';
import toast from 'react-hot-toast';

const TeamLogin = () => {
  const [form, setForm] = useState({ teamId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useTeamAuth();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    // import teamService dynamically or at the top
    import('../../../services/teamService').then(mod => {
      mod.default.getHackathonInfo().then(res => setConfig(res.data.data.config)).catch(() => {});
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(form);
      if (result.data.team.forcePasswordChange) {
        navigate('/team/change-password');
      } else {
        toast.success('Welcome!');
        navigate('/team/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-primary-900 to-secondary-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {config?.logoUrl ? <img src={config.logoUrl} alt="Logo" className="w-20 h-20 mx-auto object-contain mb-2 rounded" /> : null}
          <h1 className="text-4xl font-black text-white mb-2">{config?.name || 'TCE Hackathon'}</h1>
          <p className="text-white/70">Team Login</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Team ID</label>
              <input type="text" value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value.toUpperCase() })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 font-mono" placeholder="TCE001" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href="/team/forgot-password" className="text-sm text-white/60 hover:text-white/90">Forgot Password?</a>
          </div>
        </div>
        <div className="text-center mt-4">
          <a href="/" className="text-white/50 hover:text-white/80 text-sm">← Back to Home</a>
        </div>
      </div>
    </div>
  );
};

export default TeamLogin;
