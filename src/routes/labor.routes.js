const express = require('express');
const router = express.Router();
const laborController = require('../controllers/laborController');
const authenticate = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { laborSchema } = require('../utils/validators');

router.use(authenticate);

router.get('/', laborController.getLabors);
router.get('/:id', laborController.getLabor);
router.get('/summary/project/:projectId', laborController.getLaborSummary);
router.post('/', authorize('admin', 'contractor'), validate(laborSchema), laborController.createLabor);
router.put('/:id', authorize('admin', 'contractor'), laborController.updateLabor);
router.delete('/:id', authorize('admin', 'contractor'), laborController.deleteLabor);

module.exports = router;
