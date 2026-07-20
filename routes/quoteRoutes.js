const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const auth = require('../middleware/auth');

router.post('/quotes', quoteController.submitQuote);
router.get('/admin/quotes', auth, quoteController.getAllQuotes);
router.put('/admin/quotes/:id/status', auth, quoteController.updateQuoteStatus);

module.exports = router;
