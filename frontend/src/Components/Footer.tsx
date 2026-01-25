import { useState, useEffect } from "react";
import gmw from "../assets/Local Hunt Logo NoBG.png";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
}

const Footer = () => {
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch products and extract unique categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/products/live');
        if (response.ok) {
          const data: Product[] = await response.json();
          // Get unique categories from products
          const uniqueCategories = Array.from(new Set(data.map(p => p.category).filter(Boolean)));
          // Sort categories alphabetically
          uniqueCategories.sort();
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // If fetch fails, use empty array (no categories shown)
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  return (
    <footer className="bg-[#dfdfdf] text-black ">
      <div className="px-[80px]">
        <div className="flex flex-wrap justify-between pt-10 pb-40">

          {/* Logo Section  */}

          <div className="flex-shrink-0 basis-[250px] max-w-[300px]">
            <Link to="/">
              <img src={gmw} className="w-[120px] mb-2.5" alt="Local Hunt Logo" />
            </Link>
            <p className="text-sm my-2.5">
              Bringing Nepali Traditions Online.
            </p>
            <h4 className="my-5 text-base font-bold mt-10    ">Follow our Socials</h4>
          </div>

          {/* Quick Links */}

          <div className="flex-shrink-0 basis-[200px] my-5">
            <h4 className="text-base mb-4 font-bold">Quick links</h4>
            <ul className="list-none p-0">
              <li className="mb-2.5 text-sm">
                <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
              </li>
              <li className="mb-2.5 text-sm">
                <Link to="/new" className="hover:text-red-600 transition-colors">New</Link>
              </li>
              <li className="mb-2.5 text-sm">
                <Link to="/shop" className="hover:text-red-600 transition-colors">Shop</Link>
              </li>
              <li className="mb-2.5 text-sm">
                <Link to="/about" className="hover:text-red-600 transition-colors">About</Link>
              </li>
              <li className="mb-2.5 text-sm">
                <Link to="/contact" className="hover:text-red-600 transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}

          <div className="flex-shrink-0 basis-[200px] my-5">
            <h4 className="text-base mb-4 font-bold">Categories</h4>
            {categories.length > 0 ? (
              <ul className="list-none p-0 text-sm">
                <li className="mb-2.5">
                  <Link 
                    to="/shop"
                    className="hover:text-red-600 transition-colors cursor-pointer"
                  >
                    All
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category} className="mb-2.5">
                    <Link 
                      to={`/shop?category=${encodeURIComponent(category)}`}
                      className="hover:text-red-600 transition-colors cursor-pointer"
                    >
                      {category}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Loading categories...</p>
            )}
          </div>

          {/* Contact Us */}

          <div className="flex-shrink-0 basis-[220px] my-5">
            <h4 className="text-base mb-4 font-bold">Contact Us</h4>
            <p className="my-2.5 text-sm">+977 9876543212, 01 - 1234567</p>
            <p className="my-2.5 text-sm">asfsdfsdf@gmail.com</p>
            <p className="my-2.5 text-sm">Pulchowk, Lalitpur</p>
            <Link to="/sellersignup" className="my-5 text-sm cursor-pointer text-[#be1e2d] font-semibold hover:underline block">Become a Seller</Link>
          </div>
        </div>
      </div>

      <div className="bg-[#be1e2d] text-white p-4 text-center text-[16px]">
        <p>
          &copy; 2025 Localhunt Nepal | All rights reserved | Designed
          by{" "}
          <span className="underline">Nivesh</span>
          {" "}|{" "}
          <Link to="/contact" className="underline hover:text-gray-200">
            Privacy Policy
          </Link>{" "}
          |{" "}
          <Link to="/contact" className="underline hover:text-gray-200">
            Terms of Service
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;