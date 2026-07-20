const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Admin upload — returns proxied URL
router.post('/admin/upload', auth, upload.single('file'), uploadController.uploadFile);

// Public media proxy — serves files without exposing Supabase URL
router.get('/media/:bucket/*', uploadController.proxyMedia);

module.exports = router;
