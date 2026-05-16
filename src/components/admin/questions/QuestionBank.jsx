import { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import { Loader } from '../../common/Loader';
import Modal from '../../common/Modal';
import EmptyState from '../../common/EmptyState';
import toast from 'react-hot-toast';
import { QUESTION_TYPES, CATEGORIES, DIFFICULTIES, ROUNDS } from '../../../utils/constants';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ category: '', difficulty: '', questionType: '' });
  const [form, setForm] = useState({ questionText: '', questionType: 'mcq-single', category: 'General', difficulty: 'Medium', round: 'Both', marks: 1, negativeMarks: 0, options: [{ id: 'A', text: '', isCorrect: false }, { id: 'B', text: '', isCorrect: false }, { id: 'C', text: '', isCorrect: false }, { id: 'D', text: '', isCorrect: false }], correctAnswer: '', codeSnippet: '', explanation: '' });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getQuestions({ ...filters, limit: 100 });
      setQuestions(data.data.questions);
    } catch (err) { toast.error('Failed to load questions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuestions(); }, [filters]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminService.createQuestion(form);
      toast.success('Question created');
      setShowForm(false);
      fetchQuestions();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    try { await adminService.deleteQuestion(id); toast.success('Deleted'); fetchQuestions(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Question Bank</h1><p className="text-dark-500">{questions.length} questions</p></div>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Add Question</button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <select className="input max-w-[180px]" value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}><option value="">All Categories</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
        <select className="input max-w-[150px]" value={filters.difficulty} onChange={(e) => setFilters({...filters, difficulty: e.target.value})}><option value="">All Difficulties</option>{DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}</select>
        <select className="input max-w-[180px]" value={filters.questionType} onChange={(e) => setFilters({...filters, questionType: e.target.value})}><option value="">All Types</option>{QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
      </div>

      {loading ? <Loader /> : questions.length === 0 ? <EmptyState title="No questions" message="Add questions to the bank." /> : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-dark-50 dark:bg-dark-800/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase">Question</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase">Difficulty</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase">Marks</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-dark-500 uppercase">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
              {questions.map(q => (
                <tr key={q._id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30">
                  <td className="px-4 py-3 text-sm max-w-xs truncate">{q.questionText}</td>
                  <td className="px-4 py-3"><span className="badge-info text-xs">{q.questionType}</span></td>
                  <td className="px-4 py-3 text-sm">{q.category}</td>
                  <td className="px-4 py-3"><span className={`badge text-xs ${q.difficulty === 'Easy' ? 'badge-success' : q.difficulty === 'Hard' ? 'badge-danger' : 'badge-warning'}`}>{q.difficulty}</span></td>
                  <td className="px-4 py-3 text-sm font-semibold">{q.marks}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(q._id)} className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Question" size="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="label">Question Text *</label><textarea className="input min-h-[100px]" value={form.questionText} onChange={(e) => setForm({...form, questionText: e.target.value})} required /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Type</label><select className="input" value={form.questionType} onChange={(e) => setForm({...form, questionType: e.target.value})}>{QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div><label className="label">Category</label><select className="input" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="label">Difficulty</label><select className="input" value={form.difficulty} onChange={(e) => setForm({...form, difficulty: e.target.value})}>{DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Marks *</label><input type="number" className="input" value={form.marks} onChange={(e) => setForm({...form, marks: parseInt(e.target.value)})} required /></div>
            <div><label className="label">Negative Marks</label><input type="number" className="input" value={form.negativeMarks} onChange={(e) => setForm({...form, negativeMarks: parseInt(e.target.value)})} /></div>
            <div><label className="label">Round</label><select className="input" value={form.round} onChange={(e) => setForm({...form, round: e.target.value})}>{ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
          </div>
          {['mcq-single', 'mcq-multiple'].includes(form.questionType) && (
            <div><label className="label">Options</label>{form.options.map((opt, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <input type={form.questionType === 'mcq-single' ? 'radio' : 'checkbox'} name="correct" checked={opt.isCorrect} onChange={() => {
                  const opts = form.questionType === 'mcq-single' ? form.options.map((o, j) => ({...o, isCorrect: j === i})) : form.options.map((o, j) => j === i ? {...o, isCorrect: !o.isCorrect} : o);
                  setForm({...form, options: opts});
                }} />
                <span className="font-mono font-bold text-sm">{opt.id}.</span>
                <input className="input flex-1" value={opt.text} onChange={(e) => { const opts = [...form.options]; opts[i].text = e.target.value; setForm({...form, options: opts}); }} placeholder={`Option ${opt.id}`} />
              </div>
            ))}</div>
          )}
          {form.questionType === 'true-false' && <div><label className="label">Correct Answer</label><select className="input" value={form.correctAnswer} onChange={(e) => setForm({...form, correctAnswer: e.target.value})}><option value="">Select</option><option value="true">True</option><option value="false">False</option></select></div>}
          {['coding', 'debugging', 'output-prediction'].includes(form.questionType) && <div><label className="label">Code Snippet</label><textarea className="input font-mono min-h-[120px]" value={form.codeSnippet} onChange={(e) => setForm({...form, codeSnippet: e.target.value})} /></div>}
          <div><label className="label">Explanation</label><textarea className="input" value={form.explanation} onChange={(e) => setForm({...form, explanation: e.target.value})} /></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100 dark:border-dark-700">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Question</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuestionBank;
