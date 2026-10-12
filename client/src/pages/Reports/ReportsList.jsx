import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { reportAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ReportsList = () => {
  const { _idOrSlug: projectId } = useParams();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReports();
  }, [projectId, filter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.date = filter;
      
      const response = await reportAPI.getAll(projectId, params);
      setReports(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await reportAPI.delete(id);
      setReports(reports.filter(r => r._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete report');
    }
  };

  const weatherConditions = {
    sunny: { icon: '☀️', color: 'bg-yellow-100 text-yellow-800' },
    cloudy: { icon: '☁️', color: 'bg-gray-100 text-gray-800' },
    rainy: { icon: '🌧️', color: 'bg-blue-100 text-blue-800' },
    stormy: { icon: '⛈️', color: 'bg-purple-100 text-purple-800' },
    snowy: { icon: '❄️', color: 'bg-white text-gray-800 border border-gray-300' },
    unknown: { icon: '❓', color: 'bg-gray-100 text-gray-800' },
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const weather_conditions = weatherConditions;
  
  const weatherInfo = (weather) => {
    if (!weather) return null;
    const condition = weather_conditions[weather.condition] || weather_conditions.unknown;
    return {
      icon: condition.icon,
      color: condition.color,
      temp: weather.temperature ? `${weather.temperature}°F` : '--',
      humidity: weather.humidity ? `${weather.humidity}%` : '--',
    };
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
            <h2 className="text-2xl font-bold text-gray-900">Daily Reports</h2>
            <p className="text-gray-500 text-sm">Track daily project progress and conditions</p>
          </div>
          <button
            onClick={() => window.location.href = `/projects/${projectId}/reports/create`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + Create Report
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No reports yet</h3>
          <p className="text-gray-500 mt-1">Create your first daily report to track progress</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const weather = weatherConditions[report.weather?.condition] || weatherConditions.unknown;
            return (
              <div key={report._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${weather.color}`}>
                      {weather.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {new Date(report.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span>{report.weather?.temperature ? `${report.weather.temperature}°F` : '--°F'}</span>
                        <span>•</span>
                        <span>{report.weather?.humidity ? `${report.weather.humidity}% humidity` : '--'}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status || 'completed')}`}>
                          {report.status || 'Completed'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.location.href = `/reports/${report._id}`}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      View
                    </button>
                    <button
                      onClick={() => deleteReport(report._id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <h4 className="text-xs font-semibold text-green-700 uppercase mb-1">Work Completed</h4>
                    <p className="text-sm text-gray-700 line-clamp-2">{report.workCompleted || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <h4 className="text-xs font-semibold text-blue-700 uppercase mb-1">Work Planned</h4>
                    <p className="text-sm text-gray-700 line-clamp-2">{report.workPlanned || 'N/A'}</p>
                  </div>
                </div>
                
                {report.issues && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <h4 className="text-xs font-semibold text-yellow-700 uppercase mb-1">Issues</h4>
                    <p className="text-sm text-gray-700">{report.issues}</p>
                  </div>
                )}
                
                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">
                      <strong className="text-gray-900">{report.laborCount || 0}</strong> workers
                    </span>
                    <span className="text-gray-600">
                      <strong className={`text-red-600`}>{report.safetyIncidents || 0}</strong> incidents
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Created: {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReportsList;
