import { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import StatusBadge from '../../common/StatusBadge';
import Pagination from '../../common/Pagination';
import Modal from '../../common/Modal';
import ConfirmDialog from '../../common/ConfirmDialog';
import EmptyState from '../../common/EmptyState';
import { Loader } from '../../common/Loader';
import { formatDate } from '../../../utils/formatDate';
import toast from 'react-hot-toast';
import TeamImportModal from './TeamImportModal';
import TeamEditModal from './TeamEditModal';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editTeamId, setEditTeamId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [form, setForm] = useState({ teamName: '', teamLead: { name: '', email: '', usn: '', phone: '', college: '', year: '', branch: '' } });

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getTeams({ page, limit: 20, search, status: statusFilter });
      setTeams(data.data.teams);
      setPagination(data.data.pagination);
    } catch (err) { toast.error('Failed to load teams'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTeams(); }, [page, search, statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const { data } = await adminService.createTeam(form);
      toast.success(`Team ${data.data.team.teamId} created! Password: ${data.data.generatedPassword}`);
      setShowCreate(false);
      setForm({ teamName: '', teamLead: { name: '', email: '', usn: '', phone: '', college: '', year: '', branch: '' } });
      fetchTeams();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create team'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await adminService.deleteTeam(confirmDelete);
      toast.success('Team deleted');
      setConfirmDelete(null);
      fetchTeams();
    } catch (err) { toast.error('Failed to delete'); }
    finally { setActionLoading(false); }
  };

  const handleStatus = async (id, status) => {
    try {
      await adminService.changeTeamStatus(id, { status });
      toast.success(`Team ${status}`);
      fetchTeams();
    } catch (err) { toast.error('Failed to update status'); }
  };

  const handleResetPassword = async (id) => {
    try {
      const { data } = await adminService.resetTeamPassword(id);
      toast.success(`Password reset! New: ${data.data.newPassword}`);
    } catch (err) { toast.error('Failed to reset password'); }
  };

  const handleUnlock = async (id) => {
    try {
      await adminService.unlockTeam(id);
      toast.success('Team account unlocked successfully!');
      fetchTeams();
    } catch (err) { toast.error('Failed to unlock team'); }
  };

  const handleLock = async (id) => {
    const reason = window.prompt('Enter reason for locking this account (optional):', 'Administrative Lock');
    if (reason === null) return;
    try {
      await adminService.changeTeamStatus(id, { status: 'locked', reason });
      toast.success('Team account locked successfully!');
      fetchTeams();
    } catch (err) { toast.error('Failed to lock team'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Team Management</h1>
          <p className="text-dark-500 dark:text-dark-400">{pagination?.total || 0} teams registered</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="btn-secondary">Import Excel/CSV</button>
          <button onClick={() => setShowCreate(true)} className="btn-primary">+ Create Team</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input type="text" placeholder="Search teams..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input max-w-xs" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input max-w-[200px]">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="locked">Locked</option>
        </select>
      </div>

      {/* Table */}
      {loading ? <Loader text="Loading teams..." /> : teams.length === 0 ? (
        <EmptyState title="No teams found" message="Create your first team to get started." action={<button onClick={() => setShowCreate(true)} className="btn-primary">Create Team</button>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-50 dark:bg-dark-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase">Team ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase">Lead</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase">Members</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase">Created</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-dark-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                {teams.map((team) => (
                  <tr key={team._id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-primary-600">{team.teamId}</td>
                    <td className="px-4 py-3 font-medium text-dark-900 dark:text-dark-100">{team.teamName}</td>
                    <td className="px-4 py-3"><div className="text-sm">{team.teamLead?.name}</div><div className="text-xs text-dark-400">{team.teamLead?.email}</div></td>
                    <td className="px-4 py-3 text-sm">{team.members?.length || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <StatusBadge status={team.status} />
                        {team.lockUntil && new Date(team.lockUntil) > new Date() && (
                          <span className="badge-danger text-[10px] flex items-center gap-1 py-0.5 px-1.5 font-bold" title="Locked due to wrong password attempts">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            Locked (Attempts)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-500">{formatDate(team.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditTeamId(team._id)} className="btn-ghost text-xs">Manage</button>
                        {(team.status === 'locked' || (team.lockUntil && new Date(team.lockUntil) > new Date())) ? (
                          <button onClick={() => handleUnlock(team._id)} className="text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded font-bold flex items-center gap-1" title="Unlock Account">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
                            Unlock
                          </button>
                        ) : (
                          <button onClick={() => handleLock(team._id)} className="text-xs text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-2 py-1 rounded font-bold flex items-center gap-1" title="Lock Account">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            Lock
                          </button>
                        )}
                        {team.status === 'pending' && <button onClick={() => handleStatus(team._id, 'approved')} className="text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 px-2 py-1 rounded">Approve</button>}
                        <button onClick={() => handleResetPassword(team._id)} className="text-xs text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 px-2 py-1 rounded">Reset PW</button>
                        <button onClick={() => setConfirmDelete(team._id)} className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-dark-100 dark:border-dark-800">
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Team" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Team Name *</label>
            <input type="text" className="input" value={form.teamName} onChange={(e) => setForm({ ...form, teamName: e.target.value })} required />
          </div>
          <h4 className="font-semibold text-dark-900 dark:text-dark-100 mt-4">Team Lead</h4>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Name *</label><input type="text" className="input" value={form.teamLead.name} onChange={(e) => setForm({ ...form, teamLead: { ...form.teamLead, name: e.target.value } })} required /></div>
            <div><label className="label">Email *</label><input type="email" className="input" value={form.teamLead.email} onChange={(e) => setForm({ ...form, teamLead: { ...form.teamLead, email: e.target.value } })} required /></div>
            <div className="col-span-2"><label className="label">USN *</label><input type="text" className="input uppercase" value={form.teamLead.usn} onChange={(e) => setForm({ ...form, teamLead: { ...form.teamLead, usn: e.target.value.toUpperCase() } })} required placeholder="1XX21CS001" /></div>
            <div><label className="label">Phone</label><input type="text" className="input" value={form.teamLead.phone} onChange={(e) => setForm({ ...form, teamLead: { ...form.teamLead, phone: e.target.value } })} /></div>
            <div><label className="label">College</label><input type="text" className="input" value={form.teamLead.college} onChange={(e) => setForm({ ...form, teamLead: { ...form.teamLead, college: e.target.value } })} /></div>
            <div><label className="label">Year</label><input type="text" className="input" value={form.teamLead.year} onChange={(e) => setForm({ ...form, teamLead: { ...form.teamLead, year: e.target.value } })} /></div>
            <div><label className="label">Branch</label><input type="text" className="input" value={form.teamLead.branch} onChange={(e) => setForm({ ...form, teamLead: { ...form.teamLead, branch: e.target.value } })} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100 dark:border-dark-700">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={actionLoading}>{actionLoading ? 'Creating...' : 'Create Team'}</button>
          </div>
        </form>
      </Modal>

      {/* Manage/Edit Modal */}
      <TeamEditModal 
        isOpen={!!editTeamId} 
        onClose={() => setEditTeamId(null)} 
        teamId={editTeamId}
        onSuccess={() => { fetchTeams(); }}
      />

      <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Delete Team" message="Are you sure? This action cannot be undone." confirmText="Delete" loading={actionLoading} />
      
      {/* Import Modal */}
      <TeamImportModal 
        isOpen={showImport} 
        onClose={() => setShowImport(false)} 
        onSuccess={() => { setShowImport(false); fetchTeams(); }} 
      />
    </div>
  );
};

export default TeamManagement;
