const { ErrorResponse } = require('../utils/helpers');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};

const checkProjectAccess = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const projectId = req.params.projectId || req.params.id || req.body.projectId;
    const _idOrSlug = req.params._idOrSlug;
    
    if (!projectId && !_idOrSlug) {
      return next();
    }

    // Use the project from middleware if available
    if (req.project) {
      req.projectId = req.project._id;
      req.projectSlug = req.project.slug;
      return next();
    }

    // Try to find by slug first, then by ID
    let project;
    if (_idOrSlug) {
      project = await Project.findOne({
        $or: [{ _id: _idOrSlug }, { slug: _idOrSlug }],
      });
    } else {
      project = await Project.findById(projectId);
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    req.project = project;
    req.projectId = project._id;
    req.projectSlug = project.slug;
    
    const userId = req.user._id.toString();
    const isClient = project.clientId.toString() === userId;
    const isContractor = project.contractorId.toString() === userId;
    const isArchitect = project.architectId?.toString() === userId;
    const isTeamMember = project.team.some(member => member.toString() === userId);
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isContractor && !isArchitect && !isTeamMember && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking project access',
      error: error.message,
    });
  }
};

module.exports = { authorize, checkProjectAccess };
