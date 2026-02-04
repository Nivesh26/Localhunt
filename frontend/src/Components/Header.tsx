import { useState, useEffect, useRef } from "react";
import profile from "../assets/Local Hunt Logo NoBG.png";
import { FaSearch, FaShoppingCart, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { sessionUtils } from "../utils/sessionUtils";

interface Product {
  id: number;
  name: string;
  category: string;
}

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/new", label: "New" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    <>
      <header className="flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-3 md:py-4 shadow-sm bg-white sticky top-0 z-40">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/">
            <img src={profile} alt="Local Hunt" className="h-9 sm:h-10 md:h-12 cursor-pointer" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4 lg:space-x-6 font-medium text-gray-700">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`hover:text-red-600 whitespace-nowrap ${location.pathname === link.to ? "text-red-600" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search + Cart/Login - Hidden search on small mobile */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div ref={searchRef} className="relative hidden sm:block">
            <form onSubmit={handleSearch} className="relative">
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
                className="pl-9 pr-3 py-1.5 md:pl-10 md:pr-4 md:py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 w-32 md:w-48 lg:w-64"
              />
              <FaSearch className="w-4 h-4 md:w-5 md:h-5 absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto min-w-[200px]">
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FaSearch className="w-4 h-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link to="/cart" className="relative shrink-0">
            <FaShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-gray-700 hover:text-red-600 cursor-pointer" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-red-600 text-white text-[10px] md:text-xs font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <Link to="/profile" className="flex items-center shrink-0" onClick={closeMobileMenu}>
              {profilePicture ? (
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-300 hover:border-red-600 cursor-pointer transition">
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const defaultIcon = parent.parentElement?.querySelector('.default-profile-icon') as HTMLElement;
                        if (defaultIcon) defaultIcon.classList.remove('hidden');
                      }
                    }}
                  />
                </div>
              ) : null}
              <FaUserCircle className={`w-7 h-7 md:w-8 md:h-8 text-gray-700 hover:text-red-600 cursor-pointer transition default-profile-icon ${profilePicture ? 'hidden' : ''}`} />
            </Link>
          ) : (
            <Link to="/login" className="hidden sm:inline text-gray-700 hover:text-red-600 font-medium text-sm md:text-base">
              Login
            </Link>
          )}

          {/* Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2 text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-lg transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-out Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-16 px-4 pb-6">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMobileMenu}
                className={`px-4 py-3 rounded-lg font-medium transition ${
                  location.pathname === link.to
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            {/* Mobile Search */}
            <div className="sm:hidden relative">
              <form onSubmit={(e) => { handleSearch(e); closeMobileMenu(); }} className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <FaSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </form>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {suggestions.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => { handleSuggestionClick(product); closeMobileMenu(); }}
                      className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {!isLoggedIn && (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="block px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 sm:hidden"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
