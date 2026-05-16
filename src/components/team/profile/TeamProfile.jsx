import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTeamAuth } from '../../../context/TeamAuthContext';
import teamService from '../../../services/teamService';
import { Loader } from '../../common/Loader';
import toast from 'react-hot-toast';

const TeamProfile = () => {
  const { team } = useTeamAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', usn: '', phone: '', college: '', year: '', branch: '' });
  const [inviting, setInviting] = useState(false);
  const [pendingInvites, setPendingInvites] = useState([]);
  
  const [editMember, setEditMember] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', usn: '', phone: '', college: '', year: '', branch: '' });
  const [editing, setEditing] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await teamService.getProfile();
      setProfile(data.data.team);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchPendingInvites = async () => {
    try {
      const { data } = await teamService.getPendingInvites();
      setPendingInvites(data.data.invites || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchProfile(); fetchPendingInvites(); }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      await teamService.inviteMember(inviteForm);
      toast.success(`Invitation sent to ${inviteForm.name}! They'll receive an email to accept.`);
      setInviteForm({ name: '', email: '', usn: '', phone: '', college: '', year: '', branch: '' });
      setShowInvite(false);
      fetchPendingInvites();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally { setInviting(false); }
  };

  const handleRemove = async (memberId) => {
    if (!confirm('Remove this member from the team?')) return;
    try {
      await teamService.removeMember(memberId);
      toast.success('Member removed');
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const openEdit = (member) => {
    setEditMember(member);
    setEditForm({
      name: member.name || '',
      usn: member.usn || '',
      phone: member.phone || '',
      college: member.college || '',
      year: member.year || '',
      branch: member.branch || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditing(true);
    try {
      await teamService.updateMember(editMember._id, editForm);
      toast.success('Member details updated');
      setEditMember(null);
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update member');
    } finally {
      setEditing(false);
    }
  };

  if (loading) return <Loader text="Loading profile..." />;

  const { config } = useOutletContext();
  const maxMembers = config?.teamSettings?.maxSize || 5;
  const minMembers = config?.teamSettings?.minSize || 2;
  const isRegistrationOpen = config?.isRegistrationOpen ?? true;
  const currentCount = profile?.members?.length || 0;
  const pendingCount = pendingInvites?.length || 0;
  const canAdd = isRegistrationOpen && (currentCount + pendingCount) < maxMembers;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Team Profile</h1>
          <p className="text-dark-500 dark:text-dark-400">Manage your team members</p>
        </div>
        {canAdd && (
          <button onClick={() => setShowInvite(true)} className="btn-primary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Invite Member
          </button>
        )}
      </div>

      {/* Team Info */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white text-2xl font-bold">
            {profile?.teamName?.charAt(0) || 'T'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100">{profile?.teamName}</h2>
            <p className="font-mono text-primary-600 dark:text-primary-400 font-semibold">{profile?.teamId}</p>
            <span className={`badge mt-1 ${profile?.status === 'approved' ? 'badge-success' : profile?.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{profile?.status}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-dark-50 dark:bg-dark-800 rounded-xl p-3 text-center">
            <p className="text-dark-400 text-xs mb-1">Members</p>
            <p className="text-xl font-bold text-dark-900 dark:text-dark-100">{currentCount}</p>
          </div>
          <div className="bg-dark-50 dark:bg-dark-800 rounded-xl p-3 text-center">
            <p className="text-dark-400 text-xs mb-1">Min Required</p>
            <p className="text-xl font-bold text-yellow-600">{minMembers}</p>
          </div>
          <div className="bg-dark-50 dark:bg-dark-800 rounded-xl p-3 text-center">
            <p className="text-dark-400 text-xs mb-1">Max Allowed</p>
            <p className="text-xl font-bold text-blue-600">{maxMembers}</p>
          </div>
          <div className="bg-dark-50 dark:bg-dark-800 rounded-xl p-3 text-center">
            <p className="text-dark-400 text-xs mb-1">Slots Left</p>
            <p className="text-xl font-bold text-green-600">{maxMembers - currentCount}</p>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-dark-100 dark:border-dark-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Team Members ({currentCount}/{maxMembers})</h3>
          {!isRegistrationOpen ? (
            <span className="badge-danger text-xs">Registrations Closed</span>
          ) : currentCount < minMembers ? (
            <span className="badge-warning text-xs">Need {minMembers - currentCount} more member{minMembers - currentCount > 1 ? 's' : ''}</span>
          ) : null}
        </div>
        <div className="divide-y divide-dark-100 dark:divide-dark-800">
          {profile?.members?.map((member, i) => (
            <div key={member._id || i} className="flex items-center gap-4 px-6 py-4 hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {member.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-dark-900 dark:text-dark-100">{member.name}</p>
                  {member.isLead && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800/30">
                      <span className="flex items-center gap-1"><svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>Team Lead</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-dark-500 dark:text-dark-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {member.email}
                  </span>
                  {member.usn && <span className="flex items-center gap-1 font-mono uppercase bg-dark-100 dark:bg-dark-800 px-1.5 py-0.5 rounded text-xs">{member.usn}</span>}
                  {member.phone && <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{member.phone}</span>}
                  {member.college && <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>{member.college}</span>}
                </div>
                {member.year && <p className="text-xs text-dark-400 mt-0.5">Year {member.year} {member.branch ? `• ${member.branch}` : ''}</p>}
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => openEdit(member)} className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors" title="Edit member">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                {!member.isLead && (
                  <button onClick={() => handleRemove(member._id)} className="p-2 text-dark-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Remove member">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-dark-100 dark:border-dark-700">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Pending Invitations ({pendingInvites.length})</h3>
          </div>
          <div className="divide-y divide-dark-100 dark:divide-dark-800">
            {pendingInvites.map((invite) => (
              <div key={invite._id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark-900 dark:text-dark-100">{invite.name}</p>
                  <p className="text-sm text-dark-400">{invite.email}</p>
                </div>
                <span className="badge-warning text-xs">⏳ Awaiting Response</span>
                <button
                  onClick={async () => { try { await teamService.cancelInvite(invite._id); toast.success('Invite cancelled'); fetchPendingInvites(); } catch { toast.error('Failed to cancel'); } }}
                  className="p-2 text-dark-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Cancel invite">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowInvite(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
          <div className="relative max-w-lg w-full bg-white dark:bg-dark-800 rounded-2xl shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100 dark:border-dark-700">
              <div>
                <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Invite Team Member</h3>
                <p className="text-sm text-dark-500 dark:text-dark-400">{maxMembers - currentCount} slot{maxMembers - currentCount > 1 ? 's' : ''} remaining</p>
              </div>
              <button onClick={() => setShowInvite(false)} className="p-1 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Full Name *</label>
                  <input type="text" className="input" value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} placeholder="John Doe" required />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input type="email" className="input" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} placeholder="john@college.edu" required />
                </div>
                <div className="col-span-2">
                  <label className="label">USN (University Seat Number) *</label>
                  <input type="text" className="input uppercase" value={inviteForm.usn} onChange={(e) => setInviteForm({ ...inviteForm, usn: e.target.value.toUpperCase() })} placeholder="1XX21CS001" required />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="text" className="input" value={inviteForm.phone} onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })} placeholder="9876543210" />
                </div>
                <div>
                  <label className="label">College</label>
                  <input type="text" className="input" value={inviteForm.college} onChange={(e) => setInviteForm({ ...inviteForm, college: e.target.value })} placeholder="TCE College" />
                </div>
                <div>
                  <label className="label">Year</label>
                  <select className="input" value={inviteForm.year} onChange={(e) => setInviteForm({ ...inviteForm, year: e.target.value })}>
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Branch</label>
                  <input type="text" className="input" value={inviteForm.branch} onChange={(e) => setInviteForm({ ...inviteForm, branch: e.target.value })} placeholder="Computer Science" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-100 dark:border-dark-700">
                <button type="button" onClick={() => setShowInvite(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={inviting} className="btn-primary">
                  {inviting ? (
                    <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Adding...</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Send Invite
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditMember(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
          <div className="relative max-w-lg w-full bg-white dark:bg-dark-800 rounded-2xl shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Edit Member Details</h3>
              <button onClick={() => setEditMember(null)} className="p-1 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Full Name *</label>
                  <input type="text" className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div className="col-span-2">
                  <label className="label">USN (University Seat Number) *</label>
                  <input type="text" className="input uppercase" value={editForm.usn} onChange={(e) => setEditForm({ ...editForm, usn: e.target.value.toUpperCase() })} required />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="text" className="input" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div>
                  <label className="label">College</label>
                  <input type="text" className="input" value={editForm.college} onChange={(e) => setEditForm({ ...editForm, college: e.target.value })} />
                </div>
                <div>
                  <label className="label">Year</label>
                  <select className="input" value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}>
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Branch</label>
                  <input type="text" className="input" value={editForm.branch} onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-100 dark:border-dark-700">
                <button type="button" onClick={() => setEditMember(null)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={editing} className="btn-primary">
                  {editing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamProfile;
