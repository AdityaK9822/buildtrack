import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { budgetAPI, projectAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const BudgetDashboard = () => {
  const { _idOrSlug: projectId } = useParams();
  
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchBudget();
  }, [projectId]);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const response = await budgetAPI.getByProject(projectId);
      setBudget(response.data.data);
      setError('');
    } catch (err) {
      // If budget doesn't exist, show creating state
      if (err.response?.status === 404) {
        setBudget(null);
        setIsCreating(true);
      } else {
        setError(err.response?.data?.message || 'Failed to load budget');
      }
    } finally {
      setLoading(false);
    }
  };

  const budgetCategories = [
    { name: 'Materials', color: 'bg-blue-500', estimated: 2000000, actual: 1800000 },
    { name: 'Labor', color: 'bg-green-500', estimated: 1500000, actual: 1450000 },
    { name: 'Equipment', color: 'bg-yellow-500', estimated: 800000, actual: 750000 },
    { name: 'Permits', color: 'bg-purple-500', estimated: 200000, actual: 200000 },
    { name: 'Contingency', color: 'bg-gray-500', estimated: 500000, actual: 400000 },
  ];

  const totalEstimated = budgetCategories.reduce((sum, cat) => sum + cat.estimated, 0);
  const totalActual = budgetCategories.reduce((sum, cat) => sum + cat.actual, 0);
  const remaining = totalEstimated - totalActual;
  const percentageUsed = ((totalActual / totalEstimated) * 100).toFixed(1);

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
    <div className="max-w-7xl mx-auto px-4 py-6 mt-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Budget Dashboard</h2>
            <p className="text-gray-500 text-sm">Track project costs and budget usage</p>
          </div>
          {!budget && (
            <button
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              + Create Budget
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Budget Overview Cards */}
      {!isCreating && budget && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Total Estimated</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalEstimated)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalActual)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Remaining</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(remaining)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Budget Used</p>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2.5 mr-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(percentageUsed, 100)}%` }}></div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{percentageUsed}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Budget Categories */}
      {!isCreating && budget && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <div className="space-y-4">
              {budgetCategories.map((cat) => {
                const percentage = ((cat.actual / cat.estimated) * 100).toFixed(0);
                const isOverBudget = percentage > 100;
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${cat.color}`}></div>
                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {formatCurrency(cat.actual)} / {formatCurrency(cat.estimated)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${isOverBudget ? 'bg-red-500' : cat.color} h-2 rounded-full`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">{isOverBudget ? 'Over budget!' : `${percentage}% used`}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Budget Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Category</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-500">Estimated</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-500">Actual</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-500">Variance</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {budgetCategories.map((cat) => {
                    const variance = cat.actual - cat.estimated;
                    const isOverBudget = variance > 0;
                    return (
                      <tr key={cat.name} className="border-b border-gray-100">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className={`w-2.5 h-2.5 rounded-full mr-2 ${cat.color}`}></div>
                            <span className="text-gray-700">{cat.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right text-gray-600">{formatCurrency(cat.estimated)}</td>
                        <td className="py-3 text-right font-medium text-gray-700">{formatCurrency(cat.actual)}</td>
                        <td className={`py-3 text-right font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                          {isOverBudget ? '+' : ''}{formatCurrency(variance)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td className="py-3 text-right">Total</td>
                    <td className="py-3 text-right">{formatCurrency(totalEstimated)}</td>
                    <td className="py-3 text-right">{formatCurrency(totalActual)}</td>
                    <td className="py-3 text-right">{formatCurrency(totalActual - totalEstimated)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Budget Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Budget</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Estimated Budget
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
              type="number"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-7"
                  placeholder="Enter total estimated budget"
                  defaultValue={5000000}
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">Category Allocation</h4>
              <div className="space-y-3">
                {budgetCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center space-x-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`}></div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-700">{cat.name}</label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                        <input
                          type="number"
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-7 text-sm"
                          placeholder="Amount"
                          defaultValue={cat.estimated}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => { setIsCreating(false); setBudget(null); }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save budget logic would go here
                  setIsCreating(false);
                  fetchBudget();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isCreating && !budget && !error && (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No Budget Found</h3>
          <p className="text-gray-500 mt-1">Create a budget to track project expenses</p>
        </div>
      )}
    </div>
  );
};

export default BudgetDashboard;
