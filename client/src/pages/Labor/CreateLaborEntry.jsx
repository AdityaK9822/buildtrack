import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { laborAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const CreateLaborEntry = () => {
  const { _idOrSlug: projectId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    workerName: '',
    role: '',
    date: new Date().toISOString().split('T')[0],
    hoursWorked: 8,
    hourlyRate: 20,
    overtimeHours: 0,
    overtimeRate: 0,
    description: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const numValue = type === 'number' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const calculateEarnings = () => {
    const regular = (formData.hoursWorked || 0) * (formData.hourlyRate || 0);
    const overtime = (formData.overtimeHours || 0) * (formData.overtimeRate || 0);
    return (regular + overtime).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const regularHours = formData.hoursWorked || 0;
      const overtimeHours = formData.overtimeHours || 0;
      const regularRate = formData.hourlyRate || 0;
      const overtimeRate = formData.overtimeRate || 0;
      const regularEarnings = regularHours * regularRate;
      const overtimeEarnings = overtimeHours * overtimeRate;
      const totalEarnings = regularEarnings + overtimeEarnings;

      await laborAPI.create({
        ...formData,
        projectId,
        totalEarnings,
        overtimeRate: overtimeHours > 0 ? overtimeRate : regularRate * 1.5,
      });
      
      navigate(`/projects/${projectId}/labor`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create labor entry');
    } finally {
      setLoading(false);
    }
  };

  const commonRoles = ['Foreman', 'Laborer', 'Electrician', 'Plumber', 'Carpenter', 'Welder', 'Painter', 'Operator'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 mt-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Log Labor Entry</h2>
        <p className="text-gray-500 text-sm">Record daily worker hours and earnings</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Worker Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="workerName"
                value={formData.workerName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select role...</option>
                {commonRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Hourly Rates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Regular Hours
                </label>
                <input
                  type="number"
                  name="hoursWorked"
                  value={formData.hoursWorked}
                  onChange={handleChange}
                  min="0"
                  max="24"
                  className="w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Regular Rate ($/hr)
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200">
              <div className="flex justify-between">
                <span className="text-sm text-blue-600">Overtime (1.5x):</span>
                <span className="text-sm font-semibold text-blue-700">
                  ${(formData.hourlyRate * 1.5).toFixed(2)}/hr
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overtime Hours
              </label>
              <input
                type="number"
                name="overtimeHours"
                value={formData.overtimeHours}
                onChange={handleChange}
                min="0"
                max="8"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overtime Rate ($/hr)
              </label>
              <input
                type="number"
                name="overtimeRate"
                value={formData.overtimeRate}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe the work performed..."
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Earnings:</span>
              <span className="text-2xl font-bold text-green-600">
                ${calculateEarnings()}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}/labor`)}
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
              'Log Labor Entry'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLaborEntry;
