const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const authenticate = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

router.use(authenticate);

router.get('/', photoController.getPhotos);
router.get('/:id', photoController.getPhoto);
router.post('/', authorize('admin', 'contractor', 'architect'), uploadSingle('photo'), photoController.uploadPhoto);
router.post('/drone', authorize('admin', 'contractor', 'architect'), uploadSingle('photo'), photoController.uploadDronePhoto);
router.delete('/:id', authorize('admin'), photoController.deletePhoto);

module.exports = router;
