import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJudgeAuth } from '../../../context/JudgeAuthContext';
import toast from 'react-hot-toast';

const JudgeLogin = () => {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useJudgeAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ staffId, password });
      toast.success('Welcome, Judge!');
      navigate('/judge/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">⚖️</span>
          <h1 className="text-3xl font-black text-white">Judges Portal</h1>
          <p className="text-slate-400 mt-2">Evaluate and score hackathon submissions</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Judge ID</label>
            <input type="text" value={staffId} onChange={e => setStaffId(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              placeholder="Enter your judge ID" required autoFocus />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              placeholder="Enter password" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50">
            {loading ? <span className="flex items-center justify-center gap-2"><span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />Logging in...</span> : 'Sign In as Judge'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Contact your hackathon admin for login credentials
        </p>
      </div>
    </div>
  );
};

export default JudgeLogin;
