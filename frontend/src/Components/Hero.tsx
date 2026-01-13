import hero from "../assets/Hero.png";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <img
        src={hero}
        alt="Hero"
        className="w-full h-full object-cover"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-start px-[80px] md:px-12 sm:px-6">
        <div className="max-w-2xl text-white space-y-6 animate-fade-in">
          {/* Main Heading */}
          <h1 className="text-6xl md:text-5xl sm:text-4xl font-bold leading-tight">
            Discover Local
            <span className="block text-red-500">Treasures</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-lg sm:text-base text-gray-200 max-w-lg leading-relaxed">
            Explore unique products from local artisans and businesses. 
            Support your community while finding something special.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex gap-4 pt-4">
            <Link
              to="/shop"
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Shop Now
            </Link>
            <Link
              to="/about"
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
