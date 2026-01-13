import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Home = () => {
  const [books, setBooks] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/books');
        setBooks(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooks();
  }, []);

  const filteredBooks = user 
    ? books.filter(book => book.sellerId !== user.id && book.status !== 'sold') 
    : books.filter(book => book.status !== 'sold');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary via-indigo-600 to-secondary pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl mix-blend-overlay"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-secondary blur-3xl mix-blend-overlay"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-semibold tracking-wide mb-6 border border-white/20">
            ✨ The #1 Marketplace for Used Books
          </span>
          <h1 className="text-5xl md:text-7xl font-bold font-serif text-white mb-8 leading-tight tracking-tight drop-shadow-sm">
            Discover Your Next <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-100">Literary Treasure.</span>
          </h1>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Join a thriving community of collectors and readers. Buy distinctive editions, sell your library, or auction rare finds.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Link to="/create-listing" className="group bg-white text-primary px-8 py-4 rounded-full font-bold hover:shadow-2xl hover:shadow-white/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
               Start Selling
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
             </Link>
             <Link to="/explore" className="px-8 py-4 rounded-full font-bold text-white border border-white/30 hover:bg-white/10 transition backdrop-blur-sm flex items-center justify-center">
               Explore Collection
             </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-12">
            <div>
               <h2 className="text-4xl font-bold text-gray-900 font-serif mb-2">Curated Arrivals</h2>
               <p className="text-gray-500">Handpicked additions from our community sellers.</p>
            </div>
            <Link to="/search" className="hidden sm:inline-flex items-center text-primary font-semibold hover:text-secondary transition">
                View All Books &rarr;
            </Link>
        </div>
        
        {filteredBooks.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
             <div className="text-6xl mb-4">📚</div>
             <p className="text-xl text-gray-500 font-medium">No books found.</p>
             <p className="text-gray-400">Time to list some!</p>
           </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredBooks.map((book) => (
            <div key={book._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full ring-1 ring-gray-100/50 hover:ring-primary/20 overflow-hidden">
              <div className="relative h-72 overflow-hidden bg-gray-100">
                <img 
                  src={book.images && book.images.length > 0 ? book.images[0] : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"} 
                  alt={book.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                />
                <div className="absolute top-4 left-4">
                   <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${book.listingType === 'auction' ? 'bg-secondary/90 text-white' : 'bg-white/90 text-gray-900'}`}>
                    {book.listingType === 'auction' ? 'Current Auction' : 'Buy Now'}
                  </span>
                </div>
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col items-start">
                <div className="mb-6 w-full">
                   <h3 className="text-2xl font-bold text-gray-900 font-serif leading-tight mb-2 group-hover:text-primary transition-colors">{book.title}</h3>
                   <p className="text-sm text-gray-500 font-medium uppercase tracking-wide border-b border-gray-100 pb-4">{book.author}</p>
                </div>
                
                <div className="mt-auto w-full flex items-center justify-between">
                  <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-medium uppercase">Current Price</span>
                      <span className="text-2xl font-bold text-primary">₹{book.price}</span>
                  </div>
                  <Link to={`/books/${book._id}`} className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default Home;
