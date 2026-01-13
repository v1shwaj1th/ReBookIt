const mongoose = require('mongoose');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User'); // For email
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/sendEmail');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookId, amount } = req.body;
    
    // Verify book availability
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.status === 'sold') return res.status(400).json({ message: 'Book already sold' });
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // cents
      currency: 'inr', // or usd
      metadata: { bookId, buyerId: req.user.id },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    await handlePaymentSuccess(event.data.object);
  }

  res.json({ received: true });
};

// Reusable function for payment success logic
const handlePaymentSuccess = async (paymentIntent) => {
    const { bookId, buyerId } = paymentIntent.metadata;

    try {
      // Check if already processed to avoid duplicates
      const existingTransaction = await Transaction.findOne({ paymentId: paymentIntent.id });
      if (existingTransaction) return;

      // 1. Create Transaction
      const book = await Book.findById(bookId).populate('sellerId');
      
      // Safety Check: If book is already sold, do not process again.
      if (book.status === 'sold') {
          console.log(`Duplicate payment detected for Book ${book.title}. Skipping transaction creation.`);
          return;
      }

      const transaction = new Transaction({
        bookId,
        buyerId,
        sellerId: book.sellerId._id,
        amount: paymentIntent.amount / 100,
        paymentId: paymentIntent.id,
        paymentStatus: 'completed',
      });
      await transaction.save();

      // 2. Mark Book as Sold
      book.status = 'sold';
      await book.save();

      // 3. Send Emails (Optional: wrap in try-catch if email fails)
      try {
        const buyer = await User.findById(buyerId);
        await sendEmail(buyer.email, 'Purchase Successful', `You bought ${book.title} for ${transaction.amount}`);
        await sendEmail(book.sellerId.email, 'Book Sold', `Your book ${book.title} was sold for ${transaction.amount}`);
      } catch (emailErr) {
          console.log("Email failed", emailErr.message);
      }

      console.log(`Payment processed for Book ${book.title}`);
      
      // 4. Delete "Payment Due" Notification
      console.log(`Attempting to delete notification for User: ${buyerId}, Book: ${bookId}`);
      
      const deleteResult = await Notification.deleteMany({ 
        userId: new mongoose.Types.ObjectId(buyerId), 
        type: 'payment_due', 
        relatedId: new mongoose.Types.ObjectId(bookId) 
      });
      
      console.log('Notification deletion result:', deleteResult);

    } catch (err) {
      console.error('Error processing payment success:', err);
    }
};

exports.confirmPayment = async (req, res) => {
    const { paymentIntentId } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status === 'succeeded') {
            await handlePaymentSuccess(paymentIntent);
            res.json({ success: true, message: 'Payment confirmed and book sold' });
        } else {
            res.status(400).json({ message: 'Payment not successful' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getTransactionHistory = async (req, res) => {
    try {
        const history = await Transaction.find({
            $or: [{ buyerId: req.user.id }, { sellerId: req.user.id }]
        })
        .populate('bookId', 'title price images')
        .populate('buyerId', 'name email')
        .populate('sellerId', 'name email')
        .sort({ createdAt: -1 });
        
        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
