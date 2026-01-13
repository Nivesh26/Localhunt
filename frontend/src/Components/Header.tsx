import React, { useState, useEffect } from "react";
import profile from "../assets/Local Hunt Logo NoBG.png";
import { FaSearch, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkLoginStatus = () => {
      const user = localStorage.getItem('user');
      setIsLoggedIn(!!user);
    };

    checkLoginStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkLoginStatus);

    // Listen for custom login event (when user logs in/out in same tab)
    window.addEventListener('userLoginStatusChange', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('userLoginStatusChange', checkLoginStatus);
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
          <Link to="/profile">
            <FaUserCircle className="w-6 h-6 text-gray-700 hover:text-red-600 cursor-pointer" />
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
