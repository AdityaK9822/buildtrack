const Milestone = require('../models/Milestone');
const Project = require('../models/Project');

const getPendingApprovals = async (req, res) => {
  try {
    const milestones = await Milestone.find({ status: 'submitted' })
      .populate('projectId', 'name status')
      .populate('approvalRequest.requestedBy', 'name email')
      .sort({ 'approvalRequest.requestedAt': -1 });

    res.json({ success: true, data: milestones });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching pending approvals', error: error.message });
  }
};

const getApprovalHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const milestones = await Milestone.find({
      status: { $in: ['approved', 'rejected'] },
      'approval.approvedBy': req.user._id,
    })
      .populate('projectId', 'name')
      .populate('approvalRequest.requestedBy', 'name email')
      .sort({ 'approval.approvedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Milestone.countDocuments({
      status: { $in: ['approved', 'rejected'] },
      'approval.approvedBy': req.user._id,
    });

    res.json({
      success: true,
      data: milestones,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching approval history', error: error.message });
  }
};

const approveMilestone = async (req, res) => {
  const milestoneController = require('./milestoneController');
  return milestoneController.approveMilestone(req, res);
};

module.exports = { getPendingApprovals, getApprovalHistory, approveMilestone };
