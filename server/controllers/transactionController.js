const Transaction = require('../models/Transaction');

exports.getBuyHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ buyerId: req.user.id })
      .populate('bookId', 'title price images')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getSellHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ sellerId: req.user.id })
      .populate('bookId', 'title price images')
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
