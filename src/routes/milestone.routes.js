const express = require('express');
const router = express.Router();
const milestoneController = require('../controllers/milestoneController');
const authenticate = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { milestoneSchema } = require('../utils/validators');

router.use(authenticate);

router.get('/', milestoneController.getMilestones);
router.get('/:id', milestoneController.getMilestone);
router.post('/', authorize('admin', 'contractor'), validate(milestoneSchema), milestoneController.createMilestone);
router.put('/:id', authorize('admin', 'contractor'), milestoneController.updateMilestone);
router.post('/:id/request-approval', authorize('contractor'), milestoneController.requestApproval);
router.put('/:id/approve', authorize('architect', 'admin'), milestoneController.approveMilestone);

module.exports = router;
