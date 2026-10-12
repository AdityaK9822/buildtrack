import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { materialAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const MaterialsList = () => {
  const { _idOrSlug: projectId } = useParams();
  const { user } = useAuth();
  
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, [projectId, filter, search]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const params = { projectId };
      if (filter !== 'all') params.category = filter;
      if (search) params.search = search;
      
      const response = await materialAPI.getAll(projectId, params);
      setMaterials(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    
    try {
      await materialAPI.delete(id);
      setMaterials(materials.filter(m => m._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete material');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ordered': return 'bg-gray-100 text-gray-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'installed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryStatus = (material) => material.deliveryStatus || material.status;

  const getCategoryColor = (category) => {
    const colors = {
      concrete: 'bg-gray-200',
      steel: 'bg-slate-400',
      wood: 'bg-amber-700',
      electrical: 'bg-yellow-400',
      plumbing: 'bg-blue-400',
      paint: 'bg-pink-400',
      other: 'bg-gray-300',
    };
    return colors[category] || 'bg-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const categories = ['all', 'concrete', 'steel', 'wood', 'electrical', 'plumbing', 'paint', 'other'];
  const totalCost = materials.reduce((sum, m) => sum + (m.totalCost || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 mt-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Materials</h2>
            <p className="text-gray-500 text-sm">Manage project materials and inventory</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-2xl font-bold text-green-600">${totalCost.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <Link
              to={`/projects/${projectId}/materials/create`}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center font-medium"
            >
              + Add Material
            </Link>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Materials Grid */}
      {materials.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No materials found</h3>
          <p className="text-gray-500 mt-1">Get started by adding your first material</p>
          <Link
            to={`/projects/${projectId}/materials/create`}
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add First Material
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <div key={material._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg ${getCategoryColor(material.category)} flex items-center justify-center text-white font-bold text-sm`}>
                    {material.category.substring(0, 2)}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{material.name}</h3>
                    <p className="text-sm text-gray-500">{material.category}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getDeliveryStatus(material))}`}>
                  {getDeliveryStatus(material)}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span className="font-medium">{material.quantity} {material.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unit Cost:</span>
                  <span className="font-medium">${material.unitCost?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span className="font-semibold text-gray-900">${material.totalCost?.toLocaleString()}</span>
                </div>
              </div>
              
              {material.supplier && (
                <p className="mt-3 text-sm text-gray-500">
                  Supplier: {material.supplier}
                </p>
              )}
              
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {material.orderDate && <span>Ordered: {new Date(material.orderDate).toLocaleDateString()}</span>}
                  {material.expectedDelivery && <span className="ml-2">Expected: {new Date(material.expectedDelivery).toLocaleDateString()}</span>}
                </div>
                <button
                  onClick={() => deleteMaterial(material._id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialsList;
