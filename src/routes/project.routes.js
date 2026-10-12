const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authenticate = require('../middleware/auth.middleware');
const { authorize, checkProjectAccess } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { projectSchema } = require('../utils/validators');

router.use(authenticate);

router.get('/', projectController.getProjects);
router.get('/:_idOrSlug', checkProjectAccess, projectController.getProject);
router.get('/:_idOrSlug/dashboard', checkProjectAccess, projectController.getProjectDashboard);
router.post('/', authorize('admin', 'contractor'), validate(projectSchema), projectController.createProject);
router.put('/:_idOrSlug', checkProjectAccess, authorize('admin', 'contractor'), projectController.updateProject);
router.delete('/:_idOrSlug', authorize('admin'), projectController.deleteProject);

module.exports = router;
