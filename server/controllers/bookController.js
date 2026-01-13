const Book = require('../models/Book');

exports.createBook = async (req, res) => {
  try {
    const { title, author, description, condition, price, listingType, auctionEndTime } = req.body;
    const images = req.files.map(file => file.path); // Cloudinary paths

    // Check for monthly bidding limit
    if (listingType === 'auction') {
      const user = await Book.db.model('User').findById(req.user.id);
      if (user.monthlyBidCount >= 1) { // Limit 1 per month
         return res.status(400).json({ message: 'Monthly auction limit reached' });
      }
      user.monthlyBidCount += 1;
      await user.save();
    }

    const book = new Book({
      sellerId: req.user.id,
      title,
      author,
      description,
      condition,
      price,
      images,
      listingType,
      auctionEndTime: listingType === 'auction' ? auctionEndTime : null,
    });

    await book.save();
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getBooks = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {
      status: 'active',
      $or: [
        { listingType: 'buy_now' },
        { listingType: 'auction', auctionEndTime: { $gt: new Date() } }
      ]
    };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        ...query,
        $and: [
          {
            $or: [
              { title: searchRegex },
              { author: searchRegex }
            ]
          }
        ]
      };
      
      // Explanation: We want: (Action conditions) AND (Search Conditions)
      // The original $or was for listingType checks. 
      // We need to be careful not to overwrite the top-level $or if we just did query.$or = ...
      // Actually, my structure above says: "status=active AND (buy_now OR valid_auction)".
      // Now I want to add: "AND (title matches OR author matches)".
      // The structure above `query = { ...query, $and: [...] }` does exactly that. 
      // It effectively becomes: 
      // { 
      //   status: 'active', 
      //   $or: [ ...types... ], 
      //   $and: [ { $or: [ {title}, {author} ] } ] 
      // }
      // Valid MongoDB syntax.
    }

    const books = await Book.find(query).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('sellerId', 'name email');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Book not found' });
    res.status(500).send('Server Error');
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Check user
    if (book.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await book.deleteOne(); // Use deleteOne instead of remove which is deprecated
    res.json({ message: 'Book removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
