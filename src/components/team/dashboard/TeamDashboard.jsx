import { useState, useEffect } from 'react';
import { useTeamAuth } from '../../../context/TeamAuthContext';
import teamService from '../../../services/teamService';
import { Loader } from '../../common/Loader';

const TeamDashboard = () => {
  const { team } = useTeamAuth();
  const [profile, setProfile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, annRes] = await Promise.all([teamService.getProfile(), teamService.getAnnouncements()]);
        setProfile(profileRes.data.data.team);
        setAnnouncements(annRes.data.data.announcements || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

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
