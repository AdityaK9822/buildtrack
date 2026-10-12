const Task = require('../models/Task');
const socketService = require('../services/socket.service');

const getTasks = async (req, res) => {
  try {
    const { projectId, milestoneId, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (projectId) query.projectId = projectId;
    if (milestoneId) query.milestoneId = milestoneId;
    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate('projectId', 'name')
      .populate('milestoneId', 'name')
      .populate('assignedTo', 'name email role')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: tasks,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching tasks', error: error.message });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('milestoneId', 'name')
      .populate('assignedTo', 'name email role')
      .populate('dependencies');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching task', error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);

    if (req.body.milestoneId) {
      const Milestone = require('../models/Milestone');
      await Milestone.findByIdAndUpdate(req.body.milestoneId, {
        $push: { tasks: task._id },
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('projectId', 'name')
      .populate('milestoneId', 'name')
      .populate('assignedTo', 'name email');

    // Notify assigned users
    if (task.assignedTo && task.assignedTo.length > 0) {
      const fcmService = require('../services/fcm.service');
      for (const userId of task.assignedTo) {
        await fcmService.sendToUser(userId, {
          title: 'New Task Assigned',
          message: `You have been assigned to "${task.name}"`,
          type: 'task-assigned',
          relatedProject: task.projectId,
        });
      }
    }

    res.status(201).json({ success: true, message: 'Task created successfully', data: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating task', error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('projectId', 'name')
      .populate('milestoneId', 'name')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    socketService.broadcastProgress(task.projectId._id, {
      type: 'task-update',
      taskId: task._id,
      message: 'Task updated',
    });

    res.json({ success: true, message: 'Task updated successfully', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating task', error: error.message });
  }
};

const completeTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', completedAt: new Date() },
      { new: true }
    ).populate('projectId');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    socketService.broadcastProgress(task.projectId._id, {
      type: 'task-completed',
      taskId: task._id,
      message: 'Task completed',
    });

    res.json({ success: true, message: 'Task marked as completed', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error completing task', error: error.message });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, completeTask };
