import gmw from "../assets/Local Hunt Logo NoBG.png";
import { Link } from "react-router-dom";

const Footer = () => {
  // Common categories for Nepali marketplace
  const categories = [
    "Handmade & Crafts",
    "Fashion & Apparel",
    "Gourmet & Organic",
    "Home & Living",
    "Jewelry",
    "Masks",
    "Pottery",
    "Brassware"
  ];

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
            <ul className="list-none p-0 text-sm">
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