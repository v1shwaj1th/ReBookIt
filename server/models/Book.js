const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    enum: ['New', 'Used', 'Worn'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  images: [{
    type: String,
    required: true,
  }],
  listingType: {
    type: String,
    enum: ['buy_now', 'auction'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'rejected', 'awaiting_payment'],
    default: 'active',
  },
  auctionEndTime: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Book', bookSchema);
