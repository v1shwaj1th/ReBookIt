import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import NotificationList from './NotificationList';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav className="bg-white/70 backdrop-blur-lg shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <span className="text-3xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary group-hover:from-secondary group-hover:to-primary transition-all duration-500">
                ReBookit
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-6 relative">
            <Link to="/search" className="text-gray-600 hover:text-primary font-medium transition-colors text-sm uppercase tracking-wide">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </Link>
            <Link to="/" className="text-gray-600 hover:text-primary font-medium transition-colors text-sm uppercase tracking-wide">Home</Link>
            {user ? (
              <>
                {/* Notification Icon */}
                <div className="relative">
                  <button onClick={() => setShowNotifications(!showNotifications)} className="text-gray-600 hover:text-primary transition-colors focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                  {showNotifications && <NotificationList onClose={() => setShowNotifications(false)} />}
                </div>

                <Link to="/create-listing" className="text-gray-600 hover:text-primary font-medium transition-colors text-sm uppercase tracking-wide">Sell</Link>
                <Link to="/history" className="text-gray-600 hover:text-primary font-medium transition-colors text-sm uppercase tracking-wide">History</Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-primary font-medium transition-colors text-sm uppercase tracking-wide">Dashboard</Link>
                <button onClick={logout} className="text-gray-600 hover:text-red-500 font-medium transition-colors text-sm uppercase tracking-wide">Logout</button>
                <div className="pl-4 border-l border-gray-200">
                    <span className="text-primary font-bold bg-primary/5 px-3 py-1 rounded-full text-sm">
                      {user.name}
                    </span>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary font-medium transition-colors text-sm uppercase tracking-wide">Login</Link>
                <Link to="/register" className="bg-primary text-white px-6 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg shadow-primary/30 text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
