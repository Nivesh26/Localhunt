import React from 'react'
import p1 from "../assets/P1.png";
import p2 from "../assets/P2.png";
import p3 from "../assets/P4.png";
import p4 from "../assets/P4.png";


const highlights = [
  {
    id: 1,
    name: "Lord Buddha Wall Mask Farewell Gifts",
    price: "NRP 120.00",
    image: p1,
  },
  {
    id: 2,
    name: "Handcrafted Mandala Art Frame",
    price: "NRP 120.00",
    image: p2,
  },
  {
    id: 3,
    name: "Golden Ganesh Statue Set",
    price: "NRP 120.00",
    image: p3,
  },
    {
    id: 4,
    name: "Golden Ganesh Statue Set",
    price: "NRP 120.00",
    image: p4,
  },
];

const Shopnow = () => {
return (
    <div className="bg-white py-10 px-[40px] md:px-[80px]">
      <h2 className="text-xl font-semibold mb-8">Shop Now</h2>

      <div className="flex justify-center items-center gap-6 md:gap-10">
        {highlights.map((item) => (
          <div
            key={item.id}
            className="group relative w-[220px] md:w-[260px] bg-white shadow-sm hover:shadow-md rounded-md overflow-hidden transition-all duration-300"
          >
            <div className="overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-[250px] object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-4 text-center">
              <h3 className="text-sm font-medium mb-1">{item.name}</h3>
              <p className="text-sm font-semibold text-gray-800">{item.price}</p>
            </div>

            {/* Black line on hover */}
            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shopnow