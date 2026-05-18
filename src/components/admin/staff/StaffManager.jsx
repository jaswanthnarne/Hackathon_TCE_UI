import { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

const StaffManager = () => {
  const [staff, setStaff] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('volunteer');
  const [dutyArea, setDutyArea] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      const { data } = await adminService.getStaff();
      setStaff(data.data?.staff || []);
    } catch {}
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !staffId || !password) return toast.error('Name, ID, and Password are required');
    setSubmitting(true);
    try {
      await adminService.createStaff({ name, staffId, password, role, dutyArea, specialization });
      toast.success('Staff account created!');
      setName('');
      setStaffId('');
      setPassword('');
      setDutyArea('');
      setSpecialization('');
      setShowCreate(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff account?')) return;
    try {
      await adminService.deleteStaff(id);
      toast.success('Staff account deleted');
      fetchStaff();
    } catch {
      toast.error('Failed to delete staff account');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">👥 Staff & Support Management</h1>
          <p className="text-dark-500 dark:text-dark-400">Configure and monitor volunteer, mentor, and judge accounts</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow transition">
          ➕ Add Staff
        </button>
      </div>

      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-xs font-bold text-slate-500 uppercase">
                <th className="p-4">Name & ID</th>
                <th className="p-4">Role</th>
                <th className="p-4">Specialization</th>
                <th className="p-4">Duty Area</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-sm">
              {staff.map(member => (
                <tr key={member._id} className="hover:bg-slate-50 dark:hover:bg-dark-950/50">
                  <td className="p-4 font-bold text-dark-900 dark:text-white">
                    {member.name}
                    <p className="text-xs text-slate-500 font-mono font-normal">ID: {member.staffId}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      member.role === 'judge' ? 'bg-amber-100 text-amber-800' : member.role === 'mentor' ? 'bg-violet-100 text-violet-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>{member.role}</span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{member.specialization || '-'}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{member.dutyArea || '-'}</td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(member._id)} className="text-red-500 hover:text-red-700 font-semibold text-xs">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400">
                    No staff members created yet. Click "Add Staff" to create accounts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <form onSubmit={handleSubmit} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Create Staff Account</h3>
              <button type="button" onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-500">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Jane Doe" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Staff ID (Unique Username)</label>
                <input type="text" value={staffId} onChange={e => setStaffId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  placeholder="e.g. VOL007" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  placeholder="Create temporary password" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Role</label>
                <select value={role} onChange={e => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500">
                  <option value="volunteer">Volunteer</option>
                  <option value="mentor">Mentor</option>
                  <option value="judge">Judge</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duty Area Location (Optional)</label>
                <input type="text" value={dutyArea} onChange={e => setDutyArea(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Food Court 2, Lab 5" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Specialization (Optional)</label>
                <input type="text" value={specialization} onChange={e => setSpecialization(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  placeholder="e.g. AI/ML, Flutter, Network Security" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow transition disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StaffManager;
