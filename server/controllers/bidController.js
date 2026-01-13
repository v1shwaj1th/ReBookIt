const Bid = require('../models/Bid');
const Book = require('../models/Book');

exports.placeBid = async (req, res) => {
  try {
    const { bookId, bidAmount } = req.body;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.listingType !== 'auction') return res.status(400).json({ message: 'Not an auction listing' });
    if (new Date() > book.auctionEndTime) return res.status(400).json({ message: 'Auction ended' });
    if (book.sellerId.toString() === req.user.id) return res.status(400).json({ message: 'Cannot bid on your own book' });

    // Check if bid is higher than current price/highest bid
    // Ideally we should aggregation or findOne sort desc.
    const highestBid = await Bid.findOne({ bookId }).sort({ bidAmount: -1 });
    const currentPrice = highestBid ? highestBid.bidAmount : book.price;

    if (bidAmount <= currentPrice) {
      return res.status(400).json({ message: 'Bid must be higher than current price' });
    }

    const bid = new Bid({
      bookId,
      bidderId: req.user.id,
      bidAmount,
    });

    await bid.save();
    res.json(bid);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bookId: req.params.bookId }).sort({ bidAmount: -1 }).populate('bidderId', 'name');
    res.json(bids);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
