import { useOutletContext } from 'react-router-dom';
import { useTeamAuth } from '../../../context/TeamAuthContext';

const TeamDashboard = () => {
  const { team } = useTeamAuth();
  const { profile, announcements, timerState } = useOutletContext();


  const formatTimer = (totalSeconds) => {
    if (totalSeconds == null) return '00:00:00';
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };



  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="card bg-gradient-to-r from-primary-500 to-secondary-600 p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {profile?.teamName}!</h1>
        <p className="text-white/80 mt-1">Team ID: <span className="font-mono font-bold">{profile?.teamId}</span></p>
        <div className="flex gap-4 mt-4 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">{profile?.members?.length || 0} Members</span>
          <span className="bg-white/20 px-3 py-1 rounded-full capitalize">{profile?.status}</span>
        </div>
      </div>

      {/* Live Sprint Timer */}
      {timerState && (
        <div className={`card p-6 border-l-4 ${timerState.status === 'running' ? 'border-emerald-500 bg-gradient-to-r from-emerald-500/10 to-transparent dark:from-emerald-500/5' : timerState.status === 'paused' ? 'border-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent dark:from-amber-500/5' : 'border-slate-500 bg-slate-50 dark:bg-dark-900'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${timerState.status === 'running' ? 'bg-emerald-500 animate-ping' : timerState.status === 'paused' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-dark-400">Hackathon Sprint Timer</h3>
              </div>
              <p className="text-xs text-slate-400 dark:text-dark-500 mt-0.5">
                {timerState.status === 'running' ? 'Coding phase is active. Keep building!' : timerState.status === 'paused' ? 'Hackathon timer is currently paused by organizers.' : 'Hackathon timer is idle or has ended.'}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-dark-900 px-6 py-3 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
              <span className="text-3xl sm:text-4xl font-mono font-black text-slate-900 dark:text-white tracking-wider">
                {formatTimer(timerState.remaining)}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide ${timerState.status === 'running' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 animate-pulse' : timerState.status === 'paused' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-200 text-slate-700 dark:bg-dark-800 dark:text-dark-300'}`}>
                {timerState.status}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4">Team Members</h3>
          <div className="space-y-3">
            {profile?.members?.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-900 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold">{m.name?.charAt(0)}</div>
                <div className="flex-1">
                  <p className="font-medium text-dark-900 dark:text-dark-100">{m.name} {m.isLead && <span className="badge-info ml-2">Lead</span>}</p>
                  <p className="text-xs text-dark-400">{m.email} • {m.college}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4">Announcements</h3>
          {announcements.length === 0 ? (
            <p className="text-dark-400 text-sm text-center py-8">No announcements yet</p>
          ) : (
            <div className="space-y-3">
              {announcements.slice(0, 5).map((a) => (
                <div key={a._id} className={`p-3 rounded-lg border-l-4 ${a.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : a.isPinned ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'}`}>
                  <p className="font-medium text-sm text-dark-900 dark:text-dark-100">{a.title}</p>
                  <p className="text-xs text-dark-500 mt-1">{a.message?.substring(0, 100)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
