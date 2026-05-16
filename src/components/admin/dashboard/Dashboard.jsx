import { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import { Loader } from '../../common/Loader';
import { formatTimeAgo } from '../../../utils/formatDate';

const IconSvg = ({ d, className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} /></svg>
);

const StatsCard = ({ title, value, icon, color, trend }) => (
  <div className="card p-6 group hover:border-primary-100 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {trend && (
          <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 w-fit border border-emerald-100">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            <span className="text-[10px] font-bold">{trend}</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>{icon}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: res } = await adminService.getDashboard();
        setData(res.data);
      } catch (err) { console.error('Dashboard fetch error:', err); }
      finally { setLoading(false); }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  const stats = data?.stats || {};

  return (
    <div className="space-y-8 animate-fade-in p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back. Here is what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium shadow-sm">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Teams" value={stats.totalTeams || 0} icon={<IconSvg d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />} color="bg-primary-50 text-primary-600" />
        <StatsCard title="Participants" value={stats.totalParticipants || 0} icon={<IconSvg d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z" />} color="bg-blue-50 text-blue-600" />
        <StatsCard title="Approved" value={stats.approvedTeams || 0} icon={<IconSvg d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />} color="bg-green-50 text-green-600" />
        <StatsCard title="Pending" value={stats.pendingTeams || 0} icon={<IconSvg d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />} color="bg-yellow-50 text-yellow-600" />
        <StatsCard title="Submissions" value={stats.totalSubmissions || 0} icon={<IconSvg d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />} color="bg-purple-50 text-purple-600" />
        <StatsCard title="Questions" value={stats.totalQuestions || 0} icon={<IconSvg d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />} color="bg-indigo-50 text-indigo-600" />
        <StatsCard title="Emails Sent" value={stats.totalEmails || 0} icon={<IconSvg d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />} color="bg-pink-50 text-pink-600" />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 ml-1">Quick Access</h3>
          <div className="grid grid-cols-2 gap-4">
            <a href="/admin/teams" className="card p-5 text-center group hover:bg-primary-50 hover:border-primary-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mx-auto mb-3 text-primary-600 group-hover:scale-110 transition-transform">
                <IconSvg d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Teams</span>
            </a>
            <a href="/admin/problems" className="card p-5 text-center group hover:bg-primary-50 hover:border-primary-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mx-auto mb-3 text-primary-600 group-hover:scale-110 transition-transform">
                <IconSvg d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Questions</span>
            </a>
            <a href="/admin/announcements" className="card p-5 text-center group hover:bg-primary-50 hover:border-primary-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mx-auto mb-3 text-primary-600 group-hover:scale-110 transition-transform">
                <IconSvg d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Announcements</span>
            </a>
            <a href="/admin/results" className="card p-5 text-center group hover:bg-primary-50 hover:border-primary-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mx-auto mb-3 text-primary-600 group-hover:scale-110 transition-transform">
                <IconSvg d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Results</span>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 ml-1">Recent Activity</h3>
          <div className="card overflow-hidden">
            <div className="divide-y divide-slate-100">
              {(data?.recentActions || []).slice(0, 7).map((action, i) => (
                <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group">
                  <div className="w-1.5 h-8 rounded-full bg-primary-100 group-hover:bg-primary-400 transition-colors flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {action.adminId?.name || 'System'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {action.description || action.actionType}
                    </p>
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap bg-slate-100 px-2.5 py-1 rounded-md">
                    {formatTimeAgo(action.createdAt)}
                  </span>
                </div>
              ))}
              {(!data?.recentActions || data.recentActions.length === 0) && (
                <div className="p-12 text-center">
                  <IconSvg d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-sm text-slate-500 font-medium">No recent activity found</p>
                </div>
              )}
            </div>
            {data?.recentActions?.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <a href="/admin/audit" className="text-xs font-semibold uppercase tracking-wider text-primary-600 hover:text-primary-700 transition-colors">View Full Audit Log</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
