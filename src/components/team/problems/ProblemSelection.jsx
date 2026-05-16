import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import teamService from '../../../services/teamService';
import { Loader } from '../../common/Loader';
import EmptyState from '../../common/EmptyState';
import ConfirmDialog from '../../common/ConfirmDialog';
import toast from 'react-hot-toast';
import { exportProblemsToExcel, exportProblemToPDF } from '../../../utils/exportUtils';

const DIFF_COLORS = {
  Easy: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  Medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
  Hard: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
};

const ProblemSelection = () => {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [changesLeft, setChangesLeft] = useState(3);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [confirmSelect, setConfirmSelect] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filterCat, setFilterCat] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  
  const { config } = useOutletContext();
  const isProblemSelectionOpen = config?.isProblemSelectionOpen ?? true;

  const fetchProblems = async () => {
    try {
      const { data } = await teamService.getProblems();
      setProblems(data.data.problems || []);
      setSelectedProblem(data.data.selectedProblem);
      setChangesLeft(data.data.changesLeft ?? 3);
    } catch (err) { toast.error('Failed to load problem statements'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProblems(); }, []);

  const handleSelect = async () => {
    if (!confirmSelect) return;
    setSelecting(true);
    try {
      const { data } = await teamService.selectProblem(confirmSelect._id);
      toast.success(data.message);
      setSelectedProblem(data.data.selectedProblem);
      setChangesLeft(data.data.changesLeft);
      setConfirmSelect(null);
      fetchProblems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to select problem');
    } finally { setSelecting(false); }
  };

  const categories = [...new Set(problems.map(p => p.category))].sort();
  const filtered = problems.filter(p => (!filterCat || p.category === filterCat) && (!filterDiff || p.difficulty === filterDiff));
  const mySelection = problems.find(p => p._id === selectedProblem);

  if (loading) return <Loader text="Loading problem statements..." />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Problem Statements</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Review and select your hackathon challenge. You have <span className="font-bold text-primary-600">{changesLeft}</span> selection changes remaining.</p>
          {!isProblemSelectionOpen && (
            <p className="text-red-500 font-bold mt-2 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded inline-block text-sm">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>Problem selection is currently locked by the organizers.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => exportProblemsToExcel(problems, 'TCE_Hackathon_Challenges.xlsx')} className="btn-secondary text-sm">
            <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Export All (Excel)
          </button>
          <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${changesLeft > 0 ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
            <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>{changesLeft} change{changesLeft !== 1 ? 's' : ''} left
          </div>
        </div>
      </div>

      {/* Current Selection */}
      {mySelection && (
        <div className="card overflow-hidden border-2 border-primary-500/30">
          <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 dark:from-primary-900/20 dark:to-secondary-900/20 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-primary-600 font-semibold mb-0.5">YOUR SELECTED CHALLENGE</p>
                <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100">{mySelection.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[mySelection.difficulty]?.bg} ${DIFF_COLORS[mySelection.difficulty]?.text}`}>{mySelection.difficulty}</span>
                  <span className="text-xs text-dark-400">•</span>
                  <span className="text-xs text-dark-500">{mySelection.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input max-w-[200px]">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterDiff} onChange={(e) => setFilterDiff(e.target.value)} className="input max-w-[200px]">
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <span className="self-center text-sm text-dark-400">{filtered.length} challenge{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Problem Cards */}
      {filtered.length === 0 ? (
        <EmptyState title="No challenges found" message="No problem statements match your filters." />
      ) : (
        <div className="grid gap-4">
          {filtered.map((p) => {
            const isSelected = p._id === selectedProblem;
            const isExpanded = expandedId === p._id;
            const teamCount = p.selectedBy?.length || 0;
            const isFull = p.maxTeams > 0 && teamCount >= p.maxTeams && !isSelected;
            const dc = DIFF_COLORS[p.difficulty] || DIFF_COLORS.Medium;

            return (
              <div key={p._id} className={`card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-primary-900/10 ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${dc.dot}`} />
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dc.bg} ${dc.text}`}>{p.difficulty}</span>
                        <span className="text-xs bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 px-2 py-0.5 rounded-full">{p.category}</span>
                        {isSelected && <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Selected</span>}
                        {isFull && <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-600 px-2 py-0.5 rounded-full">Full</span>}
                      </div>
                      <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-1">{p.title}</h3>
                      <p className="text-sm text-dark-500 dark:text-dark-400">{isExpanded ? p.description : p.description?.substring(0, 150) + (p.description?.length > 150 ? '...' : '')}</p>
                      {p.description?.length > 150 && (
                        <button onClick={() => setExpandedId(isExpanded ? null : p._id)} className="text-primary-600 text-xs font-medium mt-1">{isExpanded ? 'Show less' : 'Read more'}</button>
                      )}
                      {isExpanded && (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {p.expectedOutcome && <div className="p-2 bg-dark-50 dark:bg-dark-800 rounded-lg"><span className="text-xs text-dark-400 block">Expected Outcome</span><p className="text-sm text-dark-700 dark:text-dark-300">{p.expectedOutcome}</p></div>}
                          {p.techStack && <div className="p-2 bg-dark-50 dark:bg-dark-800 rounded-lg"><span className="text-xs text-dark-400 block">Tech Stack</span><p className="text-sm text-dark-700 dark:text-dark-300">{p.techStack}</p></div>}
                          {p.resources && <div className="p-2 bg-dark-50 dark:bg-dark-800 rounded-lg col-span-full"><span className="text-xs text-dark-400 block">Resources</span><p className="text-sm text-dark-700 dark:text-dark-300 whitespace-pre-wrap">{p.resources}</p></div>}
                          {mySelection?._id === p._id ? (
                          <button disabled className="px-5 py-2 rounded-xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold flex items-center gap-2 border border-green-200 dark:border-green-800/30">
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Selected
                          </button>
                        ) : !isProblemSelectionOpen ? (
                          <button disabled className="px-5 py-2 rounded-xl bg-dark-100 text-dark-500 dark:bg-dark-800 font-medium cursor-not-allowed">
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>Locked
                          </button>
                        ) : changesLeft > 0 ? (
                          <button onClick={() => setConfirmSelect(p)} className="px-5 py-2 rounded-xl bg-dark-900 dark:bg-white text-white dark:text-dark-900 font-bold hover:bg-primary-600 dark:hover:bg-primary-500 hover:text-white transition-all shadow-lg hover:shadow-primary-500/25">
                            Select This
                          </button>
                        ) : null}</div>
                      )}
                      <div className="flex items-center gap-3 mt-3 text-xs text-dark-400">
                        <span><svg className="w-3.5 h-3.5 inline mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{teamCount} team{teamCount !== 1 ? 's' : ''} selected</span>
                        {p.maxTeams > 0 && <span>• Max {p.maxTeams} teams</span>}
                        <button onClick={() => exportProblemToPDF(p)} className="ml-auto text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 inline mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Download PDF
                        </button>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Selected</span>
                      ) : (
                        <button onClick={() => setConfirmSelect(p)} disabled={isFull || changesLeft <= 0 || !isProblemSelectionOpen} className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                          {changesLeft <= 0 ? 'No changes left' : isFull ? 'Full' : 'Select This'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmSelect}
        onClose={() => setConfirmSelect(null)}
        onConfirm={handleSelect}
        title="Confirm Selection"
        message={`Select "${confirmSelect?.title}" as your hackathon challenge? You have ${changesLeft} change${changesLeft !== 1 ? 's' : ''} remaining.${changesLeft === 1 ? ' This will be your last change!' : ''}`}
        confirmText={selecting ? 'Selecting...' : 'Confirm Selection'}
        loading={selecting}
      />
    </div>
  );
};

export default ProblemSelection;
