const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/authMiddleware');

router.get('/buy-history', auth, transactionController.getBuyHistory);
router.get('/sell-history', auth, transactionController.getSellHistory);

module.exports = router;
