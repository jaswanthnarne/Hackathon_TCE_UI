import { useState, useEffect } from 'react';
import teamService from '../../../services/teamService';
import { useTeamAuth } from '../../../context/TeamAuthContext';
import { Loader } from '../../common/Loader';
import toast from 'react-hot-toast';

const ResultsView = () => {
  const { team } = useTeamAuth();
  const [results, setResults] = useState([]);
  const [myResult, setMyResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await teamService.getLeaderboard();
        const all = data.data.results || [];
        setResults(all);
        const mine = all.find(r => {
          const tid = r.teamId?._id || r.teamId;
          return tid === data.data.myTeamId;
        });
        setMyResult(mine);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('leaderboard_not_published');
        } else {
          setError('failed');
        }
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <Loader text="Loading results..." />;

  if (error === 'leaderboard_not_published') {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100 mb-6">Results & Leaderboard</h1>
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mb-4">
            <span className="text-4xl">⏳</span>
          </div>
          <h3 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-2">Results Not Yet Published</h3>
          <p className="text-dark-500 dark:text-dark-400 max-w-md mx-auto">The organizers haven't published the results yet. Check back later!</p>
        </div>
      </div>
    );
  }

  if (error === 'failed') {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100 mb-6">Results & Leaderboard</h1>
        <div className="card p-12 text-center">
          <span className="block mb-3"><svg className="w-10 h-10 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></span>
          <p className="text-dark-500">Failed to load results. Please try again.</p>
        </div>
      </div>
    );
  }

  const topScore = results.length > 0 ? Math.max(...results.map(r => r.totalScore || 0)) : 1;
  const medalLabels = { 1: '1st', 2: '2nd', 3: '3rd' };
  const medalColors = { 1: 'text-yellow-400', 2: 'text-gray-400', 3: 'text-amber-500' };

  const top3 = results.slice(0, 3);
  const others = results.slice(3);

  const getPodiumOrder = (teams) => {
    // order for podium: 2, 1, 3
    const order = [];
    if (teams[1]) order.push(teams[1]);
    if (teams[0]) order.push(teams[0]);
    if (teams[2]) order.push(teams[2]);
    return order;
  };

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 drop-shadow-sm mb-2">Hackathon Results</h1>
        <p className="text-dark-500 dark:text-dark-400 max-w-lg mx-auto">The final standings based on evaluation and quiz scores. Congratulations to all participants!</p>
      </div>

      {/* Podium for Top 3 */}
      {top3.length > 0 && (
        <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 mb-16 pt-8">
          {getPodiumOrder(top3).map((r) => {
            const team = r.teamId || {};
            const isMe = (team._id || team) === (myResult?.teamId?._id || myResult?.teamId);
            const isFirst = r.rank === 1;
            const isSecond = r.rank === 2;
            const isThird = r.rank === 3;
            
            return (
              <div key={r._id} className={`flex flex-col items-center animate-fade-in-up ${isFirst ? 'order-1 md:order-2 z-10' : isSecond ? 'order-2 md:order-1' : 'order-3'} `} style={{ animationDelay: `${r.rank * 150}ms` }}>
                {/* Crown / Medal */}
                <div className={`text-4xl font-black mb-3 drop-shadow-md ${medalColors[r.rank] || 'text-dark-400'}`}>
                  #{r.rank}
                </div>
                
                {/* Avatar */}
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-xl mb-4 border-4 ${isFirst ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 border-yellow-200' : isSecond ? 'bg-gradient-to-br from-gray-300 to-gray-500 border-gray-100' : 'bg-gradient-to-br from-amber-500 to-amber-700 border-amber-300'} ${isMe ? 'ring-4 ring-primary-500 ring-offset-4 dark:ring-offset-dark-900' : ''}`}>
                  {team.teamName?.charAt(0) || 'T'}
                </div>

                {/* Team Info */}
                <div className="text-center mb-4">
                  <h3 className={`font-bold text-lg md:text-xl truncate max-w-[150px] ${isMe ? 'text-primary-600' : 'text-dark-900 dark:text-dark-100'}`}>{team.teamName}</h3>
                  <p className="text-xl font-black text-primary-600">{r.totalScore} <span className="text-xs text-dark-400 font-normal">pts</span></p>
                  {r.awardTitle && <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-500 mt-1 uppercase tracking-wide px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">{r.awardTitle}</p>}
                </div>

                {/* Podium Block */}
                <div className={`w-32 md:w-40 rounded-t-2xl shadow-lg flex items-start justify-center pt-4 ${isFirst ? 'h-48 md:h-56 bg-gradient-to-b from-yellow-400 to-yellow-600' : isSecond ? 'h-36 md:h-44 bg-gradient-to-b from-gray-300 to-gray-500' : 'h-28 md:h-36 bg-gradient-to-b from-amber-500 to-amber-700'}`}>
                  <span className="text-5xl font-black text-white/40">{r.rank}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Your Result Summary */}
        {myResult && (
          <div className="lg:col-span-1">
            <div className="card overflow-hidden sticky top-24 border-2 border-primary-500/30 shadow-xl shadow-primary-500/10">
              <div className="bg-gradient-to-br from-primary-500 to-secondary-600 p-8 text-white text-center">
                <p className="text-sm text-white/80 uppercase tracking-widest font-semibold mb-2">Your Team</p>
                <h2 className="text-3xl font-black mb-6">{team?.teamName}</h2>
                <div className="inline-flex flex-col items-center justify-center w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/20 mb-4 shadow-inner">
                  <span className="text-4xl font-black">{myResult.totalScore}</span>
                  <span className="text-sm font-medium opacity-80">Total Score</span>
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-dark-900">
                <div className="flex justify-between items-center py-3 border-b border-dark-100 dark:border-dark-800">
                  <span className="text-dark-500">Current Rank</span>
                  <span className="font-bold text-xl text-dark-900 dark:text-dark-100">#{myResult.rank}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-dark-100 dark:border-dark-800">
                  <span className="text-dark-500">Total Teams</span>
                  <span className="font-bold text-lg text-dark-900 dark:text-dark-100">{results.length}</span>
                </div>
                {myResult.isWinner && (
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800/30 text-center">
                    <p className="text-3xl mb-2"><svg className="w-8 h-8 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg></p>
                    <p className="font-bold text-yellow-700 dark:text-yellow-500">{myResult.awardTitle || 'Winner!'}</p>
                    <p className="text-xs text-yellow-600/80 dark:text-yellow-500/80 mt-1">Outstanding performance</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Remaining Leaderboard */}
        <div className={myResult ? "lg:col-span-2" : "lg:col-span-3 max-w-4xl mx-auto w-full"}>
          <div className="card overflow-hidden shadow-lg border border-dark-100 dark:border-dark-800">
            <div className="bg-dark-50 dark:bg-dark-800/80 px-6 py-5 border-b border-dark-100 dark:border-dark-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                Complete Standings
              </h3>
            </div>
            <div className="divide-y divide-dark-100 dark:divide-dark-800 max-h-[600px] overflow-y-auto custom-scrollbar">
              {others.map((r) => {
                const rTeam = r.teamId || {};
                const isMe = (rTeam._id || rTeam) === (myResult?.teamId?._id || myResult?.teamId);
                return (
                  <div key={r._id} className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 ${isMe ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-dark-50 dark:hover:bg-dark-800/50'}`}>
                    <div className="w-8 font-bold text-dark-400 text-center">
                      {r.rank}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center font-bold text-dark-600 dark:text-dark-300">
                      {rTeam.teamName?.charAt(0) || 'T'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate text-lg ${isMe ? 'text-primary-600' : 'text-dark-900 dark:text-dark-100'}`}>
                        {rTeam.teamName} {isMe && <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">YOU</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl text-primary-600">{r.totalScore}</p>
                      {r.isWinner && <p className="text-xs font-semibold text-yellow-600 truncate max-w-[100px] mt-0.5 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>{r.awardTitle}</p>}
                    </div>
                  </div>
                );
              })}
              {others.length === 0 && (
                <div className="p-8 text-center text-dark-500">No other teams to display.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
