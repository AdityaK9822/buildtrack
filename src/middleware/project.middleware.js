const Project = require('../models/Project');
const { ErrorResponse } = require('../utils/helpers');

const resolveProject = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.slug;
    const projectSlug = req.params.slug || req.params.id;

    let project;

    // Try to find by slug first, then by ID for backward compatibility
    if (projectSlug) {
      project = await Project.findOne({
        $or: [{ _id: projectSlug }, { slug: projectSlug }],
      });
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

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  resolveProject,
};
