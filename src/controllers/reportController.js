const Report = require('../models/Report');
const socketService = require('../services/socket.service');
const fcmService = require('../services/fcm.service');
const Project = require('../models/Project');

const getReports = async (req, res) => {
  try {
    const { projectId, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (projectId) query.projectId = projectId;

    const reports = await Report.find(query)
      .populate('projectId', 'name')
      .populate('reportedBy', 'name email role')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: reports,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reports', error: error.message });
  }
};

const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('reportedBy', 'name email role')
      .populate('photos');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching report', error: error.message });
  }
};

const createReport = async (req, res) => {
  try {
    req.body.reportedBy = req.user._id;
    const report = await Report.create(req.body);

    const populatedReport = await Report.findById(report._id)
      .populate('projectId', 'name')
      .populate('reportedBy', 'name email');

    // Notify stakeholders
    const project = await Project.findById(report.projectId).populate('clientId architectId');
    const stakeholders = [project.clientId, project.architectId].filter(Boolean);

    await fcmService.sendToMultiple(stakeholders.map(s => s._id), {
      title: 'New Daily Report',
      message: `Report: ${report.title}`,
      type: 'report-submitted',
      relatedProject: report.projectId,
    });

    // Broadcast via socket
    socketService.broadcastProgress(report.projectId, {
      type: 'report-submitted',
      reportId: report._id,
      message: report.title,
    });

    res.status(201).json({ success: true, message: 'Report created successfully', data: populatedReport });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating report', error: error.message });
  }
};

const updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('projectId', 'name')
      .populate('reportedBy', 'name email');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, message: 'Report updated successfully', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating report', error: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting report', error: error.message });
  }
};

module.exports = { getReports, getReport, createReport, updateReport, deleteReport };
