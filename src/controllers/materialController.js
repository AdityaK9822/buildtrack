const Material = require('../models/Material');
const socketService = require('../services/socket.service');

const getMaterials = async (req, res) => {
  try {
    const { projectId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (projectId) {
      // Check if projectId is a slug or an ObjectId
      const Project = require('../models/Project');
      const project = await Project.findOne({
        $or: [{ _id: projectId }, { slug: projectId }],
      });
      
      if (project) {
        query.projectId = project._id;
      } else {
        // If no project found, return empty materials
        return res.json({
          success: true,
          data: [],
          pagination: { total: 0, page: parseInt(page), pages: 0 },
        });
      }
    }

    const materials = await Material.find(query)
      .populate('projectId', 'name')
      .populate('receivedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Material.countDocuments(query);

    res.json({
      success: true,
      data: materials,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching materials', error: error.message });
  }
};

const getMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('receivedBy', 'name');

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    res.json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching material', error: error.message });
  }
};

const createMaterial = async (req, res) => {
  try {
    req.body.receivedBy = req.user._id;
    const material = await Material.create(req.body);

    const populatedMaterial = await Material.findById(material._id)
      .populate('projectId', 'name')
      .populate('receivedBy', 'name');

    if (material.deliveryStatus === 'delivered') {
      socketService.broadcastMaterialDelivery(material.projectId, {
        material: material.name,
        quantity: material.quantity,
        status: material.deliveryStatus,
      });
    }

    res.status(201).json({ success: true, message: 'Material added successfully', data: populatedMaterial });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating material', error: error.message });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('projectId', 'name')
      .populate('receivedBy', 'name');

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    if (req.body.deliveryStatus === 'delivered') {
      socketService.broadcastMaterialDelivery(material.projectId._id, {
        material: material.name,
        status: material.deliveryStatus,
      });
    }

    res.json({ success: true, message: 'Material updated successfully', data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating material', error: error.message });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting material', error: error.message });
  }
};

module.exports = { getMaterials, getMaterial, createMaterial, updateMaterial, deleteMaterial };
