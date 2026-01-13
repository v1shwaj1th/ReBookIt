import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import API_URL from '../config';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (initialQuery) {
        handleSearch(initialQuery);
    } else {
        // meaningful default? fetch all? or empty?
        // Let's fetch all if empty, or just empty.
        // Usually search page might show all or "recent" if empty.
        // Let's fetch all for discovery.
        handleSearch('');
    }
  }, [initialQuery]);

  const handleSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/books?search=${searchQuery}`);
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query }); // Update URL
    handleSearch(query);
  };

  const filteredBooks = user 
    ? books.filter(book => book.sellerId._id !== user.id) 
    : books;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900 font-serif mb-6">Uncover Hidden Gems & Save Big</h1>
            <form onSubmit={onSearchSubmit} className="max-w-2xl mx-auto flex gap-2">
                <input 
                  type="text" 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  placeholder="Search by title, author..." 
                  className="flex-1 p-4 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm"
                />
                <button type="submit" className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-indigo-700 transition shadow-md">
                    Search
                </button>
            </form>
        </div>

        {/* Results Grid - Reusing Card Design */}
        {loading ? (
            <div className="text-center py-20">Loading...</div>
        ) : filteredBooks.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
                <p className="text-xl">No books found matching "{initialQuery}"</p>
                <p className="mt-2">Try checking your spelling or use different keywords.</p>
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

export default Search;
