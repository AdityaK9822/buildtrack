const mongoose = require('mongoose');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');
const Material = require('../models/Material');
const Labor = require('../models/Labor');
const Budget = require('../models/Budget');
const Photo = require('../models/Photo');
const socketService = require('../services/socket.service');

const getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by user role
    if (req.user.role === 'client') {
      query.clientId = req.user._id;
    } else if (req.user.role === 'contractor') {
      query.contractorId = req.user._id;
    } else if (req.user.role === 'architect') {
      query.architectId = req.user._id;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(query)
      .populate('clientId', 'name email phone company')
      .populate('contractorId', 'name email phone company')
      .populate('architectId', 'name email phone company')
      .populate('team', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message,
    });
  }
};

const getProject = async (req, res) => {
  try {
    const _idOrSlug = req.params._idOrSlug || req.params.id;
    const project = await Project.findOne({
      $or: [{ _id: _idOrSlug }, { slug: _idOrSlug }],
    })
      .populate('clientId', 'name email phone company')
      .populate('contractorId', 'name email phone company')
      .populate('architectId', 'name email phone company')
      .populate('team', 'name email role');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message,
    });
  }
};

const createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);

    // Create initial budget
    await Budget.create({
      projectId: project._id,
      categories: [
        { name: 'Materials', estimated: 0 },
        { name: 'Labor', estimated: 0 },
        { name: 'Equipment', estimated: 0 },
        { name: 'Permits & Fees', estimated: 0 },
      ],
    });

    const populatedProject = await Project.findById(project._id)
      .populate('clientId', 'name email phone company')
      .populate('contractorId', 'name email phone company')
      .populate('architectId', 'name email phone company');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: populatedProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const _idOrSlug = req.params._idOrSlug || req.params.id;
    const project = await Project.findOne({
      $or: [{ _id: _idOrSlug }, { slug: _idOrSlug }],
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    Object.assign(project, req.body);
    await project.save();

    // Populate after save
    await project.populate('clientId contractorId architectId team');

    // Broadcast update via socket
    socketService.broadcastProgress(project._id, {
      type: 'project-update',
      message: 'Project details updated',
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const _idOrSlug = req.params._idOrSlug || req.params.id;
    const project = await Project.findOne({
      $or: [{ _id: _idOrSlug }, { slug: _idOrSlug }],
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Delete related data
    await Milestone.deleteMany({ projectId: project._id });
    await Task.deleteMany({ projectId: project._id });
    await Material.deleteMany({ projectId: project._id });
    await Labor.deleteMany({ projectId: project._id });
    await Budget.deleteOne({ projectId: project._id });
    await Photo.deleteMany({ projectId: project._id });

    await project.deleteOne();

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message,
    });
  }
};

const getProjectDashboard = async (req, res) => {
  try {
    const _idOrSlug = req.params._idOrSlug || req.params.id;
    const project = await Project.findOne({
      $or: [{ _id: _idOrSlug }, { slug: _idOrSlug }],
    });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Get statistics
    const milestones = await Milestone.find({ projectId });
    const tasks = await Task.find({ projectId });
    const materials = await Material.find({ projectId });
    const labor = await Labor.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: null, totalHours: { $sum: '$hoursWorked' }, totalCost: { $sum: '$totalEarnings' } } },
    ]);
    const budget = await Budget.findOne({ projectId });
    const recentPhotos = await Photo.find({ projectId }).sort({ createdAt: -1 }).limit(5);

    const stats = {
      project,
      milestoneStats: {
        total: milestones.length,
        approved: milestones.filter(m => m.status === 'approved').length,
        pending: milestones.filter(m => m.status === 'pending').length,
        inProgress: milestones.filter(m => m.status === 'in-progress').length,
      },
      taskStats: {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
      },
      materialStats: {
        total: materials.length,
        delivered: materials.filter(m => m.deliveryStatus === 'delivered').length,
        totalCost: materials.reduce((sum, m) => sum + (m.totalCost || 0), 0),
      },
      laborStats: {
        totalHours: labor[0]?.totalHours || 0,
        totalCost: labor[0]?.totalCost || 0,
      },
      budget,
      recentPhotos,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard',
      error: error.message,
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectDashboard,
};
