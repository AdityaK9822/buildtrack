const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticate = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { taskSchema } = require('../utils/validators');

router.use(authenticate);

router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTask);
router.post('/', authorize('admin', 'contractor'), validate(taskSchema), taskController.createTask);
router.put('/:id', authorize('admin', 'contractor'), taskController.updateTask);
router.put('/:id/complete', taskController.completeTask);

module.exports = router;
