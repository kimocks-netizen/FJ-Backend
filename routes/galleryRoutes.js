const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const auth = require('../middleware/auth');

// Public
router.get('/gallery', galleryController.getGalleryItems);

// Admin protected
router.get('/admin/gallery', auth, galleryController.getAdminGalleryItems);
router.post('/admin/gallery', auth, galleryController.createGalleryItem);
router.put('/admin/gallery/:id', auth, galleryController.updateGalleryItem);
router.delete('/admin/gallery/:id', auth, galleryController.deleteGalleryItem);

// Gallery images (child)
router.post('/admin/gallery/images', auth, galleryController.addGalleryImage);
router.delete('/admin/gallery/images/:id', auth, galleryController.deleteGalleryImage);

module.exports = router;
