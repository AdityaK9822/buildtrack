import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { laborAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const LaborList = () => {
  const { _idOrSlug: projectId } = useParams();
  const { user } = useAuth();
  
  const [labor, setLabor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  
  // Date filter
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchLabor();
  }, [projectId, filter, startDate, endDate]);

  const fetchLabor = async () => {
    try {
      setLoading(true);
      const params = { projectId };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await laborAPI.getAll(projectId, params);
      setLabor(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load labor records');
    } finally {
      setLoading(false);
    }
  };

  const deleteLabor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this labor record?')) return;
    
    try {
      await laborAPI.delete(id);
      setLabor(labor.filter(l => l._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete labor record');
    }
  };

  // Calculate stats
  const stats = labor.reduce((acc, l) => ({
    totalHours: acc.totalHours + (l.hoursWorked || 0) + (l.overtimeHours || 0),
    totalCost: acc.totalCost + (l.totalEarnings || 0),
  }), { totalHours: 0, totalCost: 0 });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 mt-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Labor Tracking</h2>
            <p className="text-gray-500 text-sm">Log and track daily labor entries</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCost)}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Hours</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalHours.toFixed(1)} hrs</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Cost</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalCost)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Entries</p>
          <p className="text-2xl font-bold text-purple-600">{labor.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="w-full px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Labor Table */}
      {labor.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No labor records found</h3>
          <p className="text-gray-500 mt-1">Log your first labor entry to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {labor.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {typeof entry.worker === 'string' ? entry.worker : (entry.worker?.name || entry.workerName || 'Unknown')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {typeof entry.worker === 'string' ? entry.role : (entry.worker?.role || entry.role)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                      <span className="text-gray-900">{entry.hoursWorked}</span>
                      {entry.overtimeHours > 0 && (
                        <span className="text-red-600"> + {entry.overtimeHours} OT</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      ${entry.hourlyRate?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                      ${entry.totalEarnings?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteLabor(entry._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-semibold">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-right">Totals:</td>
                  <td className="px-4 py-3 text-right">{(stats.totalHours).toFixed(1)} hrs</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-right">{formatCurrency(stats.totalCost)}</td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaborList;
