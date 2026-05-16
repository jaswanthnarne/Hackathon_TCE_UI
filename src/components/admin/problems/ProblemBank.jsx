import { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import { Loader } from '../../common/Loader';
import EmptyState from '../../common/EmptyState';
import Modal from '../../common/Modal';
import ConfirmDialog from '../../common/ConfirmDialog';
import toast from 'react-hot-toast';
import { exportProblemsToExcel, exportProblemToPDF } from '../../../utils/exportUtils';

const ProblemBank = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Arrays',
    difficulty: 'Medium',
    expectedOutcome: '',
    techStack: '',
    resources: '',
    maxTeams: 0,
    isActive: true,
  });

  const [filterCat, setFilterCat] = useState('');

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getProblems();
      setProblems(data.data.problems || []);
    } catch (err) {
      toast.error('Failed to load problem statements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProblems(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      description: '',
      category: 'Arrays',
      difficulty: 'Medium',
      expectedOutcome: '',
      techStack: '',
      resources: '',
      maxTeams: 0,
      isActive: true,
    });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description,
      category: p.category,
      difficulty: p.difficulty,
      expectedOutcome: p.expectedOutcome || '',
      techStack: p.techStack || '',
      resources: p.resources || '',
      maxTeams: p.maxTeams || 0,
      isActive: p.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await adminService.updateProblem(editing._id, form);
        toast.success('Problem statement updated');
      } else {
        await adminService.createProblem(form);
        toast.success('Problem statement created');
      }
      setShowForm(false);
      fetchProblems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteProblem(confirmDelete);
      toast.success('Problem statement deleted');
      setConfirmDelete(null);
      fetchProblems();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const categories = [...new Set(problems.map(p => p.category))].sort();
  const filtered = filterCat ? problems.filter(p => p.category === filterCat) : problems;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Problem Statements</h1>
          <p className="text-dark-500 dark:text-dark-400">Manage hackathon challenges ({problems.length} total)</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => exportProblemsToExcel(problems, 'TCE_Hackathon_Admin_Challenges.xlsx')} className="btn-secondary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export Excel
          </button>
          <button onClick={openCreate} className="btn-primary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Add Problem Statement
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input max-w-xs">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <Loader text="Loading problem statements..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No problems found" message="Create a problem statement to get started." action={<button onClick={openCreate} className="btn-primary">Add Problem</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <div key={p._id} className="card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-primary-900/10 border border-dark-100 dark:border-dark-800 flex flex-col h-full">
              {/* Card Header */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${p.isActive ? 'bg-green-500' : 'bg-red-500'}`} title={p.isActive ? 'Active' : 'Inactive'} />
                    <span className="text-xs bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 px-2 py-0.5 rounded-full font-medium">{p.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : p.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {p.difficulty}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100 mb-2 line-clamp-2">{p.title}</h3>
                <p className="text-sm text-dark-500 dark:text-dark-400 line-clamp-3 mb-4 flex-1">
                  {p.description}
                </p>

                {/* Meta stats */}
                <div className="mt-auto pt-4 border-t border-dark-100 dark:border-dark-800 flex items-center justify-between text-sm text-dark-500 dark:text-dark-400">
                  <div className="flex items-center gap-1">
                    <span className="text-dark-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg></span>
                    <span className="font-medium text-dark-900 dark:text-dark-100">{p.selectedBy?.length || 0}</span>
                    <span>/ {p.maxTeams > 0 ? p.maxTeams : '∞'} teams</span>
                  </div>
                </div>
              </div>

                <div className="bg-dark-50 dark:bg-dark-800/50 p-3 px-5 flex items-center justify-between border-t border-dark-100 dark:border-dark-800">
                <button onClick={() => exportProblemToPDF(p)} className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1" title="Download PDF">
                  <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>PDF</span>
                </button>
                <div className="flex justify-end gap-2">
                <button onClick={() => openEdit(p)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-dark-600 hover:text-primary-600 hover:bg-primary-50 dark:text-dark-400 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit
                </button>
                <button onClick={() => setConfirmDelete(p._id)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Delete
                </button>
              </div>
            </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Problem Statement' : 'New Problem Statement'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input type="text" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={300} />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category (C Concept) *</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="Arrays">Arrays</option>
                <option value="Pointers">Pointers</option>
                <option value="Functions">Functions</option>
                <option value="Strings">Strings</option>
                <option value="Structures">Structures</option>
                <option value="File Handling">File Handling</option>
                <option value="Dynamic Memory">Dynamic Memory</option>
                <option value="Recursion">Recursion</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Expected Outcome</label>
            <textarea className="input min-h-[60px]" value={form.expectedOutcome} onChange={(e) => setForm({ ...form, expectedOutcome: e.target.value })} placeholder="What should the final solution look like?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tech Stack (Optional)</label>
              <input type="text" className="input" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} placeholder="e.g. MERN, React Native, Python" />
            </div>
            <div>
              <label className="label">Max Teams (0 for unlimited)</label>
              <input type="number" className="input" value={form.maxTeams} onChange={(e) => setForm({ ...form, maxTeams: parseInt(e.target.value) || 0 })} min={0} />
            </div>
          </div>
          <div>
            <label className="label">Resources (Optional)</label>
            <textarea className="input min-h-[60px]" value={form.resources} onChange={(e) => setForm({ ...form, resources: e.target.value })} placeholder="Helpful links or datasets" />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded text-primary-600" />
              <span className="text-sm font-medium text-dark-900 dark:text-dark-100">Active (visible to teams)</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100 dark:border-dark-700">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Problem'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Delete Problem Statement" message="Are you sure you want to delete this problem statement? This cannot be undone." confirmText="Delete" />
    </div>
  );
};

export default ProblemBank;
