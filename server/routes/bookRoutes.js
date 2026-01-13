const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

router.post('/', auth, upload.array('images', 5), bookController.createBook);
router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBook);
router.delete('/:id', auth, bookController.deleteBook);

module.exports = router;
