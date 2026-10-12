import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const projectMatch = location.pathname.match(/^\/projects\/([^/]+)/);
  const projectId = projectMatch ? projectMatch[1] : null;

  // Context detection for logical button display
  const isCreatingProject = location.pathname === '/projects/create';
  const isCreatingItem = location.pathname.includes('/create') && location.pathname !== '/projects/create';
  const isInProject = location.pathname.startsWith('/projects/') && !isCreatingProject;
  const isViewingProjectDetails = projectId && !location.pathname.includes('/materials') && !location.pathname.includes('/labor') && !location.pathname.includes('/reports') && !location.pathname.includes('/photos') && !location.pathname.includes('/budget') && !isCreatingProject;
  
  // Tab class with disabled state support
  const tabClass = (isActive, isDisabled = false) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isDisabled
        ? 'opacity-40 cursor-not-allowed text-gray-400'
        : isActive
        ? 'bg-primary text-white shadow-sm cursor-pointer'
        : 'text-textMain hover:bg-primary/10 hover:text-primary cursor-pointer'
    }`;

  const menuLinkClass = (isActive) =>
    `block py-2 px-3 ${isActive ? 'bg-primary text-white' : 'text-secondary hover:bg-primary/10 hover:text-primary'} rounded transition-colors duration-200`;

  return (
    <nav className="fixed top-4 left-4 right-4 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm rounded-2xl px-4 py-3 flex justify-between items-center transition-all duration-300">
          <Link to="/" className="text-primary text-2xl font-heading font-bold tracking-tight cursor-pointer">
            BuildTrack
          </Link>

          {isAuthenticated && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-primary focus:outline-none cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}

          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-1 mr-4">
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${location.pathname === '/dashboard' ? 'bg-primary text-white shadow-sm' : 'text-textMain hover:bg-primary/10 hover:text-primary'}`}
                  >
                    Dashboard
                  </Link>

                  {/* Only show "New Project" when not creating a project */}
                  {!isCreatingProject && (
                    <Link
                      to="/projects/create"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${location.pathname === '/projects/create' ? 'bg-primary text-white shadow-sm' : 'text-textMain hover:bg-primary/10 hover:text-primary'}`}
                    >
                      New Project
                    </Link>
                  )}

                  {/* Show "Back" button when creating items within a project */}
                  {isCreatingItem && projectId && (
                    <div className="flex items-center space-x-2 border-l border-gray-200 ml-2 pl-2">
                      <button
                        onClick={() => navigate(-1)}
                        className="px-3 py-2 rounded-lg text-sm font-medium text-secondary hover:bg-gray-100 transition-all duration-200 cursor-pointer flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </button>
                      <span className="text-xs text-secondary px-2 py-1 bg-gray-100 rounded capitalize">
                        Creating {location.pathname.split('/').slice(-2)[0]}
                      </span>
                    </div>
                  )}

                  {/* Show project tabs when viewing a project (not during project creation) */}
                  {projectId && !isCreatingProject && (
                    <div className="flex items-center space-x-1 border-l border-gray-200 ml-2 pl-2">
                      <Link
                        to={`/projects/${projectId}`}
                        className={tabClass(isViewingProjectDetails)}
                      >
                        Overview
                      </Link>
                      
                      <Link
                        to={`/projects/${projectId}/materials`}
                        className={tabClass(location.pathname.includes('/materials'))}
                      >
                        Materials
                      </Link>
                      
                      <Link
                        to={`/projects/${projectId}/labor`}
                        className={tabClass(location.pathname.includes('/labor'))}
                      >
                        Labor
                      </Link>
                      
                      <Link
                        to={`/projects/${projectId}/reports`}
                        className={tabClass(location.pathname.includes('/reports'))}
                      >
                        Reports
                      </Link>
                      
                      <Link
                        to={`/projects/${projectId}/photos`}
                        className={tabClass(location.pathname.includes('/photos'))}
                      >
                        Photos
                      </Link>
                      
                      <Link
                        to={`/projects/${projectId}/budget`}
                        className={tabClass(location.pathname.includes('/budget'))}
                      >
                        Budget
                      </Link>
                    </div>
                  )}

                  {/* Show Approvals for architects/admins when not in project context */}
                  {(user?.role === 'architect' || user?.role === 'admin') && (
                    <Link
                      to="/approvals"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${location.pathname === '/approvals' ? 'bg-primary text-white shadow-sm' : 'text-textMain hover:bg-primary/10 hover:text-primary'}`}
                    >
                      Approvals
                    </Link>
                  )}
                </div>

                <div className="flex items-center space-x-4 border-l border-gray-200 pl-4">
                  <div className="text-right">
                    <p className="text-xs text-secondary font-medium uppercase tracking-wider">Welcome</p>
                    <p className="text-sm font-heading font-semibold text-textMain">{user?.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-secondary/20 text-secondary border border-secondary/30">
                      {user?.role}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-white border border-gray-200 hover:border-primary text-primary px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer hover:bg-primary/5"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-textMain hover:text-primary transition-all duration-200 px-3 py-2 text-sm font-medium cursor-pointer"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm cursor-pointer"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isAuthenticated && isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 p-2">
          <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-4 space-y-2">
            <Link to="/dashboard" className={menuLinkClass(location.pathname === '/dashboard')} onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </Link>
            
            {/* Only show "New Project" when not creating a project */}
            {!isCreatingProject && (
              <Link to="/projects/create" className={menuLinkClass(location.pathname === '/projects/create')} onClick={() => setIsMenuOpen(false)}>
                New Project
              </Link>
            )}

            {/* Show "Back" button when creating items within a project */}
            {isCreatingItem && projectId && (
              <>
                <button
                  onClick={() => { navigate(-1); setIsMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors duration-200 cursor-pointer flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <div className="text-xs text-secondary px-3 py-1 bg-gray-100 rounded capitalize">
                  Creating {location.pathname.split('/').slice(-2)[0]}
                </div>
              </>
            )}

            {/* Show project tabs when viewing a project (not during project creation) */}
            {projectId && !isCreatingProject && (
              <div className="pt-2 border-t border-gray-100 space-y-1">
                <Link to={`/projects/${projectId}`} className={menuLinkClass(isViewingProjectDetails)} onClick={() => setIsMenuOpen(false)}>
                  Overview
                </Link>
                
                <Link to={`/projects/${projectId}/materials`} className={menuLinkClass(location.pathname.includes('/materials'))} onClick={() => setIsMenuOpen(false)}>
                  Materials
                </Link>
                
                <Link to={`/projects/${projectId}/labor`} className={menuLinkClass(location.pathname.includes('/labor'))} onClick={() => setIsMenuOpen(false)}>
                  Labor
                </Link>
                
                <Link to={`/projects/${projectId}/reports`} className={menuLinkClass(location.pathname.includes('/reports'))} onClick={() => setIsMenuOpen(false)}>
                  Reports
                </Link>
                
                <Link to={`/projects/${projectId}/photos`} className={menuLinkClass(location.pathname.includes('/photos'))} onClick={() => setIsMenuOpen(false)}>
                  Photos
                </Link>
                
                <Link to={`/projects/${projectId}/budget`} className={menuLinkClass(location.pathname.includes('/budget'))} onClick={() => setIsMenuOpen(false)}>
                  Budget
                </Link>
              </div>
            )}

            {(user?.role === 'architect' || user?.role === 'admin') && (
              <Link to="/approvals" className={menuLinkClass(location.pathname === '/approvals')} onClick={() => setIsMenuOpen(false)}>
                Approvals
              </Link>
            )}

            <div className="pt-4 border-t border-gray-100">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-textMain">{user?.name}</p>
                <p className="text-xs text-secondary">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
