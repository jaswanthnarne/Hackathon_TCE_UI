import { useState, useEffect } from 'react';
import teamService from '../../../services/teamService';
import toast from 'react-hot-toast';

const CATEGORY_LABELS = {
  technical: 'Technical Query',
  hardware: 'Hardware Issue',
  power: 'Power Supply',
  food: 'Food/Beverages',
  network: 'WiFi/Network',
  other: 'Other Support',
};

const HelpDesk = () => {
  const [category, setCategory] = useState('technical');
  const [description, setDescription] = useState('');
  const [activeRequest, setActiveRequest] = useState(null);
  const [pastRequests, setPastRequests] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const { data } = await teamService.getMyHelpRequests();
      const requests = data.data?.requests || [];
      const active = requests.find(r => r.status === 'open' || r.status === 'claimed');
      setActiveRequest(active || null);
      setPastRequests(requests.filter(r => r.status === 'resolved'));
    } catch {}
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return toast.error('Please describe your request');
    setSubmitting(true);
    try {
      const { data } = await teamService.requestHelp({ category, description });
      toast.success(data.message);
      setDescription('');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">🆘 Table Helpdesk</h1>
        <p className="text-dark-500 dark:text-dark-400">Request volunteer or mentor support straight to your seat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Help Form or Active Request */}
        <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-800 p-5 shadow-sm">
          {activeRequest ? (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-dark-900 dark:text-white">Active Help Request</h2>
              <div className="rounded-xl p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {CATEGORY_LABELS[activeRequest.category]}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 animate-pulse">
                    {activeRequest.status}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{activeRequest.description}</p>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>📍 Physical Location: {activeRequest.tableNumber || 'Pending Seating Map'}</p>
                  <p>⏰ Submitted: {new Date(activeRequest.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>

              {activeRequest.status === 'claimed' ? (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                    🧑‍🏫 Support on the way!
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Mentor <strong>{activeRequest.claimedByName}</strong> has claimed your ticket and is coming to your table.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-100 dark:border-dark-800">
                  <p className="text-xs text-slate-500 text-center">
                    Waiting for a volunteer or mentor to claim this ticket. Please stay at your table.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-bold text-dark-900 dark:text-white">New Request</h2>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  What do you need support with?
                </label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500">
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Describe your problem in detail
                </label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Cannot connect frontend container to backend node due to CORS error..." required />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50">
                {submitting ? 'Submitting Request...' : '🚨 Request Help Now'}
              </button>
            </form>
          )}
        </div>

        {/* History */}
        <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-800 p-5 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-dark-900 dark:text-white mb-4">Past Support Requests</h2>
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[350px] pr-1">
            {pastRequests.map(req => (
              <div key={req._id} className="p-3 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-100 dark:border-dark-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-500">{CATEGORY_LABELS[req.category]}</span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Resolved ✓</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{req.description}</p>
                <div className="text-[10px] text-slate-400 mt-2 flex justify-between">
                  <span>Resolved by {req.claimedByName || 'Staff'}</span>
                  <span>{new Date(req.resolvedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {pastRequests.length === 0 && (
              <div className="text-center py-16 text-dark-400 my-auto">
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-sm">No issues reported yet. Smooth sailing!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpDesk;
