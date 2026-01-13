import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const NotificationList = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    // Optional: Poll every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRead = async (id, type, relatedId) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      // Update local state
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      
      if (type === 'payment_due' && relatedId) {
        // Fetch book details
        const bookRes = await axios.get(`http://localhost:5000/api/books/${relatedId}`);
        const book = bookRes.data;
        let amountToPay = book.price;

        if (book.listingType === 'auction') {
            try {
                // Fetch bids to find the winning bid amount
                const bidsRes = await axios.get(`http://localhost:5000/api/bids/${relatedId}`);
                const bids = bidsRes.data;
                // Assuming bids are sorted desc by server or we sort them
                if (bids.length > 0) {
                    amountToPay = bids[0].bidAmount;
                }
            } catch (bidErr) {
                console.error("Error fetching bids:", bidErr);
                // Fallback to book price if fetch fails, though risky for auction
            }
        }

        navigate('/checkout', { 
            state: { 
              bookId: book._id, 
              amount: amountToPay,
              title: book.title
            } 
        });
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 max-h-96 overflow-y-auto">
      {notifications.length === 0 ? (
        <div className="px-4 py-2 text-sm text-gray-500">No notifications</div>
      ) : (
        notifications.map((n) => (
          <div 
            key={n._id} 
            onClick={() => handleRead(n._id, n.type, n.relatedId)}
            className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer ${!n.isRead ? 'bg-blue-50' : ''}`}
          >
            <p className="text-sm text-gray-800">{n.message}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
            {n.type === 'payment_due' && !n.isRead && (
                 <span className="inline-block mt-2 px-2 py-1 text-xs font-bold text-white bg-green-500 rounded-full">Pay Now</span>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationList;
