import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import API_URL from '../config';

const BookDetails = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [book, setBook] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [loading, setLoading] = useState(true);

  if (authLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`${API_URL}/books/${id}`);
        setBook(res.data);
        if (res.data.listingType === 'auction') {
          const bidsRes = await axios.get(`${API_URL}/bids/${id}`);
          setBids(bidsRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/bids`, { bookId: id, bidAmount });
      alert('Bid placed successfully!');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Error placing bid');
    }
  };

  const handleMakeOffer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/offers`, { bookId: id, offeredPrice: offerAmount });
      alert('Offer sent successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error making offer');
    }
  };

  const handleBuyNow = () => {
    navigate('/checkout', { 
      state: { 
        bookId: book._id, 
        amount: book.price,
        title: book.title
      } 
    });
  };

  if (loading) return <div>Loading...</div>;
  if (!book) return <div>Book not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            {/* Simple Image Carousel/Grid */}
            <div className="grid gap-4">
                {book.images && book.images.length > 0 ? (
                    book.images.map((img, idx) => (
                        <img key={idx} src={img} alt={book.title} className="w-full rounded-lg shadow-md" />
                    ))
                ) : (
                    <img 
                        src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400" 
                        alt={book.title} 
                        className="w-full rounded-lg shadow-md" 
                    />
                )}
            </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
          <p className="text-xl text-gray-600 mt-2">{book.author}</p>
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-2xl font-bold text-primary">₹{book.price}</span>
            <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 uppercase">{book.condition}</span>
          </div>
          <p className="mt-6 text-gray-700">{book.description}</p>
          
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Seller Info</h3>
            <p>Name: {book.sellerId.name}</p>
            <p>Email: {book.sellerId.email}</p>
          </div>

          <div className="mt-8">
            {book.status === 'sold' ? (
              <div className="bg-red-100 text-red-800 p-4 rounded-md text-center font-bold">SOLD OUT</div>
            ) : (
              <>
                {book.listingType === 'buy_now' ? (
                  <div className="space-y-4">
                    {user && user.id !== book.sellerId._id && (
                        <button onClick={handleBuyNow} className="w-full bg-primary text-white py-3 rounded-md font-bold text-lg hover:bg-indigo-700">
                        Buy Now
                        </button>
                    )}
                    {user && user.id !== book.sellerId._id && (
                        <form onSubmit={handleMakeOffer} className="flex space-x-2">
                             <input type="number" placeholder="Offer Price" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} className="flex-1 border p-2 rounded-md" required />
                             <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-md">Make Offer</button>
                        </form>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-md">
                        <h3 className="font-bold text-yellow-800 mb-2">Auction Ends: {new Date(book.auctionEndTime).toLocaleString()}</h3>
                        <div className="space-y-2">
                            {bids.map((bid) => (
                                <div key={bid._id} className="flex justify-between text-sm">
                                    <span>{bid.bidderId.name}</span>
                                    <span className="font-medium">₹{bid.bidAmount}</span>
                                </div>
                            ))}
                            {bids.length === 0 && <p className="text-gray-500 italic">No bids yet</p>}
                        </div>
                    </div>
                     {user && user.id !== book.sellerId._id && (
                        <form onSubmit={handlePlaceBid} className="flex space-x-2">
                            <input type="number" placeholder="Your Bid" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="flex-1 border p-2 rounded-md" required />
                            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md">Place Bid</button>
                        </form>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
