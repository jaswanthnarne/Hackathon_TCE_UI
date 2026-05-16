import { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import { Loader } from '../../common/Loader';
import EmptyState from '../../common/EmptyState';
import Modal from '../../common/Modal';
import toast from 'react-hot-toast';

const ResultsPanel = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ totalScore: 0, awardTitle: '', isWinner: false });

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getResults();
      setResults(data.data.results || []);
    } catch (err) { toast.error('Failed to load results'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchResults(); }, []);

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const { data } = await adminService.calculateResults();
      toast.success(data.message);
      fetchResults();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to calculate'); }
    finally { setCalculating(false); }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const allPublished = results.every(r => r.isPublished);
      if (allPublished) {
        await adminService.unpublishResults();
        toast.success('Results unpublished');
      } else {
        await adminService.publishResults();
        toast.success('Results published! Teams can now see the leaderboard.');
      }
      fetchResults();
    } catch (err) { toast.error('Failed to update publish status'); }
    finally { setPublishing(false); }
  };

  const openEdit = (r) => {
    setEditModal(r);
    setEditForm({ totalScore: r.totalScore || 0, awardTitle: r.awardTitle || '', isWinner: r.isWinner || false });
  };

  const handleEdit = async () => {
    try {
      await adminService.editResult(editModal.teamId?._id || editModal.teamId, editForm);
      toast.success('Result updated');
      setEditModal(null);
      fetchResults();
    } catch (err) { toast.error('Failed to update'); }
  };

  const allPublished = results.length > 0 && results.every(r => r.isPublished);
  const topScore = results.length > 0 ? Math.max(...results.map(r => r.totalScore || 0)) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Results & Rankings</h1>
          <p className="text-dark-500 dark:text-dark-400">{results.length} teams ranked</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCalculate} disabled={calculating} className="btn-secondary">
            {calculating ? 'Calculating...' : 'Calculate Results'}
          </button>
          <button onClick={handlePublish} disabled={publishing || results.length === 0} className={`${allPublished ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50`}>
            {publishing ? '...' : allPublished ? 'Unpublish' : 'Publish Results'}
          </button>
        </div>
      </div>

      {/* Stats */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center"><p className="text-xs text-dark-400">Total Teams</p><p className="text-2xl font-bold text-dark-900 dark:text-dark-100">{results.length}</p></div>
          <div className="card p-4 text-center"><p className="text-xs text-dark-400">Top Score</p><p className="text-2xl font-bold text-primary-600">{topScore}</p></div>
          <div className="card p-4 text-center"><p className="text-xs text-dark-400">Winners</p><p className="text-2xl font-bold text-yellow-500">{results.filter(r => r.isWinner).length}</p></div>
          <div className="card p-4 text-center"><p className="text-xs text-dark-400">Status</p><p className={`text-lg font-bold ${allPublished ? 'text-green-500' : 'text-yellow-500'}`}>{allPublished ? 'Published' : 'Draft'}</p></div>
        </div>
      )}

      {/* Results Table */}
      {loading ? <Loader text="Loading results..." /> : results.length === 0 ? (
        <EmptyState title="No results yet" message="Click 'Calculate Results' to generate rankings based on quiz + submission scores." action={<button onClick={handleCalculate} className="btn-primary">Calculate Now</button>} />
      ) : (
        <div className="space-y-8">
          
          {/* Admin Podium View */}
          {results.length >= 3 && (
            <div className="card p-8 bg-gradient-to-b from-dark-50 to-white dark:from-dark-800/50 dark:to-dark-900 border-none shadow-lg mb-8">
              <h3 className="text-center font-bold text-dark-400 uppercase tracking-widest mb-10">Top 3 Teams</h3>
              <div className="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-12 pt-4">
                {[results[1], results[0], results[2]].map((r, idx) => {
                  if (!r) return null;
                  const team = r.teamId || {};
                  const isFirst = r.rank === 1;
                  const isSecond = r.rank === 2;
                  const rankColors = { 1: 'text-yellow-400', 2: 'text-gray-400', 3: 'text-amber-500' };
                  return (
                    <div key={r._id} className={`flex flex-col items-center ${isFirst ? 'order-1 md:order-2 z-10' : isSecond ? 'order-2 md:order-1' : 'order-3'}`}>
                      <div className={`text-4xl font-black mb-2 ${rankColors[r.rank]}`}>#{r.rank}</div>
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg mb-3 border-4 ${isFirst ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 border-yellow-200' : isSecond ? 'bg-gradient-to-br from-gray-300 to-gray-500 border-gray-100' : 'bg-gradient-to-br from-amber-500 to-amber-700 border-amber-300'}`}>
                        {team.teamName?.charAt(0) || 'T'}
                      </div>
                      <h4 className="font-bold text-dark-900 dark:text-dark-100 text-center truncate max-w-[120px]">{team.teamName}</h4>
                      <p className="text-primary-600 font-black mb-3">{r.totalScore} pts</p>
                      <div className={`w-28 md:w-36 rounded-t-xl flex items-start justify-center pt-3 shadow-inner ${isFirst ? 'h-32 md:h-40 bg-yellow-500' : isSecond ? 'h-24 md:h-32 bg-gray-400' : 'h-16 md:h-24 bg-amber-600'}`}>
                        <span className="text-3xl font-black text-white/40">{r.rank}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed Table */}
          <div className="card overflow-hidden border border-dark-100 dark:border-dark-800 shadow-md">
            <div className="bg-dark-50 dark:bg-dark-800/80 px-6 py-4 border-b border-dark-100 dark:border-dark-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100">Detailed Rankings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white dark:bg-dark-900 border-b border-dark-100 dark:border-dark-800">
                    <th className="text-left px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-wider w-20">Rank</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-wider">Team Name</th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-wider">Total Score</th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-wider">Award</th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                  {results.map((r) => {
                    const team = r.teamId || {};
                    return (
                      <tr key={r._id} className={`hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors ${r.isWinner ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : ''}`}>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${r.rank === 1 ? 'bg-yellow-100 text-yellow-700' : r.rank === 2 ? 'bg-gray-200 text-gray-700' : r.rank === 3 ? 'bg-amber-100 text-amber-700' : 'bg-dark-100 text-dark-600 dark:bg-dark-800 dark:text-dark-400'}`}>
                            {r.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-dark-900 dark:text-dark-100 text-base">{team.teamName}</p>
                          <p className="text-xs font-mono text-dark-400 mt-0.5">{team.teamId}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xl font-black text-primary-600">{r.totalScore}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {r.isWinner && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-800/30"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>{r.awardTitle || 'Winner'}</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${r.isPublished ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-dark-100 text-dark-500 dark:bg-dark-800'}`}>
                            {r.isPublished ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500"/> Published</> : <><span className="w-1.5 h-1.5 rounded-full bg-dark-400"/> Draft</>}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openEdit(r)} className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors" title="Edit Result">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title={`Edit: ${editModal?.teamId?.teamName || 'Team'}`}>
        {editModal && (
          <div className="space-y-4">
            <div>
              <label className="label">Total Score</label>
              <input type="number" className="input" value={editForm.totalScore} onChange={(e) => setEditForm({ ...editForm, totalScore: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="label">Award Title</label>
              <input type="text" className="input" value={editForm.awardTitle} onChange={(e) => setEditForm({ ...editForm, awardTitle: e.target.value })} placeholder="e.g. 1st Place, Best Innovation" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editForm.isWinner} onChange={(e) => setEditForm({ ...editForm, isWinner: e.target.checked })} className="w-4 h-4 rounded text-primary-600" />
              <span className="text-sm font-medium text-dark-900 dark:text-dark-100">Mark as Winner</span>
            </label>
            <div className="flex justify-end gap-3 pt-3 border-t border-dark-100 dark:border-dark-700">
              <button onClick={() => setEditModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleEdit} className="btn-primary">Save Changes</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResultsPanel;
