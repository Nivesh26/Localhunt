import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../Components/Header";
import Topbar from "../Components/Topbar";
import Footer from "../Components/Footer";
import bowl from "../assets/Bowl.png";
import cranes from "../assets/Swan.png";
import incense from "../assets/p3.png";
import buddha from "../assets/P1.png";
import pro from "../assets/P2.png";
import ganesh from "../assets/P4.png";

const productsData = [
  { id: 1, name: "Handmade Pottery", category: "Crafts", price: 40, image: cranes },
  { id: 2, name: "Organic Honey", category: "Food", price: 15, image: bowl },
  { id: 3, name: "Wooden Sculpture", category: "Crafts", price: 120, image: incense  },
  { id: 4, name: "Local Tea Pack", category: "Food", price: 25, image: buddha},
  { id: 5, name: "Traditional Shawl", category: "Clothing", price: 85, image: pro},
  { id: 6, name: "Handwoven Basket", category: "Crafts", price: 55, image: ganesh},
  { id: 7, name: "Handwoven Basket", category: "Crafts", price: 2, image: cranes },
  { id: 8, name: "Handwoven Basket", category: "Crafts", price: 5, image: buddha},
  { id: 9, name: "Handwoven Basket", category: "Crafts", price: 15, image: bowl },
];

const Shop = () => {
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortOption, setSortOption] = useState("featured");

  const filteredProducts = useMemo(() => {
    const filtered = productsData.filter((product) => {
      const matchCategory = category === "All" || product.category === category;
      const matchPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchCategory && matchPrice;
    });

    const sorted = [...filtered];
    switch (sortOption) {
      case "priceLowHigh":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "priceHighLow":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "nameAZ":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "nameZA":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return sorted;
  }, [category, priceRange, sortOption]);

  const resetFilters = () => {
    setCategory("All");
    setPriceRange([0, 200]);
    setSortOption("featured");
  };

  return (
    <div>
      <Topbar />
      <Header />

      {/* --- Shop Section --- */}
      <section className="flex flex-col md:flex-row bg-gray-50 min-h-screen px-4 md:px-10 py-8">
        {/* Sidebar Filter */}
        <aside className="w-full md:w-1/4 bg-white p-6 rounded-xl mb-6 md:mb-0 md:mr-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>

          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="text-gray-700 font-medium mb-2">Category</h3>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All</option>
              <option value="Food">Food</option>
              <option value="Crafts">Crafts</option>
              <option value="Clothing">Clothing</option>
            </select>
          </div>


          {/* Price Range Filter */}
          <div className="mb-6">
            <h3 className="text-gray-700 font-medium mb-2">Price Range</h3>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
              <span>NRP {priceRange[0]}</span>
              <span>NRP {priceRange[1]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, parseInt(e.target.value, 10)])}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Sort Options */}
          <div className="mb-6">
            <h3 className="text-gray-700 font-medium mb-2">Sort By</h3>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="featured">Featured</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
              <option value="nameAZ">Name: A - Z</option>
              <option value="nameZA">Name: Z - A</option>
            </select>
          </div>

          {/* Reset */}
          <button
            onClick={resetFilters}
            className="w-full rounded-lg border border-blue-100 bg-blue-50 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
          >
            Reset Filters
          </button>
        </aside>

        {/* Product Grid */}
        <main className="flex-1 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Shop Now</h2>
      
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <p className="text-gray-500">No products found in this filter range.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to="/productdetail"
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="text-lg font-medium">{product.name}</h3>
                    <p className="text-gray-500 text-sm">{product.category}</p>
                    <p className="text-blue-600 font-semibold mt-2">NRP {product.price}</p>
                    <button 
                      onClick={(e) => e.preventDefault()}
                      className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </section>

      <Footer />
    </div>
  );
};

export default Shop;
