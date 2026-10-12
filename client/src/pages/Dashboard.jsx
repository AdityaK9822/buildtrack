import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data.data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'planning': 'bg-gray-100 text-gray-600 border-gray-200',
      'in-progress': 'bg-primary/10 text-primary border-primary/20',
      'on-hold': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'completed': 'bg-green-50 text-green-700 border-green-200',
      'cancelled': 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const canCreateProject = ['admin', 'contractor'].includes(user?.role);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-secondary mt-2 text-lg">Welcome back, <span className="text-textMain font-medium">{user?.name}</span></p>
        </div>

        {canCreateProject && (
          <Link
            to="/projects/create"
            className="bg-cta hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Project
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-8 transition-all duration-300">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-24 bg-white border border-dashed border-gray-300 rounded-3xl">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-secondary text-xl font-medium">No projects found</p>
          <p className="text-gray-400 mt-2 mb-6">Get started by creating your first construction project.</p>
          {canCreateProject && (
            <Link
              to="/projects/create"
              className="inline-flex items-center text-primary hover:text-cta font-semibold transition-colors duration-200 cursor-pointer group"
            >
              Create your first project
              <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project._id}
              className="group bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-heading font-bold text-slate-900 group-hover:text-primary transition-colors duration-200">
                  {project.name}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>

              <p className="text-secondary text-sm mb-6 line-clamp-2 leading-relaxed">
                {project.description || 'No project description provided.'}
              </p>

              <div className="mb-6">
                <div className="flex justify-between text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className="bg-primary h-full transition-all duration-500 ease-out"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-6 border border-gray-100">
                <span className="text-xs font-medium text-secondary uppercase">Est. Budget</span>
                <span className="text-sm font-heading font-bold text-textMain">
                  ${project.budget?.estimated?.toLocaleString() || '0'}
                </span>
              </div>

              <Link
                to={`/projects/${project._id}`}
                className="block w-full text-center bg-white border border-gray-200 text-textMain py-2.5 rounded-xl font-semibold transition-all duration-200 cursor-pointer hover:bg-primary hover:text-white hover:border-primary"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
