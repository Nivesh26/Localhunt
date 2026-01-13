import gmw from "../assets/Local Hunt Logo NoBG.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#dfdfdf] text-black ">
      <div className="px-[80px]">
        <div className="flex flex-wrap justify-between pt-10 pb-40">

          {/* Logo Section  */}

          <div className="flex-shrink-0 basis-[250px] max-w-[300px]">
            <img src={gmw} className="w-[120px] mb-2.5" />
            <p className="text-sm my-2.5">
              Bringing Nepali Traditions Online.
            </p>
            <h4 className="my-5 text-base font-bold mt-10    ">Follow our Socials</h4>
          </div>

          {/* Quick Links */}

          <div className="flex-shrink-0 basis-[200px] my-5">
            <h4 className="text-base mb-4 font-bold">Quicks links</h4>
            <ul className="list-none p-0">
              <li className="mb-2.5 text-sm cursor-pointer">Home</li>
              <li className="mb-2.5 text-sm cursor-pointer">New</li>
              <li className="mb-2.5 text-sm cursor-pointer">Shop</li>
              <li className="mb-2.5 text-sm cursor-pointer">About</li>
              <li className="mb-2.5 text-sm cursor-pointer">Contact</li>
            </ul>
          </div>

          {/* Popular Services */}

          <div className="flex-shrink-0 basis-[200px] my-5">
            <h4 className="text-base mb-4 font-bold">Categories</h4>
            <ul className="list-none p-0 text-sm">
              <li className="mb-2.5 cursor-pointer">Mask</li>
              <li className="mb-2.5 cursor-pointer">Handmade</li>
              <li className="mb-2.5 cursor-pointer">nepal</li>
              <li className="mb-2.5 cursor-pointer">Nepal</li>
              <li className="mb-2.5 cursor-pointer">Nepal</li>
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
          <a href="#" className="underline">
            Nivesh
          </a>{" "}
          |{" "}
          <a href="#" className="underline">
            Privacy Policy
          </a>{" "}
          |{" "}
          <a href="#" className="underline">
            Terms of Service
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;