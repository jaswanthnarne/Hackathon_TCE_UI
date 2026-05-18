import { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = { breakfast: '🌅', lunch: '🍛', dinner: '🍽️', snack: '🍿', beverage: '☕', other: '🎫' };

const MealPassManager = () => {
  const [passes, setPasses] = useState([]);
  const [stats, setStats] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('lunch');
  const [activeFrom, setActiveFrom] = useState('');
  const [activeUntil, setActiveUntil] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [passRes, statRes] = await Promise.all([
        adminService.getMealPasses(),
        adminService.getMealPassStats(),
      ]);
      setPasses(passRes.data.data?.passes || []);
      setStats(statRes.data.data?.stats || []);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !activeFrom || !activeUntil) return toast.error('Fill in all required fields');
    if (new Date(activeUntil) <= new Date(activeFrom)) return toast.error('End time must be after start time');
    setSubmitting(true);
    try {
      await adminService.createMealPass({
        name, description, category,
        activeFrom: new Date(activeFrom).toISOString(),
        activeUntil: new Date(activeUntil).toISOString(),
      });
      toast.success('Meal pass created successfully!');
      setName(''); setDescription(''); setActiveFrom(''); setActiveUntil('');
      setShowCreate(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create pass');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pass and all associated redemptions?')) return;
    try {
      await adminService.deleteMealPass(id);
      toast.success('Meal pass deleted');
      fetchData();
    } catch { toast.error('Failed to delete pass'); }
  };

  const isActive = (pass) => {
    const now = new Date();
    return pass.isActive && new Date(pass.activeFrom) <= now && new Date(pass.activeUntil) >= now;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">🍽️ Meal Pass Manager</h1>
          <p className="text-dark-500 dark:text-dark-400">Configure time-windowed digital food & beverage passes</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition active:scale-95 self-start">
          ➕ New Pass
        </button>
      </div>

      {/* Live Stats Cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => {
            const pct = s.totalTeams > 0 ? Math.round((s.redeemed / s.totalTeams) * 100) : 0;
            return (
              <div key={s.passId} className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-800 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{CATEGORY_ICONS[s.category] || '🎫'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${isActive(s) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {isActive(s) ? 'Live' : 'Inactive'}
                  </span>
                </div>
                <h3 className="font-bold text-dark-900 dark:text-white truncate">{s.name}</h3>
                <p className="text-[10px] text-slate-400 capitalize mt-0.5">{s.category}</p>
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">{s.redeemed} / {s.totalTeams} redeemed</span>
                    <span className="font-bold text-primary-600">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-dark-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Passes Table */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-dark-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">All Meal Passes ({passes.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-xs font-bold text-slate-500 uppercase">
                <th className="p-4">Pass Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Active Period</th>
                <th className="p-4">Redeemed</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-sm">
              {passes.map(pass => (
                <tr key={pass._id} className="hover:bg-slate-50 dark:hover:bg-dark-950/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{CATEGORY_ICONS[pass.category] || '🎫'}</span>
                      <div>
                        <p className="font-bold text-dark-900 dark:text-white">{pass.name}</p>
                        {pass.description && <p className="text-xs text-slate-500 truncate max-w-[200px]">{pass.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 capitalize text-slate-600 dark:text-slate-400">{pass.category}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isActive(pass) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {isActive(pass) ? '🟢 Active' : '⚪ Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    <p>{new Date(pass.activeFrom).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p>→ {new Date(pass.activeUntil).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="p-4 font-bold text-primary-600">{pass.redemptionCount || 0}</td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(pass._id)} className="text-red-500 hover:text-red-700 font-semibold text-xs hover:bg-red-50 px-3 py-1.5 rounded-lg transition">
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
              {passes.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400">
                    <p className="text-3xl mb-2">🍽️</p>
                    <p className="font-medium">No passes configured yet</p>
                    <p className="text-xs mt-1">Click "New Pass" to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <form onSubmit={handleSubmit} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center bg-gradient-to-r from-primary-500/10 to-transparent">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">🍽️ Create Meal Pass</h3>
              <button type="button" onClick={() => setShowCreate(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pass Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. Day 1 Lunch" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. Traditional Lunch Buffet at Main Hall" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {['breakfast', 'lunch', 'dinner', 'snack', 'beverage', 'other'].map(cat => (
                    <button key={cat} type="button" onClick={() => setCategory(cat)}
                      className={`p-2 rounded-xl text-center text-xs font-bold capitalize transition border ${category === cat ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}>
                      <span className="text-lg block mb-0.5">{CATEGORY_ICONS[cat]}</span>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">From *</label>
                  <input type="datetime-local" value={activeFrom} onChange={e => setActiveFrom(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Until *</label>
                  <input type="datetime-local" value={activeUntil} onChange={e => setActiveUntil(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required />
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 active:scale-[0.98]">
                {submitting ? '⏳ Creating...' : '🍽️ Create Pass'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MealPassManager;
