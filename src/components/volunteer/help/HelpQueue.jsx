import { useState, useEffect } from 'react';
import volunteerApi from '../../../services/volunteerService';
import toast from 'react-hot-toast';

const Icon = ({ d, className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  </svg>
);

const ICONS = {
  sos: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
  sparkle: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', // Trophy as a fallback for ✨
  location: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
};

const CATEGORY_COLORS = {
  technical: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  hardware: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  power: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  food: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  network: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  other: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

const HelpQueue = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const params = filter === 'all' ? undefined : filter;
      const { data } = await volunteerApi.getHelpRequests(params);
      setRequests(data.data?.requests || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, [filter]);

  const handleClaim = async (id) => {
    try {
      const { data } = await volunteerApi.claimRequest(id);
      toast.success(data.message);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim');
    }
  };

  const handleResolve = async (id) => {
    try {
      await volunteerApi.resolveRequest(id, 'Resolved');
      toast.success('Request resolved');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve');
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const filtered = requests;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Icon d={ICONS.sos} className="w-8 h-8 text-blue-600" /> Help Queue
        </h1>
        <span className="text-sm text-slate-500">{filtered.length} request(s)</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'open', 'claimed', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${filter === f ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Icon d={ICONS.sparkle} className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No {filter === 'all' ? '' : filter} requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <div key={req._id} className={`bg-white dark:bg-slate-900 rounded-2xl border-l-4 p-4 shadow-sm transition hover:shadow-md ${
              req.status === 'open' ? 'border-red-500' : req.status === 'claimed' ? 'border-amber-500' : 'border-emerald-500'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">{req.teamName}</span>
                    <span className="font-mono text-xs text-slate-500">{req.teamId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${CATEGORY_COLORS[req.category] || CATEGORY_COLORS.other}`}>
                      {req.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{req.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {req.tableNumber && (
                      <span className="flex items-center gap-1">
                        <Icon d={ICONS.location} className="w-3 h-3" /> {req.tableNumber}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Icon d={ICONS.clock} className="w-3 h-3" /> {timeAgo(req.createdAt)}
                    </span>
                    {req.claimedByName && (
                      <span className="flex items-center gap-1">
                        <Icon d={ICONS.user} className="w-3 h-3" /> {req.claimedByName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {req.status === 'open' && (
                    <button onClick={() => handleClaim(req._id)}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition">
                      Claim
                    </button>
                  )}
                  {req.status === 'claimed' && (
                    <button onClick={() => handleResolve(req._id)}
                      className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition">
                      Resolve
                    </button>
                  )}
                  <span className={`text-center px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    req.status === 'open' ? 'bg-red-100 text-red-700' : req.status === 'claimed' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>{req.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HelpQueue;
