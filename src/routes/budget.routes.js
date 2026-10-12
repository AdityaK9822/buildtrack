const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authenticate = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { budgetSchema } = require('../utils/validators');

router.use(authenticate);

router.get('/', budgetController.getBudgets);
router.get('/project/:projectId', budgetController.getProjectBudget);
router.post('/', authorize('admin', 'contractor'), validate(budgetSchema), budgetController.createBudget);
router.put('/project/:projectId', authorize('admin', 'contractor'), budgetController.updateBudget);
router.post('/project/:projectId/item', authorize('admin', 'contractor', 'architect'), budgetController.addBudgetItem);

module.exports = router;
