import { useState, useEffect } from 'react';
import teamService from '../../../services/teamService';
import toast from 'react-hot-toast';

const ChallengeBoard = () => {
  const [challenges, setChallenges] = useState([]);
  const [badges, setBadges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [proof, setProof] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [chalRes, badgeRes] = await Promise.all([
        teamService.getActiveChallenges(),
        teamService.getMyBadges(),
      ]);
      setChallenges(chalRes.data.data?.challenges || []);
      setBadges(badgeRes.data.data?.badges || []);
    } catch {}
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!proof.trim()) return toast.error('Please provide a submission link or text');
    setSubmitting(true);
    try {
      await teamService.submitChallengeProof({ challengeId: selectedChallenge._id, proof });
      toast.success('Challenge submission sent!');
      setProof('');
      setSelectedChallenge(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit proof');
    } finally {
      setSubmitting(false);
    }
  };

  const getTimeRemaining = (deadline) => {
    if (!deadline) return 'No Time Limit';
    const total = Date.parse(deadline) - Date.parse(new Date());
    if (total <= 0) return 'Expired';
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    return `${hours > 0 ? hours + 'h ' : ''}${minutes}m remaining`;
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Welcome & Badges */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">🔥 Midnight Challenges</h1>
          <p className="text-dark-500 dark:text-dark-400">Complete mini-quests to earn prestigious digital badges and exclusive swag</p>
        </div>

        {/* Badges Cabinet */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm min-w-[250px]">
          <span className="text-3xl">🏅</span>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase">Trophy Case</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {badges.map((b, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded text-xs font-semibold text-amber-700">
                  🛡️ {b.name}
                </span>
              ))}
              {badges.length === 0 && <span className="text-xs text-slate-400 italic">No badges earned yet</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map(c => {
          const timeLeft = getTimeRemaining(c.deadline);
          const isExpired = timeLeft === 'Expired';

          return (
            <div key={c._id} className={`bg-white dark:bg-dark-900 border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition hover:shadow-md ${
              c.hasSubmitted ? 'border-emerald-100 dark:border-emerald-800/30' : 'border-slate-200 dark:border-dark-800'
            }`}>
              <div>
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="font-bold text-dark-900 dark:text-white text-lg leading-tight">{c.title}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                    isExpired ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700 animate-pulse'
                  }`}>{timeLeft}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 whitespace-pre-wrap">{c.description}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-dark-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Reward:</span>
                  <span className="font-bold text-amber-600">🏆 {c.reward?.name} ({c.reward?.type})</span>
                </div>

                {c.hasSubmitted ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-xl p-3 text-center">
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center justify-center gap-1">
                      ✓ Submission Received
                    </p>
                    {c.mySubmission?.isWinner && (
                      <p className="text-[10px] text-amber-600 font-black tracking-wider uppercase mt-1 animate-bounce">
                        👑 Winner! Badge Awarded
                      </p>
                    )}
                  </div>
                ) : (
                  <button onClick={() => setSelectedChallenge(c)} disabled={isExpired}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl transition disabled:opacity-50">
                    {isExpired ? 'Submission Closed' : '🚀 Submit Entry'}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {challenges.length === 0 && (
          <div className="col-span-full text-center py-20 text-dark-400 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl">
            <p className="text-5xl mb-4">🤫</p>
            <h3 className="font-bold text-dark-900 dark:text-white">All Quiet On The Western Front</h3>
            <p className="text-sm text-slate-500 mt-1">Surprise mini-challenges are released dynamically by the admin desk</p>
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedChallenge(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <form onSubmit={handleSubmitProof} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Submit Proof</h3>
                <p className="text-xs text-slate-400">{selectedChallenge.title}</p>
              </div>
              <button type="button" onClick={() => setSelectedChallenge(null)} className="text-slate-400 hover:text-slate-500">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Provide Link or Text Proof
                </label>
                <textarea value={proof} onChange={e => setProof(e.target.value)} rows={4}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none focus:outline-none focus:border-dark-500"
                  placeholder="e.g. GitHub Repository link, Figma presentation link, or a text explanation of your solution..." required />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow transition disabled:opacity-50">
                {submitting ? 'Sending...' : '🚀 Submit Entry'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChallengeBoard;
