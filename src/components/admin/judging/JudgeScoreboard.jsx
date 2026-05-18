import { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';

const JudgeScoreboard = () => {
  const [scoreboard, setScoreboard] = useState([]);
  const [judges, setJudges] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [scoreRes, judgeRes] = await Promise.all([
          adminService.getJudgingScoreboard(),
          adminService.getJudges(),
        ]);
        setScoreboard(scoreRes.data.data?.scoreboard || []);
        setJudges(judgeRes.data.data?.judges || []);
      } catch {}
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">⚖️ Judging Scoreboard</h1>
        <p className="text-dark-500 dark:text-dark-400">View live evaluations, rubrics, and judge assignments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scoreboard List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-dark-800">
              <h3 className="font-semibold text-slate-900 dark:text-white">Live Evaluated Leaderboard</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-xs font-bold text-slate-500 uppercase">
                    <th className="p-4">Rank</th>
                    <th className="p-4">Team</th>
                    <th className="p-4">Judge Evaluators</th>
                    <th className="p-4">Average Scores (Inn/Com/UI/Biz)</th>
                    <th className="p-4">Weighted Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-sm">
                  {scoreboard.map((team, idx) => (
                    <tr key={team._id} className="hover:bg-slate-50 dark:hover:bg-dark-950/50">
                      <td className="p-4 font-black">{idx + 1}</td>
                      <td className="p-4">
                        <p className="font-bold text-dark-900 dark:text-white">{team.teamName}</p>
                        <p className="text-xs text-slate-500 font-mono">{team.teamId}</p>
                      </td>
                      <td className="p-4 font-semibold text-slate-600 dark:text-slate-400">{team.judgeCount} evaluators</td>
                      <td className="p-4 text-xs font-mono text-slate-500">
                        {team.judgeCount > 0 ? (
                          <span>{team.avgScores?.innovation} / {team.avgScores?.technicalComplexity} / {team.avgScores?.uiux} / {team.avgScores?.businessViability}</span>
                        ) : '-'}
                      </td>
                      <td className="p-4 font-black text-amber-600 text-base">{team.avgTotal || '-'}</td>
                    </tr>
                  ))}
                  {scoreboard.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-400">
                        No team scores submitted yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Judges List */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Assigned Judges</h3>
            <div className="space-y-3">
              {judges.map(judge => (
                <div key={judge._id} className="p-3 bg-slate-50 dark:bg-dark-950 rounded-xl border border-slate-200 dark:border-dark-800">
                  <p className="font-bold text-dark-900 dark:text-white">{judge.name}</p>
                  <p className="text-xs text-slate-500 font-mono">ID: {judge.staffId}</p>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-dark-800 flex justify-between text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    <span>Assigned: {judge.assignedTeams?.length || 0} teams</span>
                    <span>Duty: {judge.dutyArea || 'Judging Desk'}</span>
                  </div>
                </div>
              ))}
              {judges.length === 0 && (
                <p className="text-center text-slate-400 py-8 text-sm">No judge accounts configured yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeScoreboard;
