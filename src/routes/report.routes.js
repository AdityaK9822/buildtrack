const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticate = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { reportSchema } = require('../utils/validators');

router.use(authenticate);

router.get('/', reportController.getReports);
router.get('/:id', reportController.getReport);
router.post('/', authorize('admin', 'contractor'), validate(reportSchema), reportController.createReport);
router.put('/:id', authorize('admin', 'contractor'), reportController.updateReport);
router.delete('/:id', authorize('admin', 'contractor'), reportController.deleteReport);

module.exports = router;
