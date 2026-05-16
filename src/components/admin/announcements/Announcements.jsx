import { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import { Loader } from '../../common/Loader';
import EmptyState from '../../common/EmptyState';
import Modal from '../../common/Modal';
import ConfirmDialog from '../../common/ConfirmDialog';
import toast from 'react-hot-toast';

const PRIORITY_STYLES = {
  high: { bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-l-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400', dot: 'bg-red-500' },
  normal: { bg: '', border: 'border-l-primary-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', dot: 'bg-blue-500' },
  low: { bg: '', border: 'border-l-dark-300', badge: 'bg-dark-100 text-dark-600 dark:bg-dark-800 dark:text-dark-400', dot: 'bg-dark-400' },
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', priority: 'normal', isPinned: false, isPublished: true });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getAnnouncements();
      setAnnouncements(data.data.announcements || []);
    } catch (err) { toast.error('Failed to load announcements'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', message: '', priority: 'normal', isPinned: false, isPublished: true });
    setShowForm(true);
  };

  const openEdit = (ann) => {
    setEditing(ann);
    setForm({ title: ann.title, message: ann.message, priority: ann.priority || 'normal', isPinned: ann.isPinned || false, isPublished: ann.isPublished !== false });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await adminService.updateAnnouncement(editing._id, form);
        toast.success('Announcement updated');
      } else {
        await adminService.createAnnouncement(form);
        toast.success('Announcement broadcast!');
      }
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteAnnouncement(confirmDelete);
      toast.success('Announcement deleted');
      setConfirmDelete(null);
      fetchAnnouncements();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const handlePin = async (id) => {
    try {
      await adminService.togglePin(id);
      fetchAnnouncements();
    } catch (err) { toast.error('Failed to toggle pin'); }
  };

  const published = announcements.filter(a => a.isPublished);
  const drafts = announcements.filter(a => !a.isPublished);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Announcements</h1>
          <p className="text-dark-500 dark:text-dark-400">{announcements.length} announcements • {published.length} published</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          New Announcement
        </button>
      </div>

      {loading ? <Loader text="Loading announcements..." /> : announcements.length === 0 ? (
        <EmptyState title="No announcements" message="Create your first announcement to broadcast to all teams." action={<button onClick={openCreate} className="btn-primary">Create Announcement</button>} />
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => {
            const ps = PRIORITY_STYLES[ann.priority] || PRIORITY_STYLES.normal;
            return (
              <div key={ann._id} className={`card overflow-hidden border-l-4 ${ps.border} ${ps.bg} transition-all hover:shadow-md`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {ann.isPinned && <span className="text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>Pinned</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ps.badge} flex items-center gap-1`}><span className={`w-2 h-2 rounded-full ${ps.dot}`} />{ann.priority}</span>
                        {!ann.isPublished && <span className="text-xs bg-dark-100 dark:bg-dark-800 text-dark-500 px-2 py-0.5 rounded-full">Draft</span>}
                      </div>
                      <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-1">{ann.title}</h3>
                      <p className="text-sm text-dark-600 dark:text-dark-400 whitespace-pre-wrap line-clamp-3">{ann.message}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-dark-400">
                        <span>By {ann.createdBy?.name || 'Admin'}</span>
                        <span>•</span>
                        <span>{new Date(ann.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => handlePin(ann._id)} className={`p-2 rounded-lg transition-colors ${ann.isPinned ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' : 'text-dark-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`} title={ann.isPinned ? 'Unpin' : 'Pin'}>
                        <svg className="w-4 h-4" fill={ann.isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                      </button>
                      <button onClick={() => openEdit(ann)} className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => setConfirmDelete(ann._id)} className="p-2 text-dark-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Announcement' : 'New Announcement'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input type="text" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Important update for all teams" required maxLength={200} />
          </div>
          <div>
            <label className="label">Message *</label>
            <textarea className="input min-h-[150px]" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Write your announcement here. This will be visible to all teams..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <div className="flex gap-2">
                {['low', 'normal', 'high'].map(p => (
                  <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all ${form.priority === p ? (p === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700' : p === 'normal' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700' : 'border-dark-300 bg-dark-50 dark:bg-dark-800 text-dark-700') : 'border-dark-200 dark:border-dark-700 text-dark-500 hover:border-dark-300'}`}>
                    <span className={`w-2 h-2 rounded-full ${PRIORITY_STYLES[p].dot}`} /> {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} className="w-4 h-4 rounded text-primary-600" />
                <span className="text-sm font-medium text-dark-700 dark:text-dark-300">Pin to top</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="w-4 h-4 rounded text-primary-600" />
                <span className="text-sm font-medium text-dark-700 dark:text-dark-300">Publish immediately</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100 dark:border-dark-700">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editing ? 'Update Announcement' : 'Broadcast Now'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Delete Announcement" message="Are you sure you want to delete this announcement? This cannot be undone." confirmText="Delete" />
    </div>
  );
};

export default Announcements;
