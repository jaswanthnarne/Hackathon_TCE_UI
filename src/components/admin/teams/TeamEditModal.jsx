import { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import adminService from '../../../services/adminService';
import StatusBadge from '../../common/StatusBadge';
import toast from 'react-hot-toast';

const TeamEditModal = ({ isOpen, onClose, teamId, onSuccess }) => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingTeamName, setEditingTeamName] = useState(false);
  const [teamNameForm, setTeamNameForm] = useState('');
  
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', usn: '', phone: '', college: '' });
  
  const [addingMember, setAddingMember] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTeamDetails = async () => {
    if (!teamId) return;
    setLoading(true);
    try {
      const { data } = await adminService.getTeam(teamId);
      setTeam(data.data.team);
      setTeamNameForm(data.data.team.teamName);
    } catch (err) {
      toast.error('Failed to load team details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && teamId) {
      fetchTeamDetails();
      setEditingMember(null);
      setAddingMember(false);
      setEditingTeamName(false);
    }
  }, [isOpen, teamId]);

  const handleUpdateTeamName = async () => {
    if (!teamNameForm.trim()) return;
    setActionLoading(true);
    try {
      await adminService.updateTeam(team._id, { teamName: teamNameForm });
      toast.success('Team name updated');
      setEditingTeamName(false);
      fetchTeamDetails();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update team name');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingMember) {
        await adminService.editMember(team._id, editingMember._id, memberForm);
        toast.success('Member updated');
        setEditingMember(null);
      } else if (addingMember) {
        await adminService.addMember(team._id, memberForm);
        toast.success('Member added');
        setAddingMember(false);
      }
      fetchTeamDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    setActionLoading(true);
    try {
      await adminService.removeMember(team._id, memberId);
      toast.success('Member removed');
      fetchTeamDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMakeLead = async (memberId) => {
    if (!window.confirm('Make this member the new Team Lead?')) return;
    setActionLoading(true);
    try {
      await adminService.changeLead(team._id, { newLeadMemberId: memberId });
      toast.success('Team lead updated');
      fetchTeamDetails();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change team lead');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditMember = (member) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name,
      email: member.email,
      usn: member.usn || '',
      phone: member.phone || '',
      college: member.college || ''
    });
    setAddingMember(false);
  };

  const openAddMember = () => {
    setAddingMember(true);
    setMemberForm({ name: '', email: '', usn: '', phone: '', college: team.teamLead.college || '' });
    setEditingMember(null);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={team ? `Manage Team: ${team.teamId}` : 'Loading...'} size="2xl">
      {loading || !team ? (
        <div className="py-10 text-center text-dark-500">Loading team details...</div>
      ) : (
        <div className="space-y-6">
          {/* Team Info Header */}
          <div className="bg-dark-50 dark:bg-dark-900/50 p-4 rounded-xl border border-dark-100 dark:border-dark-800">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider block mb-1">Team Name</span>
                {editingTeamName ? (
                  <div className="flex gap-2 max-w-sm">
                    <input type="text" className="input py-1 px-2" value={teamNameForm} onChange={(e) => setTeamNameForm(e.target.value)} />
                    <button onClick={handleUpdateTeamName} disabled={actionLoading} className="btn-primary py-1 px-3 text-sm">Save</button>
                    <button onClick={() => { setEditingTeamName(false); setTeamNameForm(team.teamName); }} className="btn-secondary py-1 px-3 text-sm">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100">{team.teamName}</h2>
                    <button onClick={() => setEditingTeamName(true)} className="p-1 text-dark-400 hover:text-primary-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                  </div>
                )}
              </div>
              <div className="text-right">
                <StatusBadge status={team.status} />
                <p className="text-xs text-dark-500 mt-1">ID: {team.teamId}</p>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-dark-100 dark:border-dark-800 pb-2">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Team Members ({team.members.length})</h3>
              {!addingMember && !editingMember && (
                <button onClick={openAddMember} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Add Participant
                </button>
              )}
            </div>

            {/* Add / Edit Member Form */}
            {(addingMember || editingMember) && (
              <form onSubmit={handleSaveMember} className="bg-primary-50/50 dark:bg-primary-900/10 p-4 rounded-xl border border-primary-100 dark:border-primary-900/30 mb-6 animate-fade-in">
                <h4 className="font-medium text-primary-800 dark:text-primary-300 mb-3">{editingMember ? 'Edit Participant' : 'Add New Participant'}</h4>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div><label className="label text-xs">Name *</label><input type="text" className="input py-1.5" required value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} /></div>
                  <div><label className="label text-xs">Email *</label><input type="email" className="input py-1.5" required value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} /></div>
                  <div><label className="label text-xs">USN</label><input type="text" className="input py-1.5 uppercase" value={memberForm.usn} onChange={(e) => setMemberForm({ ...memberForm, usn: e.target.value.toUpperCase() })} /></div>
                  <div><label className="label text-xs">Phone</label><input type="text" className="input py-1.5" value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} /></div>
                  <div className="col-span-2"><label className="label text-xs">College / Division</label><input type="text" className="input py-1.5" value={memberForm.college} onChange={(e) => setMemberForm({ ...memberForm, college: e.target.value })} /></div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => { setAddingMember(false); setEditingMember(null); }} className="btn-secondary py-1.5 px-4 text-sm">Cancel</button>
                  <button type="submit" disabled={actionLoading} className="btn-primary py-1.5 px-4 text-sm">{actionLoading ? 'Saving...' : 'Save Participant'}</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {team.members.map((m) => (
                <div key={m._id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border ${m.isLead ? 'bg-blue-50/30 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30' : 'bg-white dark:bg-dark-900 border-dark-200 dark:border-dark-800'}`}>
                  <div className="mb-2 sm:mb-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-dark-900 dark:text-dark-100">{m.name}</p>
                      {m.isLead && <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded">Team Lead</span>}
                    </div>
                    <p className="text-xs text-dark-500 mt-0.5">
                      {m.email} {m.usn && <span className="font-mono mx-1 bg-dark-100 dark:bg-dark-800 px-1 rounded">{m.usn}</span>}
                    </p>
                    {(m.phone || m.college) && (
                      <p className="text-xs text-dark-400 mt-0.5">{m.phone} {m.phone && m.college && '•'} {m.college}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 sm:ml-4 border-t sm:border-t-0 sm:border-l border-dark-100 dark:border-dark-800 pt-2 sm:pt-0 sm:pl-4">
                    {!m.isLead && (
                      <button onClick={() => handleMakeLead(m._id)} title="Make Team Lead" className="p-1.5 text-dark-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                      </button>
                    )}
                    <button onClick={() => openEditMember(m)} title="Edit Participant" className="p-1.5 text-dark-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onClick={() => handleDeleteMember(m._id)} title="Remove Participant" className="p-1.5 text-dark-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TeamEditModal;
