import { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import { Loader } from '../../common/Loader';
import EmptyState from '../../common/EmptyState';
import Modal from '../../common/Modal';
import toast from 'react-hot-toast';

const DEFAULT_CRITERIA = [
  { name: 'Innovation & Creativity', score: 0, maxScore: 10, comment: '' },
  { name: 'Technical Complexity', score: 0, maxScore: 10, comment: '' },
  { name: 'Code Quality', score: 0, maxScore: 10, comment: '' },
  { name: 'UI/UX Design', score: 0, maxScore: 10, comment: '' },
  { name: 'Presentation', score: 0, maxScore: 10, comment: '' },
  { name: 'Practical Impact', score: 0, maxScore: 10, comment: '' },
  { name: 'Completeness', score: 0, maxScore: 10, comment: '' },
  { name: 'Documentation', score: 0, maxScore: 10, comment: '' },
  { name: 'Team Collaboration', score: 0, maxScore: 10, comment: '' },
  { name: 'Overall Impression', score: 0, maxScore: 10, comment: '' },
];

const SubmissionsReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [evaluating, setEvaluating] = useState(null);
  const [evalForm, setEvalForm] = useState({ criteria: [...DEFAULT_CRITERIA], feedback: '' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getSubmissions();
      setSubmissions(data.data.submissions || []);
    } catch (err) { toast.error('Failed to load submissions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const totalScore = evalForm.criteria.reduce((acc, c) => acc + (c.score || 0), 0);
  const maxScore = evalForm.criteria.reduce((acc, c) => acc + c.maxScore, 0);

  const startEval = (sub) => {
    setEvaluating(sub);
    if (sub.evaluation?.criteria?.length) {
      setEvalForm({ criteria: sub.evaluation.criteria, feedback: sub.evaluation.feedback || '' });
    } else {
      setEvalForm({ criteria: DEFAULT_CRITERIA.map(c => ({ ...c })), feedback: '' });
    }
  };

  const handleSaveEval = async () => {
    setSaving(true);
    try {
      await adminService.evaluateSubmission(evaluating._id, { score: totalScore, maxScore, feedback: evalForm.feedback, criteria: evalForm.criteria });
      toast.success('Evaluation saved!');
      setEvaluating(null);
      fetchSubmissions();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const filtered = filter === 'all' ? submissions : submissions.filter(s => (s.evaluation?.status || 'pending') === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Submissions</h1><p className="text-dark-500">{submissions.length} total submissions</p></div>
        <div className="flex gap-2">
          {['all', 'pending', 'evaluated'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-primary-500 text-white' : 'bg-dark-100 dark:bg-dark-800 text-dark-500 hover:bg-dark-200 dark:hover:bg-dark-700'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${submissions.filter(s => (s.evaluation?.status || 'pending') === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? <EmptyState title="No submissions" message="No project submissions yet." /> : (
        <div className="grid gap-4">
          {filtered.map(sub => (
            <div key={sub._id} className="card hover:shadow-lg transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded">{sub.team?.teamId}</span>
                      <h3 className="font-semibold text-dark-900 dark:text-dark-100 truncate">{sub.projectTitle}</h3>
                      {sub.isLate && <span className="badge-warning text-xs">Late</span>}
                    </div>
                    <p className="text-sm text-dark-500 mb-2">{sub.team?.teamName}</p>
                    {sub.projectDescription && <p className="text-sm text-dark-400 line-clamp-2">{sub.projectDescription}</p>}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {sub.githubUrl && <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg>GitHub</a>}
                      {sub.videoUrl && <a href={sub.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Video</a>}
                      {sub.liveDemoUrl && <a href={sub.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>Demo</a>}
                      {sub.fileUrl && <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>Files</a>}
                      <span className="text-xs text-dark-400 flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{new Date(sub.submittedAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {sub.evaluation?.score !== null && sub.evaluation?.score !== undefined ? (
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary-600">{sub.evaluation.score}<span className="text-sm text-dark-400">/{sub.evaluation.maxScore}</span></p>
                        <span className="badge-success text-xs">Evaluated</span>
                      </div>
                    ) : (
                      <span className="badge-warning text-xs">Pending</span>
                    )}
                    <div className="flex gap-1">
                      <button onClick={() => setSelected(sub)} className="btn-ghost text-xs">View</button>
                      <button onClick={() => startEval(sub)} className="btn-primary text-xs">{sub.evaluation?.score != null ? 'Re-evaluate' : 'Evaluate'}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.projectTitle} size="xl">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="label">Team</span><p className="font-semibold">{selected.team?.teamName} ({selected.team?.teamId})</p></div>
              <div><span className="label">Submitted</span><p>{new Date(selected.submittedAt).toLocaleString('en-IN')}</p></div>
            </div>
            {selected.projectDescription && <div><span className="label">Description</span><p className="text-sm whitespace-pre-wrap">{selected.projectDescription}</p></div>}
            <div className="grid grid-cols-2 gap-3">
              {selected.githubUrl && <a href={selected.githubUrl} target="_blank" className="p-3 bg-dark-50 dark:bg-dark-900 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800"><span className="text-xs text-dark-400">GitHub</span><p className="text-sm text-primary-600 truncate">{selected.githubUrl}</p></a>}
              {selected.videoUrl && <a href={selected.videoUrl} target="_blank" className="p-3 bg-dark-50 dark:bg-dark-900 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800"><span className="text-xs text-dark-400">Video</span><p className="text-sm text-primary-600 truncate">{selected.videoUrl}</p></a>}
              {selected.liveDemoUrl && <a href={selected.liveDemoUrl} target="_blank" className="p-3 bg-dark-50 dark:bg-dark-900 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800"><span className="text-xs text-dark-400">Live Demo</span><p className="text-sm text-primary-600 truncate">{selected.liveDemoUrl}</p></a>}
              {selected.fileUrl && <a href={selected.fileUrl} target="_blank" className="p-3 bg-dark-50 dark:bg-dark-900 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800"><span className="text-xs text-dark-400">Files</span><p className="text-sm text-primary-600 truncate">{selected.fileUrl}</p></a>}
            </div>
            {selected.additionalNotes && <div><span className="label">Notes</span><p className="text-sm whitespace-pre-wrap">{selected.additionalNotes}</p></div>}
          </div>
        )}
      </Modal>

      {/* Evaluation Modal */}
      <Modal isOpen={!!evaluating} onClose={() => setEvaluating(null)} title={`Evaluate: ${evaluating?.projectTitle}`} size="xl">
        {evaluating && (
          <div className="space-y-4">
            <div className="bg-dark-50 dark:bg-dark-900 rounded-xl p-4 flex items-center justify-between">
              <div><p className="text-sm text-dark-500">{evaluating.team?.teamName} ({evaluating.team?.teamId})</p></div>
              <div className="text-right"><p className="text-3xl font-black text-primary-600">{totalScore}<span className="text-base text-dark-400">/{maxScore}</span></p></div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {evalForm.criteria.map((c, i) => (
                <div key={i} className="p-3 bg-dark-50 dark:bg-dark-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-dark-900 dark:text-dark-100">{c.name}</span>
                    <div className="flex items-center gap-1">
                      <input type="number" min="0" max={c.maxScore} className="w-16 px-2 py-1 text-center text-sm border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800" value={c.score} onChange={(e) => { const newCriteria = [...evalForm.criteria]; newCriteria[i].score = Math.min(parseInt(e.target.value) || 0, c.maxScore); setEvalForm({ ...evalForm, criteria: newCriteria }); }} />
                      <span className="text-xs text-dark-400">/ {c.maxScore}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(c.score / c.maxScore) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="label">Feedback / Comments</label>
              <textarea className="input min-h-[80px]" value={evalForm.feedback} onChange={(e) => setEvalForm({ ...evalForm, feedback: e.target.value })} placeholder="Overall feedback for the team..." />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-dark-100 dark:border-dark-700">
              <button onClick={() => setEvaluating(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveEval} disabled={saving} className="btn-primary flex items-center gap-2">{saving ? 'Saving...' : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Save Evaluation</>}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubmissionsReview;
