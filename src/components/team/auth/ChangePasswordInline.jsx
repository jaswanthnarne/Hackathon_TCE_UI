import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamAuth } from '../../../context/TeamAuthContext';
import teamService from '../../../services/teamService';
import toast from 'react-hot-toast';

const ChangePasswordInline = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { updateTeam } = useTeamAuth();
  const navigate = useNavigate();

  const passwordStrength = (pw) => {
    if (!pw) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
      { label: 'Weak', color: 'bg-red-500', width: '25%' },
      { label: 'Fair', color: 'bg-yellow-500', width: '50%' },
      { label: 'Good', color: 'bg-blue-500', width: '75%' },
      { label: 'Strong', color: 'bg-green-500', width: '100%' },
    ];
    return map[Math.min(score, 4) - 1] || map[0];
  };

  const strength = passwordStrength(form.newPassword);
  const passwordsMatch = form.confirmPassword && form.newPassword === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await teamService.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      updateTeam({ forcePasswordChange: false });
      toast.success('Password changed successfully!');
      navigate('/team/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setLoading(false); }
  };

  const EyeIcon = ({ show, toggle }) => (
    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 transition-colors">
      {show ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      )}
    </button>
  );

  return (
    <div className="animate-fade-in">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Change Password</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Update your team's login password for security.</p>
        </div>

        <div className="card overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 dark:from-primary-900/20 dark:to-secondary-900/20 border-b border-dark-100 dark:border-dark-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-dark-900 dark:text-dark-100">Security Settings</h3>
                <p className="text-xs text-dark-500 dark:text-dark-400">Choose a strong password to protect your team account</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} className="input pr-10" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} placeholder="Enter current password" required />
                <EyeIcon show={showCurrent} toggle={() => setShowCurrent(!showCurrent)} />
              </div>
            </div>

            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} className="input pr-10" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} placeholder="Min 8 characters" required />
                <EyeIcon show={showNew} toggle={() => setShowNew(!showNew)} />
              </div>
              {form.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-dark-500">Password strength</span>
                    <span className={`font-semibold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  { test: form.newPassword.length >= 8, label: '8+ chars' },
                  { test: /[A-Z]/.test(form.newPassword), label: 'Uppercase' },
                  { test: /[0-9]/.test(form.newPassword), label: 'Number' },
                  { test: /[^A-Za-z0-9]/.test(form.newPassword), label: 'Symbol' },
                ].map((rule) => (
                  <span key={rule.label} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${rule.test ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-dark-100 dark:bg-dark-700 text-dark-400'}`}>
                    {rule.test ? <svg className="w-3.5 h-3.5 inline mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> : <svg className="w-3.5 h-3.5 inline mr-1 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} {rule.label}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" className={`input ${form.confirmPassword ? (passwordsMatch ? 'border-green-500 focus:ring-green-500/20' : 'border-red-500 focus:ring-red-500/20') : ''}`} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Re-enter new password" required />
              {form.confirmPassword && (
                <p className={`text-xs mt-1 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordsMatch ? <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Passwords match</span> : <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>Passwords do not match</span>}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading || !passwordsMatch || form.newPassword.length < 8} className="btn-primary w-full py-3">
                {loading ? (
                  <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Updating...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    Update Password
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordInline;
