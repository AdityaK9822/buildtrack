import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, milestoneAPI, taskAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProjectDetail = () => {
  const { _idOrSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ name: '', description: '', startDate: '', endDate: '' });
  const [taskForm, setTaskForm] = useState({ name: '', description: '', milestone: '', priority: 'medium' });

  useEffect(() => {
    fetchProjectData();
  }, [_idOrSlug]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, milestonesRes, tasksRes] = await Promise.all([
        projectAPI.getBySlug(_idOrSlug),
        milestoneAPI.getAll(_idOrSlug),
        taskAPI.getAll(_idOrSlug),
      ]);
      
      setProject(projectRes.data.data);
      setMilestones(milestonesRes.data.data || []);
      setTasks(tasksRes.data.data || []);
    } catch (err) {
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'planning': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    try {
      await milestoneAPI.create({ 
        ...milestoneForm,
        projectId: id,
        startDate: milestoneForm.startDate || new Date().toISOString().split('T')[0]
      });
      setMilestoneForm({ name: '', description: '', startDate: '', endDate: '' });
      setShowMilestoneForm(false);
      fetchProjectData();
    } catch (err) {
      setError('Failed to create milestone');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskAPI.create({ ...taskForm, projectId: id });
      setTaskForm({ name: '', description: '', milestone: '', priority: 'medium' });
      setShowTaskForm(false);
      fetchProjectData();
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await taskAPI.complete(taskId);
      fetchProjectData();
    } catch (err) {
      setError('Failed to complete task');
    }
  };

  const canCreate = ['admin', 'contractor'].includes(user?.role);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <p className="text-center text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 text-blue-600 hover:text-blue-700"
      >
        ← Back to Dashboard
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <span className={`inline-block mt-2 px-3 py-1 rounded text-sm font-medium ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
        </div>

        <p className="text-gray-600 mb-4">{project.description || 'No description'}</p>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="bg-gray-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Estimated Budget</p>
            <p className="font-semibold">${project.budget?.estimated?.toLocaleString() || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">Actual Budget</p>
            <p className="font-semibold">${project.budget?.actual?.toLocaleString() || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">Start Date</p>
            <p className="font-semibold">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">End Date</p>
            <p className="font-semibold">{project.estimatedEndDate ? new Date(project.estimatedEndDate).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Milestones</h2>
          {canCreate && (
            <button
              onClick={() => setShowMilestoneForm(!showMilestoneForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
            >
              {showMilestoneForm ? 'Cancel' : '+ Add Milestone'}
            </button>
          )}
        </div>

        {showMilestoneForm && (
          <form onSubmit={handleCreateMilestone} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <input
              type="text"
              placeholder="Milestone Name"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
              value={milestoneForm.name}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
              value={milestoneForm.description}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
            />
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
              value={milestoneForm.dueDate}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Create Milestone
            </button>
          </form>
        )}

        {milestones.length === 0 ? (
          <p className="text-gray-500">No milestones yet</p>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{milestone.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(milestone.status)}`}>
                    {milestone.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{milestone.description || 'No description'}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Progress: {milestone.progress || 0}%</span>
                  {milestone.dueDate && <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          {canCreate && (
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
            >
              {showTaskForm ? 'Cancel' : '+ Add Task'}
            </button>
          )}
        </div>

        {showTaskForm && (
          <form onSubmit={handleCreateTask} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <input
              type="text"
              placeholder="Task Name"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
              value={taskForm.name}
              onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            />
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
              value={taskForm.milestone}
              onChange={(e) => setTaskForm({ ...taskForm, milestone: e.target.value })}
            >
              <option value="">Select Milestone (optional)</option>
              {milestones.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Create Task
            </button>
          </form>
        )}

        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks yet</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task._id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{task.name}</h3>
                  <p className="text-sm text-gray-600">{task.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status}
                  </span>
                  {task.status !== 'completed' && canCreate && (
                    <button
                      onClick={() => handleCompleteTask(task._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
