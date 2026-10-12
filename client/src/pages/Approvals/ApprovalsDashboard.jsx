import { useState, useEffect } from 'react';
import { approvalAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const ApprovalsDashboard = () => {
  const { user } = useAuth();
  
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await approvalAPI.getPending();
      setApprovals(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId, status) => {
    try {
      await approvalAPI.approve({
        approvalId,
        status,
        comments: comment,
        approverId: user._id,
      });
      
      setApprovals(approvals.filter(a => a._id !== approvalId));
      setComment('');
      setSelectedApproval(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process approval');
    }
  };

  if (user && user.role !== 'architect' && user.role !== 'admin') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Access Restricted</h2>
        <p className="text-gray-500 mt-2">This page is only accessible to Architects and Admins</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const pendingCount = approvals.filter(a => !a.status).length;
  const approvedCount = approvals.filter(a => a.status === 'approved').length;
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 mt-20">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Approvals Dashboard</h2>
        <p className="text-gray-500 text-sm">Manage milestone approvals and project requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'pending'
              ? 'bg-blue-100 text-blue-800'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'approved'
              ? 'bg-green-100 text-green-800'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'rejected'
              ? 'bg-red-100 text-red-800'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Approvals List */}
      {approvals.length === 0 && activeTab === 'pending' ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No Pending Approvals</h3>
          <p className="text-gray-500 mt-1">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => (
            <div key={approval._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">📋</span>
                    <h3 className="font-bold text-gray-900 text-lg">{approval.milestoneName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      approval.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : approval.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {approval.status ? approval.status.toUpperCase() : 'PENDING'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Submitted by: {approval.submittedByName}</p>
                  <p className="text-sm text-gray-500">
                    {approval.submittedAt && `On: ${new Date(approval.submittedAt).toLocaleDateString()}`}
                  </p>
                </div>
                {selectedApproval !== approval._id && !approval.status && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedApproval(approval._id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Review
                    </button>
                  </div>
                )}
              </div>
              
              {selectedApproval === approval._id && !approval.status && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">Review Details</h4>
                  
                  {approval.milestoneDetails && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Project:</p>
                      <p className="text-sm text-gray-700">{approval.milestoneDetails.projectName}</p>
                    </div>
                  )}
                  
                  {approval.milestoneDetails && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Budget:</p>
                        <p className="text-sm font-medium text-gray-700">
                          {approval.milestoneDetails.budget}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Due Date:</p>
                        <p className="text-sm font-medium text-gray-700">
                          {approval.milestoneDetails.dueDate}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Add your comments or feedback..."
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(approval._id, 'approved')}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApprove(approval._id, 'rejected')}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
              
              {approval.comments && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    {approval.status === 'approved' ? '✅ APPROVED' : '❌ REJECTED'}:
                  </p>
                  <p className="text-sm text-gray-600">{approval.comments}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalsDashboard;
