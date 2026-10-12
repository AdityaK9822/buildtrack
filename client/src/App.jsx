import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Materials Pages
import MaterialsList from './pages/Materials/MaterialsList';
import CreateMaterial from './pages/Materials/CreateMaterial';

// Labor Pages
import LaborList from './pages/Labor/LaborList';
import CreateLaborEntry from './pages/Labor/CreateLaborEntry';

// Reports Pages
import ReportsList from './pages/Reports/ReportsList';
import CreateReport from './pages/Reports/CreateReport';

// Photo Pages
import PhotoGallery from './pages/Photos/PhotoGallery';
import UploadPhoto from './pages/Photos/UploadPhoto';

// Budget & Approvals
import BudgetDashboard from './pages/Budget/BudgetDashboard';
import ApprovalsDashboard from './pages/Approvals/ApprovalsDashboard';

// Main Pages
import ProjectDetail from './pages/ProjectDetail';
import CreateProject from './pages/CreateProject';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="mt-20">
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/projects/create"
              element={
                <ProtectedRoute>
                  <CreateProject />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/projects/:_idOrSlug"
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />
            
            {/* Materials Routes */}
            <Route
              path="/projects/:_idOrSlug/materials"
              element={
                <ProtectedRoute>
                  <MaterialsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:_idOrSlug/materials/create"
              element={
                <ProtectedRoute>
                  <CreateMaterial />
                </ProtectedRoute>
              }
            />
            
            {/* Labor Routes */}
            <Route
              path="/projects/:_idOrSlug/labor"
              element={
                <ProtectedRoute>
                  <LaborList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:_idOrSlug/labor/create"
              element={
                <ProtectedRoute>
                  <CreateLaborEntry />
                </ProtectedRoute>
              }
            />
            
            {/* Reports Routes */}
            <Route
              path="/projects/:_idOrSlug/reports"
              element={
                <ProtectedRoute>
                  <ReportsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:_idOrSlug/reports/create"
              element={
                <ProtectedRoute>
                  <CreateReport />
                </ProtectedRoute>
              }
            />
            
            {/* Photo Routes */}
            <Route
              path="/projects/:_idOrSlug/photos"
              element={
                <ProtectedRoute>
                  <PhotoGallery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:_idOrSlug/photos/upload"
              element={
                <ProtectedRoute>
                  <UploadPhoto />
                </ProtectedRoute>
              }
            />
            
            {/* Budget Routes */}
            <Route
              path="/projects/:_idOrSlug/budget"
              element={
                <ProtectedRoute>
                  <BudgetDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Approvals Route - only for architects/admins */}
            <Route
              path="/approvals"
              element={
                <ProtectedRoute>
                  <ApprovalsDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
