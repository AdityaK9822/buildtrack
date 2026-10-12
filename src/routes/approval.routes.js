const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const authenticate = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { approvalSchema } = require('../utils/validators');

router.use(authenticate);

router.get('/pending', authorize('architect', 'admin'), approvalController.getPendingApprovals);
router.get('/history', authorize('architect', 'admin'), approvalController.getApprovalHistory);
router.put('/milestones/:id', authorize('architect', 'admin'), validate(approvalSchema), approvalController.approveMilestone);

module.exports = router;
