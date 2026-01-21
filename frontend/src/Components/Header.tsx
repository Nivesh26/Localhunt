import { useState, useEffect, useRef } from "react";
import profile from "../assets/Local Hunt Logo NoBG.png";
import { FaSearch, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { sessionUtils } from "../utils/sessionUtils";

interface Product {
  id: number;
  name: string;
  category: string;
}

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchProfilePicture = async () => {
    const user = sessionUtils.getUser();
    if (!user) {
      setProfilePicture(null);
      return;
    }

    try {
      const userId = user.userId;
      const response = await fetch(`http://localhost:8080/api/auth/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.profilePicture) {
          const avatarUrl = data.profilePicture.startsWith('http')
            ? data.profilePicture
            : `http://localhost:8080${data.profilePicture}`;
          setProfilePicture(avatarUrl);
        } else {
          setProfilePicture(null);
        }
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      setProfilePicture(null);
    }
  };

  const fetchCartCount = async () => {
    const user = sessionUtils.getUser();
    if (!user) {
      setCartCount(0);
      return;
    }

    try {
      const userId = user.userId;
      const response = await fetch(`http://localhost:8080/api/cart/${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Sum up all quantities from cart items
        const totalCount = data.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        setCartCount(totalCount);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/products/live');
      if (response.ok) {
        const data = await response.json();
        const formattedProducts: Product[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
        }));
        setAllProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Error fetching products for suggestions:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Check if user is logged in (using sessionStorage - tab-specific)
    const checkLoginStatus = () => {
      const isLoggedIn = sessionUtils.isLoggedIn();
      setIsLoggedIn(isLoggedIn);
      
      // Fetch profile picture and cart count if user is logged in
      if (isLoggedIn) {
        fetchProfilePicture();
        fetchCartCount();
      } else {
        setProfilePicture(null);
        setCartCount(0);
      }
    };

    checkLoginStatus();

    // Listen for custom login event (when user logs in/out in same tab)
    // Note: sessionStorage doesn't trigger 'storage' event across tabs, which is what we want
    window.addEventListener('userLoginStatusChange', checkLoginStatus);
    
    // Listen for profile picture updates
    const handleProfilePictureUpdate = () => {
      if (sessionUtils.isLoggedIn()) {
        fetchProfilePicture();
      }
    };
    window.addEventListener('profilePictureUpdated', handleProfilePictureUpdate);

    // Listen for cart updates
    const handleCartUpdate = () => {
      if (sessionUtils.isLoggedIn()) {
        fetchCartCount();
      }
    };
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('userLoginStatusChange', checkLoginStatus);
      window.removeEventListener('profilePictureUpdated', handleProfilePictureUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter suggestions based on search query
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5); // Show max 5 suggestions
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, allProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    navigate(`/shop?search=${encodeURIComponent(product.name)}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  return (
    <div className="flex items-center justify-between px-[80px] py-4 shadow-sm bg-white">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Link to="/">
          <img src={profile} alt="Local Hunt" className="h-12 cursor-pointer" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex space-x-6 font-medium text-gray-700">
        <Link to="/" className="hover:text-red-600">
          Home
        </Link>
        <Link to="/new" className="hover:text-red-600">
          New
        </Link>
        <Link to="/shop" className="hover:text-red-600">
          Shop
        </Link>
        <Link to="/about" className="hover:text-red-600">
          About
        </Link>
        <Link to="/contact" className="hover:text-red-600">
          Contact
        </Link>
      </nav>

      {/* Search + Cart/Login */}
      <div className="flex items-center space-x-4">
        <div ref={searchRef} className="relative">
          <form 
            onSubmit={handleSearch}
            className="relative"
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className="pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 w-64"
            />
            <FaSearch 
              className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 pointer-events-none" 
            />
          </form>
          
          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {suggestions.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSuggestionClick(product)}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FaSearch className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Link to="/cart" className="relative">
          <FaShoppingCart className="w-6 h-6 text-gray-700 hover:text-red-600 cursor-pointer" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </Link>
        
        {/* Profile Icon or Login Link */}
        {isLoggedIn ? (
          <Link to="/profile" className="flex items-center">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 hover:border-red-600 cursor-pointer transition"
                onError={(e) => {
                  // If image fails to load, show default icon instead
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const defaultIcon = parent.querySelector('.default-profile-icon') as HTMLElement;
                    if (defaultIcon) {
                      defaultIcon.classList.remove('hidden');
                    }
                  }
                }}
              />
            ) : null}
            <FaUserCircle className={`w-8 h-8 text-gray-700 hover:text-red-600 cursor-pointer transition default-profile-icon ${profilePicture ? 'hidden' : ''}`} />
          </Link>
        ) : (
          <Link to="/login" className="text-gray-700 hover:text-red-600 font-medium">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;
