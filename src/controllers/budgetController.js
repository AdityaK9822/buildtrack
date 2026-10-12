const Budget = require('../models/Budget');
const socketService = require('../services/socket.service');
const fcmService = require('../services/fcm.service');

const getBudgets = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const budgets = await Budget.find()
      .populate('projectId', 'name status budget')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Budget.countDocuments();

    res.json({
      success: true,
      data: budgets,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching budgets', error: error.message });
  }
};

const getProjectBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ projectId: req.params.projectId }).populate(
      'projectId',
      'name budget'
    );

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    const utilizationPercentage = Math.round((budget.totalActual / budget.totalEstimated) * 100);

    res.json({
      success: true,
      data: {
        ...budget.toObject(),
        utilizationPercentage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching budget', error: error.message });
  }
};

const createBudget = async (req, res) => {
  try {
    const budget = await Budget.create(req.body);

    const populatedBudget = await Budget.findById(budget._id).populate('projectId', 'name');

    res.status(201).json({ success: true, message: 'Budget created successfully', data: populatedBudget });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating budget', error: error.message });
  }
};

const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { projectId: req.params.projectId },
      { categories: req.body.categories },
      { new: true, runValidators: true }
    ).populate('projectId', 'name');

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    // Check if budget exceeded
    const project = await require('../models/Project').findById(budget.projectId);
    if (budget.totalActual > project.budget.estimated * 0.8) {
      await fcmService.sendToMultiple([project.clientId, project.contractorId], {
        title: 'Budget Alert',
        message: `Budget has reached ${Math.round((budget.totalActual / project.budget.estimated) * 100)}% of estimated`,
        type: 'budget-update',
        relatedProject: budget.projectId,
      });
    }

    socketService.broadcastProgress(budget.projectId, {
      type: 'budget-update',
      message: 'Budget updated',
    });

    res.json({ success: true, message: 'Budget updated successfully', data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating budget', error: error.message });
  }
};

const addBudgetItem = async (req, res) => {
  try {
    const { categoryIndex, item } = req.body;

    const budget = await Budget.findOne({ projectId: req.params.projectId });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (!budget.categories[categoryIndex]) {
      return res.status(400).json({ success: false, message: 'Invalid category index' });
    }

    budget.categories[categoryIndex].items.push(item);
    await budget.save();

    const updatedBudget = await Budget.findById(budget._id).populate('projectId', 'name');

    res.json({ success: true, message: 'Budget item added successfully', data: updatedBudget });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding budget item', error: error.message });
  }
};

module.exports = { getBudgets, getProjectBudget, createBudget, updateBudget, addBudgetItem };
