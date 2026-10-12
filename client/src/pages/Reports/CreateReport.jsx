import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { reportAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const CreateReport = () => {
  const { _idOrSlug: projectId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weather: {
      condition: 'sunny',
      temperature: 70,
      humidity: 50,
    },
    workCompleted: '',
    workPlanned: '',
    issues: '',
    notes: '',
    laborCount: 0,
    safetyIncidents: 0,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await reportAPI.create({
        ...formData,
        projectId,
      });
      
      navigate(`/projects/${projectId}/reports`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  const weatherConditions = [
    { value: 'sunny', label: 'Sunny ☀️' },
    { value: 'cloudy', label: 'Cloudy ☁️' },
    { value: 'rainy', label: 'Rainy 🌧️' },
    { value: 'stormy', label: 'Stormy ⛈️' },
    { value: 'snowy', label: 'Snowy ❄️' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 mt-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Daily Report</h2>
        <p className="text-gray-500 text-sm">Document daily progress and site conditions</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Weather */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
            <span className="mr-2">🌤️</span> Weather Conditions
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Condition</label>
              <select
                name="weather.condition"
                value={formData.weather.condition}
                onChange={handleChange}
                className="w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {weatherConditions.map(cond => (
                  <option key={cond.value} value={cond.value}>{cond.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Temperature (°F)</label>
              <input
                type="number"
                name="weather.temperature"
                value={formData.weather.temperature}
                onChange={handleChange}
                min="0"
                max="130"
                className="w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Humidity (%)</label>
              <input
                type="number"
                name="weather.humidity"
                value={formData.weather.humidity}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Work Completed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Work Completed
          </label>
          <textarea
            name="workCompleted"
            value={formData.workCompleted}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Describe what was accomplished today..."
          />
        </div>

        {/* Work Planned */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Work Planned
          </label>
          <textarea
            name="workPlanned"
            value={formData.workPlanned}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Describe what's planned for tomorrow..."
          />
        </div>

        {/* Issues */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Issues / Delays
          </label>
          <textarea
            name="issues"
            value={formData.issues}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-lg border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
            placeholder="Any issues or delays today?..."
          />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Labor Count
            </label>
            <input
              type="number"
              name="laborCount"
              value={formData.laborCount}
              onChange={handleChange}
              min="0"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Safety Incidents
            </label>
            <input
              type="number"
              name="safetyIncidents"
              value={formData.safetyIncidents}
              onChange={handleChange}
              min="0"
              className="w-full rounded-lg border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Any other relevant information..."
          />
        </div>

        <div className="pt-4 border-t flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}/reports`)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                Saving...
              </span>
            ) : (
              'Create Report'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReport;
