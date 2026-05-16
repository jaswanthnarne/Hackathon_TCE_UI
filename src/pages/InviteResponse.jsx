import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import teamService from '../services/teamService';

const InviteResponse = ({ action }) => {
  const { token } = useParams();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success'|'error', message }
  const [autoActioned, setAutoActioned] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const { data } = await teamService.getInviteDetails(token);
        setInvite(data.data.invite);

        // If action is 'decline', auto-decline
        if (action === 'decline') {
          setAutoActioned(true);
          try {
            const { data: res } = await teamService.declineInvite(token);
            setResult({ type: 'declined', message: res.message });
          } catch (err) {
            setResult({ type: 'error', message: err.response?.data?.message || 'Failed to decline' });
          }
        }
      } catch (err) {
        setResult({ type: 'error', message: err.response?.data?.message || 'Invitation not found or has expired.' });
      } finally { setLoading(false); }
    };
    fetchInvite();
  }, [token, action]);

  const handleAccept = async () => {
    setProcessing(true);
    try {
      const { data } = await teamService.acceptInvite(token);
      setResult({ type: 'success', message: data.message });
    } catch (err) {
      setResult({ type: 'error', message: err.response?.data?.message || 'Failed to accept invitation.' });
    } finally { setProcessing(false); }
  };

  const handleDecline = async () => {
    setProcessing(true);
    try {
      const { data } = await teamService.declineInvite(token);
      setResult({ type: 'declined', message: data.message });
    } catch (err) {
      setResult({ type: 'error', message: err.response?.data?.message || 'Failed to decline invitation.' });
    } finally { setProcessing(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-primary-900 to-secondary-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      </div>
    );
  }

  // Result screen
  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-primary-900 to-secondary-900 p-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
          <div className="mb-6">
            {result.type === 'success' ? (
              <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <span className="block mb-4 text-green-500"><svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
              </div>
            ) : result.type === 'declined' ? (
              <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
                <span className="block mb-4 text-primary-500"><svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                <span className="block mb-4 text-red-500"><svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
              </div>
            )}
            <h2 className="text-2xl font-bold text-white mb-3">
              {result.type === 'success' ? 'Welcome to the Team!' : result.type === 'declined' ? 'Invitation Declined' : 'Oops!'}
            </h2>
            <p className="text-white/70">{result.message}</p>
          </div>
          {result.type === 'success' && (
            <Link to="/team/login" className="inline-block px-6 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-white/90 transition-all">
              Login to Your Team →
            </Link>
          )}
          <div className="mt-4">
            <Link to="/" className="text-white/50 hover:text-white/80 text-sm">← Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  // Accept confirmation screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-primary-900 to-secondary-900 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary-500/20 flex items-center justify-center mb-4">
            <span className="block mb-4 text-primary-500"><svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Team Invitation</h2>
          <p className="text-white/60">You've been invited to join a hackathon team!</p>
        </div>

        {invite && (
          <div className="bg-white/10 rounded-xl p-5 mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50">Invited by</span>
              <span className="text-sm font-semibold text-white">{invite.invitedBy}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50">Team</span>
              <span className="text-sm font-semibold text-white">{invite.teamName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50">Team ID</span>
              <span className="text-sm font-mono font-bold text-primary-400">{invite.teamId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50">Your Name</span>
              <span className="text-sm font-semibold text-white">{invite.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50">Your Email</span>
              <span className="text-sm text-white/80">{invite.email}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button onClick={handleAccept} disabled={processing} className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {processing ? (
              <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Processing...</>
            ) : <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Accept & Join Team</span>}
          </button>
          <button onClick={handleDecline} disabled={processing} className="w-full py-3 bg-white/10 text-white/80 font-semibold rounded-xl hover:bg-white/20 transition-all disabled:opacity-50">
            <span className="flex items-center gap-2 justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>Decline</span>
          </button>
        </div>

        <p className="text-center text-white/40 text-xs mt-4">
          Expires: {invite?.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : '7 days'}
        </p>
      </div>
    </div>
  );
};

export default InviteResponse;
