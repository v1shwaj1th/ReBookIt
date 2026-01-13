import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);
  const [myBids, setMyBids] = useState([]); // In a real app, we'd need an endpoint for this
  const [myOffers, setMyOffers] = useState([]);
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [history, setHistory] = useState([]);
  const [expandedTxnId, setExpandedTxnId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch My Listings
        const booksRes = await axios.get('http://localhost:5000/api/books');
        setMyListings(booksRes.data.filter(book => book.sellerId._id === user.id || book.sellerId === user.id));

        // Fetch My Offers
        const offersRes = await axios.get('http://localhost:5000/api/offers/my-offers');
        setMyOffers(offersRes.data);
        
        // Fetch Received Offers (for sellers)
        const receivedRes = await axios.get('http://localhost:5000/api/offers/seller-received');
        setReceivedOffers(receivedRes.data);

        // Fetch History
        const historyRes = await axios.get('http://localhost:5000/api/payment/history', {
             headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setHistory(historyRes.data);

      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleOfferAction = async (offerId, status) => {
      try {
          await axios.put(`http://localhost:5000/api/offers/${offerId}`, { status });
          // Update local state
          setReceivedOffers(receivedOffers.map(o => o._id === offerId ? { ...o, status } : o));
      } catch (err) {
          alert('Action failed');
      }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
        try {
            await axios.delete(`http://localhost:5000/api/books/${id}`);
            setMyListings(myListings.filter(b => b._id !== id));
        } catch(err) {
            alert('Delete failed');
        }
    }
  };

  // Filter out offers that have been converted to purchases
  const purchasedBookIds = new Set(history.filter(txn => txn.buyerId && txn.buyerId._id === user.id).map(txn => txn.bookId && txn.bookId._id));
  const visibleOffers = myOffers.filter(offer => offer.bookId && !purchasedBookIds.has(offer.bookId._id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">My Listings</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {myListings.map((book) => (
              <li key={book._id} className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <div className="flex items-center">
                    <img src={book.images[0]} alt="" className="h-10 w-10 rounded-full mr-4 object-cover" />
                    <div>
                        <p className="font-medium text-primary truncate">{book.title}</p>
                        <p className="text-sm text-gray-500">₹{book.price} - {book.status}</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Link to={`/books/${book._id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                    {book.status === 'sold' ? (
                         <span className="text-gray-400 font-bold ml-2">SOLD</span>
                    ) : (
                        <button onClick={() => handleDelete(book._id)} className="text-red-600 hover:text-red-900">Delete</button>
                    )}
                </div>
              </li>
            ))}
            {myListings.length === 0 && <li className="px-4 py-4 text-gray-500">No listings found.</li>}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">My Offers Sent</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-12">
            <ul className="divide-y divide-gray-200">
                {visibleOffers.map((offer) => (
                    <li key={offer._id} className="px-4 py-4 sm:px-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">Book ID: {offer.bookId ? offer.bookId.title || offer.bookId : 'Unknown'}</p>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${offer.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {offer.status}
                                </span>
                            </div>
                            {offer.status === 'accepted' && (
                                <button 
                                    onClick={() => navigate('/checkout', { 
                                        state: { 
                                            bookId: offer.bookId._id || offer.bookId, 
                                            amount: offer.offeredPrice,
                                            offerId: offer._id,
                                            title: offer.bookId.title || 'Book Purchase'
                                        } 
                                    })}
                                    className="bg-primary text-white px-4 py-2 rounded text-sm font-bold shadow hover:bg-indigo-700 transition"
                                >
                                    Pay Now
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Offered: ₹{offer.offeredPrice}</p>
                    </li>
                ))}
                 {visibleOffers.length === 0 && <li className="px-4 py-4 text-gray-500">No active offers.</li>}
            </ul>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Offers Received</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-12">
            <ul className="divide-y divide-gray-200">
                {receivedOffers.map((offer) => (
                    <li key={offer._id} className="px-4 py-4 sm:px-6 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-gray-900">{offer.bookId?.title}</p>
                            <p className="text-sm text-gray-600">Offered by: {offer.buyerId?.name} ({offer.buyerId?.email})</p>
                            <p className="text-lg font-semibold text-primary">₹{offer.offeredPrice}</p>
                            <p className="text-xs text-gray-400">Status: {offer.status}</p>
                        </div>
                        {offer.status === 'pending' && (
                            <div className="flex space-x-2">
                                <button onClick={() => handleOfferAction(offer._id, 'accepted')} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Accept</button>
                                <button onClick={() => handleOfferAction(offer._id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Reject</button>
                            </div>
                        )}
                        {offer.status !== 'pending' && (
                             <span className={`px-2 py-1 rounded text-sm font-semibold ${offer.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {offer.status.toUpperCase()}
                             </span>
                        )}
                    </li>
                ))}
                {receivedOffers.length === 0 && <li className="px-4 py-4 text-gray-500">No offers received yet.</li>}
            </ul>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Order History</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
                {history.map((txn) => (
                    <li key={txn._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer transition" onClick={() => setExpandedTxnId(expandedTxnId === txn._id ? null : txn._id)}>
                        <div className="flex items-center justify-between">
                             <div className="flex items-center">
                                 {txn.bookId?.images && <img src={txn.bookId.images[0]} alt="" className="h-12 w-12 rounded mr-4 object-cover" />}
                                 <div>
                                     <p className="font-bold text-gray-900">{txn.bookId?.title || 'Unknown Book'}</p>
                                     <div className="text-sm text-gray-500">
                                         {txn.buyerId?._id === user.id ? (
                                             <span className="text-green-600 font-medium">Bought from {txn.sellerId?.name}</span>
                                         ) : (
                                             <span className="text-blue-600 font-medium">Sold to {txn.buyerId?.name}</span>
                                         )}
                                     </div>
                                     <p className="text-xs text-gray-400">{new Date(txn.createdAt).toLocaleDateString()}</p>
                                 </div>
                             </div>
                             <div>
                                 <div className="flex flex-col items-end">
                                    <span className="text-lg font-bold text-gray-900">₹{txn.amount}</span>
                                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 uppercase">Paid</span>
                                 </div>
                             </div>
                        </div>
                        {/* Expanded Details - Showing Offer Info if applicable */}
                        {expandedTxnId === txn._id && (
                           <div className="mt-4 pt-4 border-t border-gray-100 text-sm animate-fade-in-down">
                               <p className="font-semibold text-gray-700">Transaction Details</p>
                               <p className="text-gray-600">Payment ID: {txn.paymentId}</p>
                               
                               {/* Check if there was an offer for this book */}
                               {myOffers.find(o => o.bookId?._id === txn.bookId?._id) && (
                                   <div className="mt-2 bg-indigo-50 p-3 rounded border border-indigo-100">
                                       <span className="text-indigo-800 font-semibold">Offer History: </span>
                                       <span className="text-indigo-700">
                                           You made an offer of ₹{myOffers.find(o => o.bookId._id === txn.bookId._id).offeredPrice}, which was Accepted.
                                       </span>
                                   </div>
                               )}
                           </div>
                        )}
                    </li>
                ))}
                {history.length === 0 && <li className="px-4 py-4 text-gray-500">No transactions yet.</li>}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
