const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');
const auth = require('../middleware/auth');

// Public
router.get('/services', servicesController.getServices);

// Admin protected
router.get('/admin/services', auth, servicesController.getAdminServices);
router.post('/admin/services', auth, servicesController.createService);
router.put('/admin/services/:id', auth, servicesController.updateService);
router.delete('/admin/services/:id', auth, servicesController.deleteService);

module.exports = router;
