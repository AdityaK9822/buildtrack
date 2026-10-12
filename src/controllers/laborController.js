const Labor = require('../models/Labor');

const getLabors = async (req, res) => {
  try {
    const { projectId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (projectId) query.projectId = projectId;

    const labors = await Labor.find(query)
      .populate('projectId', 'name')
      .populate('approvedBy', 'name')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Labor.countDocuments(query);

    res.json({
      success: true,
      data: labors,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching labor records', error: error.message });
  }
};

const getLabor = async (req, res) => {
  try {
    const labor = await Labor.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('approvedBy', 'name');

    if (!labor) {
      return res.status(404).json({ success: false, message: 'Labor record not found' });
    }

    res.json({ success: true, data: labor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching labor record', error: error.message });
  }
};

const createLabor = async (req, res) => {
  try {
    req.body.approvedBy = req.user._id;
    const labor = await Labor.create(req.body);

    const populatedLabor = await Labor.findById(labor._id)
      .populate('projectId', 'name')
      .populate('approvedBy', 'name');

    res.status(201).json({ success: true, message: 'Labor record created successfully', data: populatedLabor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating labor record', error: error.message });
  }
};

const updateLabor = async (req, res) => {
  try {
    const labor = await Labor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('projectId', 'name')
      .populate('approvedBy', 'name');

    if (!labor) {
      return res.status(404).json({ success: false, message: 'Labor record not found' });
    }

    res.json({ success: true, message: 'Labor record updated successfully', data: labor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating labor record', error: error.message });
  }
};

const deleteLabor = async (req, res) => {
  try {
    const labor = await Labor.findByIdAndDelete(req.params.id);

    if (!labor) {
      return res.status(404).json({ success: false, message: 'Labor record not found' });
    }

    res.json({ success: true, message: 'Labor record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting labor record', error: error.message });
  }
};

const getLaborSummary = async (req, res) => {
  try {
    const { projectId } = req.params;

    const summary = await Labor.aggregate([
      { $match: { projectId: new require('mongoose').Types.ObjectId(projectId) } },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$hoursWorked' },
          totalOvertime: { $sum: '$overtimeHours' },
          totalEarnings: { $sum: '$totalEarnings' },
          totalWorkers: { $sum: 1 },
          avgHourlyRate: { $avg: '$hourlyRate' },
        },
      },
    ]);

    const workerRoles = await Labor.aggregate([
      { $match: { projectId: new require('mongoose').Types.ObjectId(projectId) } },
      { $group: { _id: '$worker.role', count: { $sum: 1 }, hours: { $sum: '$hoursWorked' } } },
    ]);

    res.json({
      success: true,
      data: {
        summary: summary[0] || {},
        workerRoles,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching labor summary', error: error.message });
  }
};

module.exports = { getLabors, getLabor, createLabor, updateLabor, deleteLabor, getLaborSummary };
