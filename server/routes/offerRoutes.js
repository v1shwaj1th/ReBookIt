const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, offerController.makeOffer);
router.get('/book/:bookId', auth, offerController.getOffersForBook);
router.put('/:id', auth, offerController.updateOfferStatus);
router.get('/my-offers', auth, offerController.getMyOffers);
router.get('/seller-received', auth, offerController.getSellerReceivedOffers);

module.exports = router;
