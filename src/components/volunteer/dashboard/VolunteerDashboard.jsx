import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import volunteerApi from '../../../services/volunteerService';

const Icon = ({ d, className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  </svg>
);

const VolunteerDashboard = () => {
  const { staff } = useOutletContext();
  const [stats, setStats] = useState({ openRequests: 0, myClaimed: 0, activePasses: 0 });

  useEffect(() => {
    const fetch = async () => {
      try {
        const [openRes, claimedRes, passRes] = await Promise.allSettled([
          volunteerApi.getHelpRequests('open'),
          volunteerApi.getMyClaimed(),
          volunteerApi.getMealPasses(),
        ]);

        if (openRes.status === 'rejected') console.error('Failed to fetch open requests:', openRes.reason);
        if (claimedRes.status === 'rejected') console.error('Failed to fetch claimed requests:', claimedRes.reason);
        if (passRes.status === 'rejected') console.error('Failed to fetch meal passes:', passRes.reason);

        setStats({
          openRequests: openRes.status === 'fulfilled' ? (openRes.value.data.data?.requests?.length || 0) : 0,
          myClaimed: claimedRes.status === 'fulfilled' ? (claimedRes.value.data.data?.requests?.length || 0) : 0,
          activePasses: passRes.status === 'fulfilled' ? (passRes.value.data.data?.passes?.filter(p => {
            const now = new Date();
            return p.isActive && new Date(p.activeFrom) <= now && new Date(p.activeUntil) >= now;
          }).length || 0) : 0,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { label: 'Open Help Requests', value: stats.openRequests, color: 'from-red-500 to-rose-600', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { label: 'My Claimed Tasks', value: stats.myClaimed, color: 'from-amber-500 to-yellow-600', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Active Meal Passes', value: stats.activePasses, color: 'from-emerald-500 to-green-600', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg flex items-center gap-4">
        <Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" className="w-12 h-12 opacity-80" />
        <div>
          <h1 className="text-2xl font-bold">Welcome, {staff?.name}!</h1>
          <p className="text-emerald-100 mt-1">Role: <span className="font-semibold capitalize">{staff?.role}</span> • ID: <span className="font-mono">{staff?.staffId}</span></p>
          {staff?.dutyArea && <p className="text-emerald-200 text-sm mt-1">Duty Area: {staff.dutyArea}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{c.label}</p>
                <p className="text-3xl font-black mt-1">{c.value}</p>
              </div>
              <Icon d={c.icon} className="w-10 h-10 opacity-80" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <a href="/volunteer/scanner" className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30 hover:shadow-md transition">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg text-emerald-600 dark:text-emerald-300">
              <Icon d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm12 4a3 3 0 11-6 0 3 3 0 016 0z" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Scan QR Code</p>
              <p className="text-xs text-slate-500">Redeem meal passes</p>
            </div>
          </a>
          <a href="/volunteer/help-queue" className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 hover:shadow-md transition">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
              <Icon d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Help Queue</p>
              <p className="text-xs text-slate-500">View open requests</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
