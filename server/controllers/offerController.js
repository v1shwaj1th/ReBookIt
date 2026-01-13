const Offer = require('../models/Offer');
const Book = require('../models/Book');

exports.makeOffer = async (req, res) => {
  try {
    const { bookId, offeredPrice } = req.body;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.listingType !== 'buy_now') return res.status(400).json({ message: 'Offers only available for Buy Now listings' });
    if (book.sellerId.toString() === req.user.id) return res.status(400).json({ message: 'Cannot make offer on your own book' });

    const offer = new Offer({
      bookId,
      buyerId: req.user.id,
      offeredPrice,
    });

    await offer.save();
    res.json(offer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getOffersForBook = async (req, res) => { // For Seller
  try {
    const offers = await Offer.find({ bookId: req.params.bookId }).populate('buyerId', 'name');
    res.json(offers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateOfferStatus = async (req, res) => {
  try {
    const { status } = req.body; // accepted, rejected, countered
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    const book = await Book.findById(offer.bookId);
    if (book.sellerId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    offer.status = status;
    await offer.save();

    // If accepted, maybe trigger payment availability logic?
    // For now just status update.

    res.json(offer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getMyOffers = async (req, res) => { // For Buyer
  try {
    const offers = await Offer.find({ buyerId: req.user.id }).populate('bookId');
    res.json(offers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getSellerReceivedOffers = async (req, res) => {
  try {
    const books = await Book.find({ sellerId: req.user.id });
    const bookIds = books.map(book => book._id);
    
    const offers = await Offer.find({ bookId: { $in: bookIds } })
      .populate('bookId', 'title price')
      .populate('buyerId', 'name email');
      
    res.json(offers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
