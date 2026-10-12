const Milestone = require('../models/Milestone');
const Task = require('../models/Task');
const Photo = require('../models/Photo');
const Project = require('../models/Project');
const socketService = require('../services/socket.service');
const fcmService = require('../services/fcm.service');

const getMilestones = async (req, res) => {
  try {
    const { projectId, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (projectId) {
      query.projectId = projectId;
    }

    const milestones = await Milestone.find(query)
      .populate('projectId', 'name status')
      .populate('approvalRequest.requestedBy', 'name email')
      .populate('approval.approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Milestone.countDocuments(query);

    res.json({
      success: true,
      data: milestones,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching milestones',
      error: error.message,
    });
  }
};

const getMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id)
      .populate('projectId')
      .populate('tasks')
      .populate('approvalRequest.requestedBy', 'name email')
      .populate('approval.approvedBy', 'name email');

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    res.json({
      success: true,
      data: milestone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching milestone',
      error: error.message,
    });
  }
};

const createMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.create(req.body);

    // Add milestone to project
    await Project.findByIdAndUpdate(milestone.projectId, {
      $push: { milestones: milestone._id },
    });

    const populatedMilestone = await Milestone.findById(milestone._id)
      .populate('projectId', 'name status');

    res.status(201).json({
      success: true,
      message: 'Milestone created successfully',
      data: populatedMilestone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating milestone',
      error: error.message,
    });
  }
};

const updateMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    // Broadcast update via socket
    socketService.broadcastProgress(milestone.projectId, {
      type: 'milestone-update',
      milestoneId: milestone._id,
      message: 'Milestone updated',
    });

    res.json({
      success: true,
      message: 'Milestone updated successfully',
      data: milestone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating milestone',
      error: error.message,
    });
  }
};

const requestApproval = async (req, res) => {
  try {
    const milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      {
        status: 'submitted',
        approvalRequest: {
          requestedAt: new Date(),
          requestedBy: req.user._id,
          message: req.body.message,
        },
      },
      { new: true }
    ).populate('projectId');

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    // Notify architect
    const project = await Project.findById(milestone.projectId._id).populate('architectId');
    if (project.architectId) {
      await fcmService.sendToUser(project.architectId._id, {
        title: 'Approval Request',
        message: `Milestone "${milestone.name}" awaits your approval`,
        type: 'milestone-submitted',
        relatedProject: project._id,
        relatedMilestone: milestone._id,
      });
    }

    res.json({
      success: true,
      message: 'Approval requested successfully',
      data: milestone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error requesting approval',
      error: error.message,
    });
  }
};

const approveMilestone = async (req, res) => {
  try {
    const { status, comments, signature } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected',
      });
    }

    const milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      {
        status,
        approval: {
          approvedAt: new Date(),
          approvedBy: req.user._id,
          comments,
          signature,
        },
      },
      { new: true }
    )
      .populate('projectId')
      .populate('approvalRequest.requestedBy');

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    // Broadcast approval via socket
    socketService.broadcastMilestoneApproval(
      milestone._id,
      status,
      milestone.projectId._id
    );

    // Send notifications
    const project = await Project.findById(milestone.projectId._id);
    
    if (status === 'approved') {
      await fcmService.sendMilestoneApproval(
        milestone,
        project._id,
        project.clientId
      );
    } else {
      await fcmService.sendToUser(milestone.approvalRequest.requestedBy._id, {
        title: 'Milestone Rejected',
        message: `Milestone "${milestone.name}" was rejected. ${comments}`,
        type: 'milestone-rejected',
        relatedProject: project._id,
        relatedMilestone: milestone._id,
      });
    }

    res.json({
      success: true,
      message: `Milestone ${status} successfully`,
      data: milestone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving milestone',
      error: error.message,
    });
  }
};

module.exports = {
  getMilestones,
  getMilestone,
  createMilestone,
  updateMilestone,
  requestApproval,
  approveMilestone,
};
