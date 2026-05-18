import { useState, useEffect } from 'react';
import judgeApi from '../../../services/judgeService';

const Icon = ({ d, className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  </svg>
);

const TROPHY_ICON = 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z';
const MEDAL_ICON = 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z';

const JudgeScoreboardView = () => {
  const [scoreboard, setScoreboard] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await judgeApi.getScoreboard();
        setScoreboard(data.data?.scoreboard || []);
      } catch {}
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Icon d={TROPHY_ICON} className="w-8 h-8 text-amber-500" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Leaderboard</h1>
      </div>

      <div className="space-y-3">
        {scoreboard.map((team, i) => (
          <div key={team._id} className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 shadow-sm ${i < 3 ? 'border-amber-200 dark:border-amber-800' : 'border-slate-200 dark:border-slate-800'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-slate-400 text-white' : i === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {i < 3 ? <Icon d={MEDAL_ICON} className="w-6 h-6" /> : team.rank}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">{team.teamName}</h3>
                <p className="text-xs text-slate-500">{team.teamId} • {team.judgeCount} judge(s)</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-amber-600">{team.avgTotal}</p>
                <p className="text-[10px] text-slate-400">avg score</p>
              </div>
            </div>
            {team.judgeCount > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-center"><p className="text-xs text-slate-400">Innovation</p><p className="font-bold text-sm text-slate-700 dark:text-slate-300">{team.avgScores.innovation}</p></div>
                <div className="text-center"><p className="text-xs text-slate-400">Tech</p><p className="font-bold text-sm text-slate-700 dark:text-slate-300">{team.avgScores.technicalComplexity}</p></div>
                <div className="text-center"><p className="text-xs text-slate-400">UI/UX</p><p className="font-bold text-sm text-slate-700 dark:text-slate-300">{team.avgScores.uiux}</p></div>
                <div className="text-center"><p className="text-xs text-slate-400">Business</p><p className="font-bold text-sm text-slate-700 dark:text-slate-300">{team.avgScores.businessViability}</p></div>
              </div>
            )}
          </div>
        ))}
        {scoreboard.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Icon d={TROPHY_ICON} className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No scores submitted yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgeScoreboardView;
