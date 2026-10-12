import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { photoAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const PhotoGallery = () => {
  const { _idOrSlug: projectId } = useParams();
  
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, [projectId, filter]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.type = filter;
      
      const response = await photoAPI.getAll(projectId, params);
      setPhotos(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (id) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      await photoAPI.delete(id);
      setPhotos(photos.filter(p => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete photo');
    }
  };

  const typeColors = {
    progress: 'bg-blue-100 text-blue-800',
    drone: 'bg-purple-100 text-purple-800',
    issue: 'bg-red-100 text-red-800',
    completion: 'bg-green-100 text-green-800',
  };

  const getType = (photo) => {
    if (photo.isDronePhoto) return 'drone';
    return 'progress';
  };

  const typeIcons = {
    progress: '📊',
    drone: '🚁',
    issue: '⚠️',
    completion: '✅',
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
            <h2 className="text-2xl font-bold text-gray-900">Photo Gallery</h2>
            <p className="text-gray-500 text-sm">Visual documentation of your project</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = `/projects/${projectId}/photos/upload`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              📷 Upload Photo
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'progress', 'drone', 'issue', 'completion'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === type
                ? typeColors[type] || 'bg-gray-100 text-gray-800'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No photos yet</h3>
          <p className="text-gray-500 mt-1">Upload your first photo to document the project</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={photo.url || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={photo.caption || 'Project photo'}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span className={`${typeColors[getType(photo)] || 'bg-gray-100'} px-2 py-1 rounded-full text-xs font-medium`}>
                    {typeIcons[getType(photo)]} {getType(photo)}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                {photo.caption && (
                  <p className="text-sm text-gray-700 mb-2">{photo.caption}</p>
                )}
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(photo.createdAt || photo.date).toLocaleDateString()}</span>
                  <span>{photo.metadata?.device ? '📷' : ''}</span>
                </div>
                
                <div className="mt-3 pt-3 border-t flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    {photo.isDronePhoto ? '📷 Drone Photo' : '📷 Regular'}
                  </span>
                  <button
                    onClick={() => deletePhoto(photo._id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
          >
            ×
          </button>
          <div className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption}
              className="max-w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
