import React from "react";
import bowl from "../assets/Bowl.png";
import cranes from "../assets/Swan.png";
import incense from "../assets/p3.png";

const products = [
  {
    id: 1,
    name: "Seven Chakra Colors Healing Singing Bowls",
    price: "NRP 1200.00",
    image: bowl,
  },
  {
    id: 2,
    name: "Golden Swan Pair",
    price: "NRP 450.00",
    image: cranes,
  },
  {
    id: 3,
    name: "Tibetan Spiritual Healing Incense",
    price: "NRP 80.00",
    image: incense,
  },
  {
    id: 4,
    name: "Tibetan Spiritual Healing Incense",
    price: "NRP 80.00",
    image: incense,
  },
];

const BestSellers = () => {
  return (
    <div className=" py-12 px-[40px] md:px-[80px]">
      <h2 className="text-2xl font-semibold mb-8">Best Sellers</h2>

      {/* ✅ Reduced gap between products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 place-items-center">
        {products.map((item) => (
          <div
            key={item.id}
            className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 aspect-square w-[150px] sm:w-[190px] md:w-[210px] lg:w-[220px] bg-white flex items-center justify-center"
          >
            <img
              src={item.image}
              alt={item.name} 
              className="w-full h-full object-cover"
            />

            {/* Overlay details */}
            <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-60 transition-all duration-300 flex flex-col justify-center items-center text-center text-white p-3">
              <h3 className="text-sm font-medium mb-1">{item.name}</h3>
              <p className="text-sm font-semibold mb-1">{item.price}</p>
              <a
                href="#"
                className="text-red-400 hover:text-red-600 underline text-xs"
              >
                View Product
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BestSellers;
