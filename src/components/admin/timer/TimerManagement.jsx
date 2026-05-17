import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';
import { Loader } from '../../common/Loader';

const TimerManagement = () => {
  const { config: initialConfig } = useOutletContext();
  const [timerState, setTimerState] = useState({ status: 'idle', duration: 86400, remaining: 86400, lastStartedAt: null });
  const [loading, setLoading] = useState(true);
  const [customAddMins, setCustomAddMins] = useState('15');
  const [customDurationHours, setCustomDurationHours] = useState('24');

  useEffect(() => {
    if (initialConfig?.timer) {
      setTimerState(initialConfig.timer);
      setLoading(false);
    }
  }, [initialConfig?.timer]);

  useEffect(() => {
    let interval;
    if (timerState.status === 'running') {
      interval = setInterval(() => {
        setTimerState(prev => {
          if (prev.remaining <= 1) {
            clearInterval(interval);
            return { ...prev, remaining: 0, status: 'idle' };
          }
          return { ...prev, remaining: prev.remaining - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerState.status]);

  const handleTimerAction = async (action, seconds = 0, duration = 0) => {
    try {
      const res = await adminService.updateTimer({ action, seconds, duration });
      if (res.data.success) {
        setTimerState(res.data.data.timer);
        toast.success(`Timer successfully ${action}ed!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} timer`);
    }
  };

  const formatTimer = (totalSeconds) => {
    if (totalSeconds == null) return '00:00:00';
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <Loader text="Loading timer settings..." />;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Hackathon Sprint Timer</h1>
          </div>
          <p className="text-slate-500 text-sm max-w-xl">
            Control the live coding sprint countdown. Actions taken here instantly synchronize across all student and team dashboards in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <span className={`w-2.5 h-2.5 rounded-full ${timerState.status === 'running' ? 'bg-emerald-500 animate-ping' : timerState.status === 'paused' ? 'bg-amber-500' : 'bg-slate-400'}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Status: {timerState.status}</span>
        </div>
      </div>

      {/* Main Timer Display Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Large Countdown Display */}
          <div className={`p-8 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden ${
            timerState.status === 'running' 
              ? 'bg-gradient-to-b from-emerald-500/10 via-white to-white border-emerald-500 shadow-lg shadow-emerald-500/10' 
              : timerState.status === 'paused'
              ? 'bg-gradient-to-b from-amber-500/10 via-white to-white border-amber-500 shadow-lg shadow-amber-500/10'
              : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest ${
              timerState.status === 'running' ? 'bg-emerald-100 text-emerald-700 animate-pulse' : timerState.status === 'paused' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {timerState.status}
            </span>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Remaining Sprint Time</p>
            <div className="text-6xl sm:text-7xl font-mono font-black text-slate-900 tracking-tight my-4 py-4 px-8 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-inner w-full max-w-md">
              {formatTimer(timerState.remaining)}
            </div>
            <p className="text-xs text-slate-500 max-w-xs mt-2">
              Total configured duration: {Math.floor(timerState.duration / 3600)}h {Math.floor((timerState.duration % 3600) / 60)}m
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 justify-center mt-8 w-full max-w-md">
              {timerState.status !== 'running' ? (
                <button onClick={() => handleTimerAction('start')} className="flex-1 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Start Sprint
                </button>
              ) : (
                <button onClick={() => handleTimerAction('pause')} className="flex-1 py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Pause Sprint
                </button>
              )}
              <button onClick={() => handleTimerAction('reset')} className="py-3 px-6 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Reset Timer
              </button>
            </div>
          </div>

          {/* Time Adjustment Controls */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Adjust Remaining Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add / Subtract Minutes */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">Add / Subtract Minutes</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={customAddMins} 
                    onChange={(e) => setCustomAddMins(e.target.value)}
                    placeholder="Mins" 
                    className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-primary-500"
                  />
                  <button onClick={() => handleTimerAction('add', parseInt(customAddMins || 0) * 60)} className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs shadow transition-colors">
                    +{customAddMins} Mins
                  </button>
                  <button onClick={() => handleTimerAction('add', -parseInt(customAddMins || 0) * 60)} className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow transition-colors">
                    -{customAddMins} Mins
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">Instantly adds or subtracts time from the current countdown.</p>
              </div>

              {/* Set Custom Total Duration */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">Set Total Hackathon Duration</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={customDurationHours} 
                    onChange={(e) => setCustomDurationHours(e.target.value)}
                    placeholder="Hours" 
                    className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-primary-500"
                  />
                  <button onClick={() => handleTimerAction('set_duration', 0, parseFloat(customDurationHours || 0) * 3600)} className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs shadow transition-colors">
                    Set {customDurationHours} Hours
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">Resets the timer to a new total duration (e.g. 12h, 24h, 36h).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info & Instructions Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Timer Guidelines
            </h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                <span><strong className="text-slate-900">Start Sprint:</strong> Begins the countdown. Students will see the active timer and can submit their projects.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <span><strong className="text-slate-900">Pause Sprint:</strong> Freezes the current remaining time. Useful during power outages or organizer announcements.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5 flex-shrink-0" />
                <span><strong className="text-slate-900">Reset Timer:</strong> Stops the timer and restores the remaining time back to the full configured duration.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span><strong className="text-slate-900">Real-Time Sync:</strong> The backend calculates exact elapsed time dynamically, ensuring 100% accuracy across all student browsers.</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white space-y-4 shadow-lg">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Proctor & Submission Lock
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              When the timer hits <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400">00:00:00</code>, the status automatically switches to IDLE. You can use this state in the Submissions review panel to lock late submissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerManagement;
