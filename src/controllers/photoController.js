const Photo = require('../models/Photo');
const storageService = require('../services/storage.service');
const socketService = require('../services/socket.service');

const getPhotos = async (req, res) => {
  try {
    const { projectId, milestoneId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (projectId) query.projectId = projectId;
    if (milestoneId) query.milestoneId = milestoneId;

    const photos = await Photo.find(query)
      .populate('projectId', 'name')
      .populate('milestoneId', 'name')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Photo.countDocuments(query);

    res.json({
      success: true,
      data: photos,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching photos', error: error.message });
  }
};

const getPhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('milestoneId', 'name')
      .populate('uploadedBy', 'name email');

    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    res.json({ success: true, data: photo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching photo', error: error.message });
  }
};

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { projectId, milestoneId, caption, tags } = req.body;

    const folder = milestoneId
      ? `projects/${projectId}/milestones/${milestoneId}`
      : `projects/${projectId}`;

    const photoUrl = await storageService.uploadPhoto(req.file, folder);

    const photo = await Photo.create({
      projectId,
      milestoneId,
      uploadedBy: req.user._id,
      url: photoUrl,
      caption,
      tags: tags ? tags.split(',') : [],
      metadata: {
        capturedAt: new Date(),
        device: req.headers['user-agent'],
      },
    });

    const populatedPhoto = await Photo.findById(photo._id)
      .populate('projectId', 'name')
      .populate('milestoneId', 'name')
      .populate('uploadedBy', 'name email');

    socketService.broadcastPhoto(projectId, populatedPhoto);

    res.status(201).json({ success: true, message: 'Photo uploaded successfully', data: populatedPhoto });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading photo', error: error.message });
  }
};

const uploadDronePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { projectId, milestoneId, caption, altitude, flightId } = req.body;

    const folder = `projects/${projectId}/drone`;
    const photoUrl = await storageService.uploadPhoto(req.file, folder);

    const photo = await Photo.create({
      projectId,
      milestoneId,
      uploadedBy: req.user._id,
      url: photoUrl,
      caption,
      isDronePhoto: true,
      droneData: {
        altitude: parseFloat(altitude) || 0,
        flightId,
      },
    });

    const populatedPhoto = await Photo.findById(photo._id)
      .populate('projectId', 'name')
      .populate('uploadedBy', 'name email');

    res.status(201).json({ success: true, message: 'Drone photo uploaded successfully', data: populatedPhoto });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading drone photo', error: error.message });
  }
};

const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    await storageService.deletePhoto(photo.url);
    await photo.deleteOne();

    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting photo', error: error.message });
  }
};

module.exports = { getPhotos, getPhoto, uploadPhoto, uploadDronePhoto, deletePhoto };
