require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/oldBook')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Routes (Placeholder)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const bidRoutes = require('./routes/bidRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/bids', bidRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

app.use('/api/notifications', require('./routes/notificationRoutes'));

const Book = require('./models/Book');
const Bid = require('./models/Bid');
const Notification = require('./models/Notification');

// Auction End Check (Run every 1 minute)
setInterval(async () => {
  try {
    const endedAuctions = await Book.find({
      listingType: 'auction',
      status: 'active',
      auctionEndTime: { $lt: new Date() }
    });

    for (const book of endedAuctions) {
      // Find highest bid
      const highestBid = await Bid.findOne({ bookId: book._id }).sort({ bidAmount: -1 });

      if (highestBid) {
        // Create Notification for winner
        await Notification.create({
          userId: highestBid.bidderId,
          message: `You won the auction for "${book.title}"! Please complete the payment.`,
          type: 'payment_due',
          relatedId: book._id
        });

        // Update book status
        book.status = 'awaiting_payment';
        await book.save();
        console.log(`Auction ended for ${book.title}. Winner notified.`);
      } else {
        // No bids, mark as unsold
        book.status = 'unsold'; // or keep active? User logic might differ, but 'unsold' makes sense.
        await book.save();
        console.log(`Auction ended for ${book.title}. No bids.`);
      }
    }
  } catch (err) {
    console.error('Auction check error:', err.message);
  }
}, 60000); // Check every minute

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
