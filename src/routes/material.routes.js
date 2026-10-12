const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const authenticate = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { materialSchema } = require('../utils/validators');

router.use(authenticate);

router.get('/', materialController.getMaterials);
router.get('/:id', materialController.getMaterial);
router.post('/', authorize('admin', 'contractor'), validate(materialSchema), materialController.createMaterial);
router.put('/:id', authorize('admin', 'contractor'), materialController.updateMaterial);
router.delete('/:id', authorize('admin', 'contractor'), materialController.deleteMaterial);

module.exports = router;
