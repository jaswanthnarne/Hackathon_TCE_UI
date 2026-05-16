import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamAuth } from '../../../context/TeamAuthContext';
import teamService from '../../../services/teamService';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { updateTeam } = useTeamAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await teamService.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      updateTeam({ forcePasswordChange: false });
      toast.success('Password changed!');
      navigate('/team/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-primary-900 to-secondary-900 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-2">Change Password</h2>
        <p className="text-white/60 mb-6 text-sm">You must change your password before continuing.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm text-white/80 mb-1">Current Password</label><input type="password" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required /></div>
          <div><label className="block text-sm text-white/80 mb-1">New Password</label><input type="password" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required /></div>
          <div><label className="block text-sm text-white/80 mb-1">Confirm Password</label><input type="password" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required /></div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-white/90 disabled:opacity-50">{loading ? 'Changing...' : 'Change Password'}</button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
