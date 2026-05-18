import { useState, useEffect } from 'react';
import judgeApi from '../../../services/judgeService';
import toast from 'react-hot-toast';

const Icon = ({ d, className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  </svg>
);

const ICONS = {
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  location: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
  document: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  check: 'M5 13l4 4L19 7',
  edit: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
  submit: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
};

const CRITERIA = [
  { key: 'innovation', label: 'Innovation', color: 'from-blue-500 to-cyan-500' },
  { key: 'technicalComplexity', label: 'Technical Complexity', color: 'from-purple-500 to-violet-500' },
  { key: 'uiux', label: 'UI / UX Design', color: 'from-pink-500 to-rose-500' },
  { key: 'businessViability', label: 'Business Viability', color: 'from-amber-500 to-orange-500' },
];

const ScoringPanel = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [scores, setScores] = useState({ innovation: 5, technicalComplexity: 5, uiux: 5, businessViability: 5 });
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await judgeApi.getAssignedTeams();
        setTeams(data.data?.teams || []);
      } catch (err) { toast.error('Failed to load teams'); }
    };
    fetch();
  }, []);

  const openScoring = (team) => {
    setSelectedTeam(team);
    if (team.myScore) {
      setScores(team.myScore.scores);
      setFeedback(team.myScore.feedback || '');
    } else {
      setScores({ innovation: 5, technicalComplexity: 5, uiux: 5, businessViability: 5 });
      setFeedback('');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await judgeApi.submitScore({ teamId: selectedTeam._id, scores, feedback });
      toast.success(`Score submitted for ${selectedTeam.teamName}`);
      // Refresh
      const { data } = await judgeApi.getAssignedTeams();
      setTeams(data.data?.teams || []);
      setSelectedTeam(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit score');
    }
    setSubmitting(false);
  };

  const computeTotal = () => {
    return ((scores.innovation * 0.3) + (scores.technicalComplexity * 0.25) + (scores.uiux * 0.25) + (scores.businessViability * 0.2)).toFixed(2);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Icon d={ICONS.clipboard} className="w-8 h-8 text-slate-900 dark:text-white" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Score Teams</h1>
      </div>

      {/* Team List */}
      <div className="space-y-3">
        {teams.map(team => (
          <div key={team._id} className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 shadow-sm transition hover:shadow-md cursor-pointer ${team.myScore ? 'border-emerald-200 dark:border-emerald-800' : 'border-slate-200 dark:border-slate-800'}`}
            onClick={() => openScoring(team)}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{team.teamName}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  {team.teamId}
                  {team.tableNumber && (
                    <>
                      <span className="mx-1">•</span>
                      <Icon d={ICONS.location} className="w-3 h-3 text-slate-400" />
                      {team.zone ? team.zone + ', ' : ''}{team.tableNumber}
                    </>
                  )}
                </p>
                {team.selectedProblem && (
                  <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                    <Icon d={ICONS.document} className="w-3 h-3" />
                    {team.selectedProblem.title}
                  </p>
                )}
              </div>
              <div className="text-right">
                {team.myScore ? (
                  <div>
                    <span className="text-2xl font-black text-emerald-600">{team.myScore.totalWeighted}</span>
                    <p className="text-[10px] text-emerald-500 font-bold">SCORED ✓</p>
                  </div>
                ) : (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">PENDING</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {teams.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Icon d={ICONS.clipboard} className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No teams assigned yet. Contact the admin.</p>
          </div>
        )}
      </div>

      {/* Scoring Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setSelectedTeam(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-800 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedTeam.teamName}</h3>
                  <p className="text-xs text-slate-500">{selectedTeam.teamId}</p>
                </div>
                <button onClick={() => setSelectedTeam(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {CRITERIA.map(c => (
                <div key={c.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{c.label}</label>
                    <span className={`text-lg font-black bg-gradient-to-r ${c.color} bg-clip-text text-transparent`}>{scores[c.key]}/10</span>
                  </div>
                  <input type="range" min="0" max="10" step="1" value={scores[c.key]}
                    onChange={e => setScores({ ...scores, [c.key]: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500" />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0</span><span>5</span><span>10</span>
                  </div>
                </div>
              ))}

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Weighted Total</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">{computeTotal()}</p>
                <p className="text-[10px] text-slate-400 mt-1">Innovation(30%) + Tech(25%) + UI/UX(25%) + Business(20%)</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Feedback (optional)</label>
                <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none focus:outline-none focus:border-amber-500"
                  placeholder="Any comments for this team..." />
              </div>

              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50">
                <div className="flex items-center justify-center gap-2">
                  {submitting ? (
                    'Submitting...'
                  ) : selectedTeam.myScore ? (
                    <><Icon d={ICONS.edit} className="w-5 h-5" /> Update Score</>
                  ) : (
                    <><Icon d={ICONS.submit} className="w-5 h-5" /> Submit Score</>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoringPanel;
