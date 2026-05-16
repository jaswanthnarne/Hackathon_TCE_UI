import { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTeamAuth } from '../../../context/TeamAuthContext';
import teamService from '../../../services/teamService';

const teamNavItems = [
  { path: '/team/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/team/profile', label: 'Team Profile', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { path: '/team/problems', label: 'Problem Statements', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { path: '/team/submission', label: 'Submit Project', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  { path: '/team/results', label: 'Results', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { path: '/team/announcements', label: 'Announcements', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
  { path: '/team/certificate', label: 'Certificate', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { path: '/team/change-password', label: 'Change Password', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
];

const TeamLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [unseenCount, setUnseenCount] = useState(0);
  const [config, setConfig] = useState(null);
  const { team, logout } = useTeamAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    teamService.getHackathonInfo().then(res => setConfig(res.data.data.config)).catch(() => {});
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', next);
    document.documentElement.classList.toggle('dark', next);
  };

  const handleLogout = () => { logout(); navigate('/team/login'); };

  // Check for unseen announcements
  const checkUnseen = useCallback(async () => {
    try {
      const { data } = await teamService.getAnnouncements();
      const announcements = data.data.announcements || [];
      if (announcements.length === 0) { setUnseenCount(0); return; }

      const lastSeen = localStorage.getItem('lastSeenAnnouncementTime');
      if (!lastSeen) {
        setUnseenCount(announcements.length);
      } else {
        const unseen = announcements.filter(a => new Date(a.createdAt) > new Date(lastSeen));
        setUnseenCount(unseen.length);
      }
    } catch (err) { /* silent */ }
  }, []);

  useEffect(() => {
    checkUnseen();
    // Poll every 30 seconds
    const interval = setInterval(checkUnseen, 30000);
    return () => clearInterval(interval);
  }, [checkUnseen]);

  // Mark as seen when visiting announcements page
  useEffect(() => {
    if (location.pathname === '/team/announcements') {
      localStorage.setItem('lastSeenAnnouncementTime', new Date().toISOString());
      setUnseenCount(0);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-dark-50 dark:bg-dark-950">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-white dark:bg-dark-900 border-r border-dark-100 dark:border-dark-800 flex flex-col fixed h-full z-30`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-100 dark:border-dark-800">
          {sidebarOpen && (
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {config?.logoUrl && <img src={config.logoUrl} alt="Logo" className="w-6 h-6 object-contain rounded" />}
              <div>
                <h1 className="text-lg font-bold gradient-text truncate" title={config?.name || 'TCE Hackathon'}>{config?.name || 'TCE Hackathon'}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="badge-info font-mono text-xs">{team?.teamId}</span>
                </div>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg flex-shrink-0">
            <svg className="w-5 h-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'} /></svg>
          </button>
        </div>

        {/* Team Info Card */}
        {sidebarOpen && (
          <div className="mx-3 mt-3 p-3 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border border-primary-100 dark:border-primary-800/30">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {team?.teamName?.charAt(0) || 'T'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-dark-900 dark:text-dark-100 truncate">{team?.teamName}</p>
                <p className="text-xs text-dark-500 dark:text-dark-400 capitalize">{team?.status || 'active'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-1">
          {teamNavItems.map((item) => {
            const isAnnouncements = item.path === '/team/announcements';
            return (
              <NavLink key={item.path} to={item.path}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-dark-200'}`}>
                <div className="relative flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                  {/* Notification dot on icon when sidebar collapsed */}
                  {isAnnouncements && unseenCount > 0 && !sidebarOpen && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-dark-900 animate-pulse" />
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <span className="truncate flex-1">{item.label}</span>
                    {/* Badge with count when sidebar open */}
                    {isAnnouncements && unseenCount > 0 && (
                      <span className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1.5 animate-pulse">
                        {unseenCount > 9 ? '9+' : unseenCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-dark-100 dark:border-dark-800 space-y-1">
          <button onClick={toggleDark} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors">
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
            {sidebarOpen && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-dark-100 dark:border-dark-800 px-6 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-dark-500 dark:text-dark-400">
              Welcome, <span className="font-semibold text-dark-900 dark:text-dark-100">{team?.teamLead?.name || team?.teamName || 'Team'}</span>
            </h2>
            <div className="flex items-center gap-3">
              <span className="badge-success text-xs">Online</span>
            </div>
          </div>
        </header>
        <div className="p-6">
          <Outlet context={{ config }} />
        </div>
      </main>
    </div>
  );
};

export default TeamLayout;
