import { useState, useEffect } from 'react';
import axios from 'axios';

const History = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [buyHistory, setBuyHistory] = useState([]);
  const [sellHistory, setSellHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };

        const [buyRes, sellRes] = await Promise.all([
          axios.get('http://localhost:5000/api/transactions/buy-history', config),
          axios.get('http://localhost:5000/api/transactions/sell-history', config)
        ]);

        setBuyHistory(buyRes.data);
        setSellHistory(sellRes.data);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="text-center py-8">Loading history...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Transaction History</h1>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium focus:outline-none ${
            activeTab === 'buy'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('buy')}
        >
          Order History (Bought)
        </button>
        <button
          className={`py-2 px-4 font-medium focus:outline-none ${
            activeTab === 'sell'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('sell')}
        >
          Sold History
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'buy' ? (
          buyHistory.length === 0 ? (
            <p className="text-gray-500">You haven't purchased any books yet.</p>
          ) : (
            buyHistory.map((txn) => (
              <div key={txn._id} className="bg-white p-4 rounded-lg shadow border border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <img
                    src={(txn.bookId?.images && txn.bookId.images.length > 0) ? txn.bookId.images[0] : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"}
                    alt={txn.bookId?.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{txn.bookId?.title}</h3>
                    <p className="text-sm text-gray-600">Seller: {txn.sellerId?.name}</p>
                    <p className="text-xs text-gray-500">Date: {formatDate(txn.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{txn.amount}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    txn.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {txn.paymentStatus}
                  </span>
                </div>
              </div>
            ))
          )
        ) : (
          sellHistory.length === 0 ? (
            <p className="text-gray-500">You haven't sold any books yet.</p>
          ) : (
            sellHistory.map((txn) => (
              <div key={txn._id} className="bg-white p-4 rounded-lg shadow border border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <img
                    src={(txn.bookId?.images && txn.bookId.images.length > 0) ? txn.bookId.images[0] : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"}
                    alt={txn.bookId?.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{txn.bookId?.title}</h3>
                    <p className="text-sm text-gray-600">Buyer: {txn.buyerId?.name}</p>
                    <p className="text-xs text-gray-500">Date: {formatDate(txn.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{txn.amount}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    txn.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {txn.paymentStatus}
                  </span>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default History;
