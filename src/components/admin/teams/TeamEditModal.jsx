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

  const handleUnlock = async () => {
    setActionLoading(true);
    try {
      await adminService.unlockTeam(team._id);
      toast.success('Team account unlocked successfully!');
      fetchTeamDetails();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unlock team');
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
      college: member.college || '',
      isLead: member.isLead || false
    });
    setAddingMember(false);
  };

  const openAddMember = () => {
    setAddingMember(true);
    setMemberForm({ name: '', email: '', usn: '', phone: '', college: team.teamLead.college || '', isLead: false });
    setEditingMember(null);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={team ? `Manage Team: ${team.teamId}` : 'Loading...'} size="2xl">
      {loading || !team ? (
        <div className="py-10 text-center text-dark-500">Loading team details...</div>
      ) : (
        <div className="space-y-6">
          {(team.status === 'locked' || (team.lockUntil && new Date(team.lockUntil) > new Date())) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-300 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <div>
                  <h4 className="font-bold text-red-800 dark:text-red-300">Account Currently Locked</h4>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {team.lockUntil && new Date(team.lockUntil) > new Date()
                      ? `Locked due to wrong password attempts. Locked until: ${new Date(team.lockUntil).toLocaleTimeString()}.`
                      : `Locked by admin status. Reason: ${team.lockReason || 'None specified'}.`}
                  </p>
                </div>
              </div>
              <button onClick={handleUnlock} disabled={actionLoading} className="btn-primary bg-red-600 hover:bg-red-700 text-white shadow-md font-bold px-5 py-2 rounded-xl flex items-center gap-2 shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
                Unlock Account Now
              </button>
            </div>
          )}

          {/* Team Info Header */}
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 p-5 rounded-2xl border border-primary-100 dark:border-primary-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10">
              <div className="flex-1 mb-4 sm:mb-0">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  <span className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider">Team Overview</span>
                </div>
                {editingTeamName ? (
                  <div className="flex gap-2 max-w-sm mt-2">
                    <input type="text" className="input py-1.5 px-3 shadow-sm border-primary-300 focus:border-primary-500" value={teamNameForm} onChange={(e) => setTeamNameForm(e.target.value)} autoFocus />
                    <button onClick={handleUpdateTeamName} disabled={actionLoading} className="btn-primary py-1.5 px-4 text-sm font-medium shadow-sm">Save</button>
                    <button onClick={() => { setEditingTeamName(false); setTeamNameForm(team.teamName); }} className="btn-secondary py-1.5 px-3 text-sm">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mt-1">
                    <h2 className="text-2xl font-extrabold text-dark-900 dark:text-dark-100 tracking-tight">{team.teamName}</h2>
                    <button onClick={() => setEditingTeamName(true)} className="p-1.5 text-dark-400 hover:text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-md transition-colors" title="Edit Team Name"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:items-end bg-white dark:bg-dark-900 px-4 py-3 rounded-xl border border-primary-100 dark:border-primary-800 shadow-sm">
                <StatusBadge status={team.status} />
                <div className="flex items-center gap-1.5 mt-2 text-xs font-mono text-dark-500 bg-dark-50 dark:bg-dark-800 px-2 py-1 rounded">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                  ID: <span className="font-semibold text-primary-600 dark:text-primary-400">{team.teamId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="bg-white dark:bg-dark-950 rounded-2xl border border-dark-200 dark:border-dark-800 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-dark-100 dark:border-dark-800 bg-dark-50/50 dark:bg-dark-900/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100">Participants <span className="text-sm font-medium text-dark-500 bg-dark-100 dark:bg-dark-800 px-2 py-0.5 rounded-full ml-1">{team.members.length}</span></h3>
              </div>
              {!addingMember && !editingMember && (
                <button onClick={openAddMember} className="btn-primary py-1.5 px-4 text-sm flex items-center gap-1.5 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Add Participant
                </button>
              )}
            </div>
            
            <div className="p-5">

            {/* Add / Edit Member Form */}
            {(addingMember || editingMember) && (
              <form onSubmit={handleSaveMember} className="bg-primary-50/80 dark:bg-primary-900/10 p-5 rounded-xl border border-primary-200 dark:border-primary-800/50 mb-6 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  <h4 className="font-bold text-primary-800 dark:text-primary-300">{editingMember ? 'Edit Participant Details' : 'Add New Participant'}</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div><label className="label text-xs font-semibold text-dark-600 uppercase tracking-wider mb-1">Full Name <span className="text-red-500">*</span></label><input type="text" className="input shadow-sm" required value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} placeholder="John Doe" /></div>
                  <div><label className="label text-xs font-semibold text-dark-600 uppercase tracking-wider mb-1">Email Address <span className="text-red-500">*</span></label><input type="email" className="input shadow-sm" required value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} placeholder="john@example.com" /></div>
                  <div><label className="label text-xs font-semibold text-dark-600 uppercase tracking-wider mb-1">University USN</label><input type="text" className="input shadow-sm uppercase font-mono" value={memberForm.usn} onChange={(e) => setMemberForm({ ...memberForm, usn: e.target.value.toUpperCase() })} placeholder="1XX21CS001" /></div>
                  <div><label className="label text-xs font-semibold text-dark-600 uppercase tracking-wider mb-1">Phone Number</label><input type="text" className="input shadow-sm" value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} placeholder="+91 9876543210" /></div>
                  <div className="sm:col-span-2"><label className="label text-xs font-semibold text-dark-600 uppercase tracking-wider mb-1">College / Department</label><input type="text" className="input shadow-sm" value={memberForm.college} onChange={(e) => setMemberForm({ ...memberForm, college: e.target.value })} placeholder="Computer Science Engineering" /></div>
                  <div className="sm:col-span-2 bg-white dark:bg-dark-800 p-3 rounded-lg border border-dark-200 dark:border-dark-700 flex items-center gap-2">
                    <input type="checkbox" id="isLeadCheckbox" checked={memberForm.isLead || false} onChange={(e) => setMemberForm({ ...memberForm, isLead: e.target.checked })} className="w-4 h-4 text-primary-600 bg-dark-100 border-dark-300 rounded focus:ring-primary-500" />
                    <label htmlFor="isLeadCheckbox" className="text-sm font-semibold text-dark-800 dark:text-dark-200 cursor-pointer">Make this participant the Team Lead</label>
                  </div>
                </div>
                <div className="flex gap-3 justify-end border-t border-primary-200 dark:border-primary-800 pt-4">
                  <button type="button" onClick={() => { setAddingMember(false); setEditingMember(null); }} className="btn-secondary px-5">Cancel</button>
                  <button type="submit" disabled={actionLoading} className="btn-primary px-6 shadow-md">{actionLoading ? 'Saving Data...' : 'Save Participant'}</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {team.members.map((m) => (
                <div key={m._id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${m.isLead ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800' : 'bg-white dark:bg-dark-900 border-dark-200 dark:border-dark-800 hover:border-primary-300 dark:hover:border-primary-700'}`}>
                  <div className="mb-3 sm:mb-0 flex items-start gap-3">
                    <div className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${m.isLead ? 'bg-blue-600 text-white shadow-sm' : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300'}`}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-dark-900 dark:text-dark-100 text-base">{m.name}</p>
                        {m.isLead && <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800 shadow-sm flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg> Team Lead</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <div className="flex items-center gap-1 text-sm text-dark-600 dark:text-dark-400">
                          <svg className="w-3.5 h-3.5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          {m.email}
                        </div>
                        {m.phone && (
                          <div className="flex items-center gap-1 text-sm text-dark-600 dark:text-dark-400">
                            <svg className="w-3.5 h-3.5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                            {m.phone}
                          </div>
                        )}
                        {m.usn && (
                          <span className="font-mono text-xs font-bold bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 px-1.5 py-0.5 rounded border border-dark-200 dark:border-dark-700 uppercase">{m.usn}</span>
                        )}
                      </div>
                      {m.college && (
                        <p className="text-xs text-dark-500 mt-1.5 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                          {m.college}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 sm:ml-4 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-dark-100 dark:border-dark-800 sm:pl-4 shrink-0">
                    {!m.isLead && (
                      <button onClick={() => handleMakeLead(m._id)} title="Promote to Team Lead" className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/40 rounded-md transition-all flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11l7-7 7 7M5 19l7-7 7 7"></path></svg>
                        Make Lead
                      </button>
                    )}
                    <button onClick={() => openEditMember(m)} title="Edit Participant" className="p-2 text-dark-500 hover:text-primary-600 bg-dark-50 hover:bg-primary-50 dark:bg-dark-800 dark:hover:bg-primary-900/30 rounded-md border border-dark-200 dark:border-dark-700 transition-all shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onClick={() => handleDeleteMember(m._id)} title="Remove Participant" className="p-2 text-dark-500 hover:text-red-600 bg-dark-50 hover:bg-red-50 dark:bg-dark-800 dark:hover:bg-red-900/30 rounded-md border border-dark-200 dark:border-dark-700 transition-all shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TeamEditModal;
