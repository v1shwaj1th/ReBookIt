import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ bookId, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`, // Redirect after payment
      },
      redirect: 'if_required', // Handle redirect manually if preferred, or let Stripe handle it
    });

    if (error) {
      setMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await axios.post('http://localhost:5000/api/payment/confirm-payment', {
            paymentIntentId: paymentIntent.id
        }, {
             headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setMessage('Payment Successful! Book marked as Sold.');
      } catch (err) {
        console.error("Confirmation failed", err);
        setMessage('Payment Successful, but server confirmation failed. Please contact support.');
      }
      setIsProcessing(false);
      // Optional: Wait seeing the message then redirect
      setTimeout(() => navigate('/dashboard'), 2000);
    } else {
        setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />
      <button 
        disabled={isProcessing || !stripe || !elements} 
        id="submit"
        className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : `Pay ₹${amount}`}
      </button>
      {message && <div id="payment-message" className="text-red-500 text-center mt-4">{message}</div>}
    </form>
  );
};

const Checkout = () => {
  const location = useLocation();
  const { bookId, amount, offerId, title } = location.state || {}; // Expect these from navigation
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    if (bookId && amount) {
        // Create Payment Intent
        axios.post('http://localhost:5000/api/payment/create-payment-intent', {
            bookId, 
            amount,
            offerId // Pass offerId if it exists to link transaction
        }, {
            headers: { 'x-auth-token': localStorage.getItem('token') }
        })
        .then((res) => setClientSecret(res.data.clientSecret))
        .catch(err => console.error("Error creating payment intent:", err));
    }
  }, [bookId, amount, offerId]);

  if (!bookId || !amount) {
      return <div className="text-center py-20">Invalid Checkout Session.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Checkout</h2>
            <p className="text-center text-gray-500 mb-8">{title}</p>
            
            <div className="mb-6 border-b pb-4">
                <div className="flex justify-between font-medium">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{amount}</span>
                </div>
            </div>

            {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm bookId={bookId} amount={amount} />
                </Elements>
            ) : (
                <div className="text-center">Loading Payment Details...</div>
            )}
        </div>
    </div>
  );
};

export default Checkout;
