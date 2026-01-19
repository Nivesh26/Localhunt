import { useState, useEffect } from "react";
import profile from "../assets/Local Hunt Logo NoBG.png";
import { FaSearch, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { sessionUtils } from "../utils/sessionUtils";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

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

  useEffect(() => {
    // Check if user is logged in (using sessionStorage - tab-specific)
    const checkLoginStatus = () => {
      const isLoggedIn = sessionUtils.isLoggedIn();
      setIsLoggedIn(isLoggedIn);
      
      // Fetch profile picture if user is logged in
      if (isLoggedIn) {
        fetchProfilePicture();
      } else {
        setProfilePicture(null);
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

    return () => {
      window.removeEventListener('userLoginStatusChange', checkLoginStatus);
      window.removeEventListener('profilePictureUpdated', handleProfilePictureUpdate);
    };
  }, []);

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
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border rounded-full text-sm"
          />
          <FaSearch className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
        </div>

        <Link to="/cart">
        <FaShoppingCart className="w-6 h-6 text-gray-700 hover:text-red-600 cursor-pointer" />
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
