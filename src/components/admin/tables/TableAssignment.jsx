import { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

const TableAssignment = () => {
  const [teams, setTeams] = useState([]);
  const [zones, setZones] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [zoneInput, setZoneInput] = useState('');
  const [tableInput, setTableInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMap = async () => {
    try {
      const { data } = await adminService.getVenueMap();
      setTeams(data.data?.teams || []);
      setZones(data.data?.zones || {});
    } catch {}
  };

  useEffect(() => {
    fetchMap();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return;
    setSubmitting(true);
    try {
      await adminService.assignTable(selectedTeam._id, { zone: zoneInput, tableNumber: tableInput });
      toast.success(`Table assigned to ${selectedTeam.teamName}`);
      setSelectedTeam(null);
      setZoneInput('');
      setTableInput('');
      fetchMap();
    } catch (err) {
      toast.error('Failed to assign table');
    } finally {
      setSubmitting(false);
    }
  };

  const openAssignModal = (team) => {
    setSelectedTeam(team);
    setZoneInput(team.zone || '');
    setTableInput(team.tableNumber || '');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">📍 Venue Map & Seating</h1>
        <p className="text-dark-500 dark:text-dark-400">Allocate tables and view real-time venue layout</p>
      </div>

      {/* Seating Layout Map */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-dark-900 dark:text-white">Physical Layout Overview</h3>

        <div className="space-y-6">
          {Object.entries(zones).map(([zoneName, zoneTeams]) => (
            <div key={zoneName} className="space-y-2">
              <h4 className="text-sm font-bold text-primary-600 uppercase tracking-widest">Zone: {zoneName}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {zoneTeams.map(t => (
                  <div key={t._id} onClick={() => openAssignModal(t)}
                    className="p-3 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl text-center cursor-pointer hover:border-primary-500 hover:shadow-md transition">
                    <span className="text-lg">🪑</span>
                    <p className="text-xs font-bold text-dark-900 dark:text-white mt-1 truncate">{t.teamName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">T: {t.tableNumber || '?'}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(zones).length === 0 && (
            <p className="text-sm text-slate-400 italic text-center py-6">No assignments made yet. See unassigned team list below.</p>
          )}
        </div>
      </div>

      {/* Unassigned / Approved Teams List */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-dark-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">All Seating Registrations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-xs font-bold text-slate-500 uppercase">
                <th className="p-4">Team Name</th>
                <th className="p-4">Lead</th>
                <th className="p-4">Zone</th>
                <th className="p-4">Table Number</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-sm">
              {teams.map(t => (
                <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-dark-950/50">
                  <td className="p-4 font-bold text-dark-900 dark:text-white">{t.teamName} <span className="font-mono text-xs text-slate-400 font-normal">({t.teamId})</span></td>
                  <td className="p-4">{t.teamLead?.name || 'No Lead'}</td>
                  <td className="p-4 font-semibold text-primary-600">{t.zone || '-'}</td>
                  <td className="p-4 font-mono font-bold">{t.tableNumber || '-'}</td>
                  <td className="p-4">
                    <button onClick={() => openAssignModal(t)} className="text-primary-600 hover:text-primary-800 font-bold text-xs">
                      📍 {t.tableNumber ? 'Edit Seating' : 'Assign Seat'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocation Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTeam(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <form onSubmit={handleAssign} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Allocate Table</h3>
                <p className="text-xs text-slate-400">{selectedTeam.teamName}</p>
              </div>
              <button type="button" onClick={() => setSelectedTeam(null)} className="text-slate-400 hover:text-slate-500">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Zone / Lab Area</label>
                <input type="text" value={zoneInput} onChange={e => setZoneInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Lab 3, Ground Floor, Zone A" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Table / Seat Number</label>
                <input type="text" value={tableInput} onChange={e => setTableInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  placeholder="e.g. 42" required />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow transition disabled:opacity-50">
                {submitting ? 'Assigning...' : '✅ Save Seating Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TableAssignment;
