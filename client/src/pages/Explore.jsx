import { useState } from 'react';
import { Link } from 'react-router-dom';

const dummyBooks = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    price: 349,
    rating: 4.5,
    reviews: 1240,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
    isPrime: true
  },
  {
    id: 2,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    price: 499,
    rating: 4.8,
    reviews: 2156,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
    isPrime: true
  },
  {
    id: 3,
    title: "1984",
    author: "George Orwell",
    price: 299,
    rating: 4.6,
    reviews: 890,
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400",
    isPrime: false
  },
  {
    id: 4,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    price: 199,
    rating: 4.7,
    reviews: 3200,
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400",
    isPrime: true
  },
  {
    id: 5,
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    price: 399,
    rating: 4.3,
    reviews: 560,
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400",
    isPrime: true
  },
  {
    id: 6,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    price: 599,
    rating: 4.9,
    reviews: 5400,
    image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400",
    isPrime: false
  },
  {
    id: 7,
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    price: 699,
    rating: 4.9,
    reviews: 8500,
    image: "https://images.unsplash.com/photo-1611676279444-5577698aa13c?auto=format&fit=crop&q=80&w=400",
    isPrime: true
  },
  {
    id: 8,
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 249,
    rating: 4.6,
    reviews: 4321,
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400",
    isPrime: true
  }
];

const Explore = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="bg-gray-800 text-white py-2 px-4 text-xs font-bold text-center">
        Limited Time Offer: Get 20% off on your first purchase!
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-bold text-gray-800">Explore Collection</h1>
           <div className="text-sm text-gray-500">Showing {dummyBooks.length} results</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {dummyBooks.map((book) => (
            <div key={book.id} className="bg-white border border-gray-200 rounded-sm flex flex-col hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-64 p-4 flex items-center justify-center bg-gray-50">
                <img 
                  src={book.image} 
                  alt={book.title} 
                  className="h-full object-contain max-w-full drop-shadow-md"
                />
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <Link to={'#'} className="text-base font-medium text-gray-900 hover:text-orange-600 line-clamp-2 leading-snug mb-1">
                  {book.title}
                </Link>
                <div className="text-xs text-gray-500 mb-2">by {book.author}</div>
                
                {/* Rating */}
                <div className="flex items-center mb-2">
                   <div className="flex text-yellow-500 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < Math.floor(book.rating) ? '★' : '☆'}</span>
                      ))}
                   </div>
                   <span className="text-xs text-blue-600 ml-1 hover:underline cursor-pointer">{book.reviews}</span>
                </div>

                {/* Price */}
                <div className="mt-auto">
                    <div className="flex items-baseline">
                        <span className="text-xs align-top relative top-0.5">₹</span>
                        <span className="text-xl font-bold text-gray-900 mx-0.5">{book.price}</span>
                        <span className="text-xs text-gray-500 line-through ml-2">₹{book.price + 150}</span>
                    </div>
                </div>



                <button className="mt-3 w-full bg-yellow-400 hover:bg-yellow-500 text-sm font-medium py-1.5 rounded-full border border-yellow-500 shadow-sm transition-colors">
                    Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
