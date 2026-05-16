import { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import { Loader } from '../../common/Loader';
import { formatDateTime } from '../../../utils/formatDate';
import toast from 'react-hot-toast';

const ACTION_COLORS = {
  CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
  DELETE: 'bg-red-50 text-red-700 border-red-200',
  LOGIN: 'bg-purple-50 text-purple-700 border-purple-200',
  LOGOUT: 'bg-slate-50 text-slate-600 border-slate-200',
  EXPORT: 'bg-amber-50 text-amber-700 border-amber-200',
  OTHER: 'bg-slate-50 text-slate-600 border-slate-200'
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 30, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ actionType: '', adminId: '', startDate: '', endDate: '' });

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const response = await adminService.getAuditLogs({ ...filters, page, limit: 30 });
      if (response.data.success) {
        setLogs(response.data.data.logs);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch audit logs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getActionType = (action) => {
    if (action.includes('CREATE')) return 'CREATE';
    if (action.includes('UPDATE')) return 'UPDATE';
    if (action.includes('DELETE')) return 'DELETE';
    if (action.includes('LOGIN')) return 'LOGIN';
    if (action.includes('LOGOUT')) return 'LOGOUT';
    if (action.includes('EXPORT')) return 'EXPORT';
    return 'OTHER';
  };

  return (
    <div className="animate-fade-in space-y-6 p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Logs</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor all administrative actions across the platform</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Action Type</label>
            <select
              name="actionType"
              value={filters.actionType}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Actions</option>
              <option value="TEAM_CREATE">Team Create</option>
              <option value="TEAM_UPDATE">Team Update</option>
              <option value="TEAM_DELETE">Team Delete</option>
              <option value="QUESTION_CREATE">Question Create</option>
              <option value="CONFIG_UPDATE">Config Update</option>
              <option value="AUTH_LOGIN">Admin Login</option>
            </select>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="input"
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ actionType: '', adminId: '', startDate: '', endDate: '' })}
              className="btn-secondary w-full"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center">
            <Loader />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-20 text-center text-slate-500">
            No audit logs found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Admin</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4 min-w-[300px]">Details</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const type = getActionType(log.actionType);
                  return (
                    <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                            {log.adminId?.name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{log.adminId?.name || 'System'}</div>
                            <div className="text-xs text-slate-500">{log.adminId?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide border whitespace-nowrap ${ACTION_COLORS[type] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {log.actionType.split('_').join(' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700 max-w-xs truncate" title={log.targetId}>
                          {log.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-slate-500">{log.ipAddress || '0.0.0.0'}</div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="text-sm text-slate-900 font-semibold tabular-nums tracking-tight">{formatDateTime(log.createdAt)}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-900">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-slate-900">{pagination.total}</span> results
            </div>
            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => fetchLogs(pagination.page - 1)}
                className="btn-secondary px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => fetchLogs(pagination.page + 1)}
                className="btn-secondary px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
