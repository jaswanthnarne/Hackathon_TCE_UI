import { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

const ChallengeManager = () => {
  const [challenges, setChallenges] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [rewardName, setRewardName] = useState('Midnight Warrior Badge');
  const [submitting, setSubmitting] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState(null);

  const fetchChallenges = async () => {
    try {
      const { data } = await adminService.getChallenges();
      setChallenges(data.data?.challenges || []);
    } catch {}
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return toast.error('Fill in title and description');
    setSubmitting(true);
    try {
      await adminService.createChallenge({
        title, description,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        reward: { type: 'badge', name: rewardName },
      });
      toast.success('Mini-Challenge launched successfully!');
      setTitle('');
      setDescription('');
      setDeadline('');
      setRewardName('Midnight Warrior Badge');
      setShowCreate(false);
      fetchChallenges();
    } catch (err) {
      toast.error('Failed to create challenge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (challenge) => {
    try {
      await adminService.updateChallenge(challenge._id, { isActive: !challenge.isActive });
      toast.success('Challenge status updated');
      fetchChallenges();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this challenge and all student uploads?')) return;
    try {
      await adminService.deleteChallenge(id);
      toast.success('Challenge deleted');
      fetchChallenges();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleMarkWinner = async (challengeId, teamObjectId) => {
    try {
      await adminService.markChallengeWinner(challengeId, teamObjectId);
      toast.success('Winner crowned and badge dispatched!');
      setSelectedSubmissions(null);
      fetchChallenges();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reward winner');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">🔥 Mini-Quest & Challenges</h1>
          <p className="text-dark-500 dark:text-dark-400">Launch and grade midnight mini-quests dynamically</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow transition">
          🚀 Launch Challenge
        </button>
      </div>

      {/* Challenges list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map(c => (
          <div key={c._id} className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-bold text-dark-900 dark:text-white text-lg leading-snug">{c.title}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                  {c.isActive ? 'Active' : 'Closed'}
                </span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4">{c.description}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-dark-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Reward:</span>
                <span className="font-bold text-amber-600">🏆 {c.reward?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Submissions:</span>
                <span className="font-bold text-primary-600">{c.submissions?.length || 0} teams</span>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => handleToggleActive(c)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-dark-950 font-bold rounded-lg hover:bg-slate-200 transition">
                  {c.isActive ? '⏸ Pause' : '▶ Play'}
                </button>
                <button onClick={() => setSelectedSubmissions(c)} disabled={c.submissions?.length === 0}
                  className="flex-1 py-2 bg-primary-50 text-primary-700 dark:bg-primary-950/20 font-bold rounded-lg hover:bg-primary-100 transition disabled:opacity-50">
                  👁 View Entries
                </button>
                <button onClick={() => handleDelete(c._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submissions Modal */}
      {selectedSubmissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSubmissions(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Student Uploads</h3>
                <p className="text-xs text-slate-400">{selectedSubmissions.title}</p>
              </div>
              <button type="button" onClick={() => setSelectedSubmissions(null)} className="text-slate-400 hover:text-slate-500">✕</button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {selectedSubmissions.submissions.map((sub, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-dark-950 rounded-xl border border-slate-200 dark:border-dark-800 flex justify-between items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-dark-900 dark:text-white truncate">{sub.teamName} <span className="font-mono text-xs text-slate-500">({sub.teamId})</span></p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 break-all bg-white dark:bg-dark-900 p-2 rounded border border-slate-100 dark:border-dark-800">{sub.proof}</p>
                  </div>
                  <div>
                    {sub.isWinner ? (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold rounded-full text-xs">👑 WINNER</span>
                    ) : (
                      <button onClick={() => handleMarkWinner(selectedSubmissions._id, sub.team)}
                        className="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs hover:bg-amber-600 transition">
                        Crown Winner
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <form onSubmit={handleSubmit} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Launch Mini-Quest</h3>
              <button type="button" onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-500">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Challenge Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Best Dark Theme UI Design" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Instructions / Prompt</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none focus:outline-none focus:border-primary-500"
                  placeholder="Tell students exactly what to build and how to upload the proof..." required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Deadline (Optional)</label>
                <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Trophy Badge Name</label>
                <input type="text" value={rewardName} onChange={e => setRewardName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  placeholder="e.g. UI/UX Specialist" required />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow transition disabled:opacity-50">
                🚀 Launch to All Portals
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChallengeManager;
