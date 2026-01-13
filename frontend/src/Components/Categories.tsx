import React from "react";
import dress from "../assets/C1.png";
import jewelry from "../assets/C2.png";
import mask from "../assets/C3.png";
import basket from "../assets/C2.png";
import pottery from "../assets/C5.png";
import brass from "../assets/C6.png";
import food from "../assets/C7.png";

const categories = [
  { id: 1, image: dress, name: "Clothing" },
  { id: 2, image: jewelry, name: "Jewelry" },
  { id: 3, image: mask, name: "Masks" },
  { id: 4, image: basket, name: "Handicrafts" },
  { id: 5, image: pottery, name: "Pottery" },
  { id: 6, image: brass, name: "Brassware" },
  { id: 7, image: food, name: "Traditional Food" },
];

const Categories = () => {
  return (
    <div className="bg-white py-6 px-[20px] md:px-[80px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Shop by Categories</h2>
        <a
          href="#"
          className="text-sm italic underline hover:text-gray-600 transition-colors duration-200"
        >
          View All →
        </a>
      </div>

      {/* Categories row */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="w-[70px] sm:w-[90px] md:w-[110px] lg:w-[130px] aspect-square rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300"
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
