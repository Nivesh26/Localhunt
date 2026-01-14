import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../Components/Header";
import Topbar from "../Components/Topbar";
import Footer from "../Components/Footer";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortOption, setSortOption] = useState("featured");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/products/live');
      if (response.ok) {
        const data = await response.json();
        const formattedProducts: Product[] = data.map((p: any) => {
          // Convert imageUrl path to full URL
          let imageUrl = p.imageUrl || '';
          if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            imageUrl = `http://localhost:8080${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
          }
          
          return {
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            imageUrl: imageUrl,
          };
        });
        setProducts(formattedProducts);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate max price for range
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 100000;
    return Math.max(...products.map(p => p.price), 100000);
  }, [products]);

  // Get unique categories from products
  const uniqueCategories = useMemo(() => {
    const categories = new Set(products.map(p => p.category));
    return Array.from(categories);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
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
  }, [products, category, priceRange, sortOption]);

  const resetFilters = () => {
    setCategory("All");
    setPriceRange([0, maxPrice]);
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
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="All">All</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
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
              max={maxPrice}
              step="5"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Sort Options */}
          <div className="mb-6">
            <h3 className="text-gray-700 font-medium mb-2">Sort By</h3>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
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
            className="w-full rounded-lg border border-red-100 bg-red-50 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-gray-500">No products found in this filter range.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/productdetail/${product.id}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-400">No Image</p>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-medium">{product.name}</h3>
                    <p className="text-gray-500 text-sm">{product.category}</p>
                    <p className="text-red-600 font-semibold mt-2">NRP {product.price}</p>
                    <button 
                      onClick={(e) => e.preventDefault()}
                      className="mt-3 w-full bg-red-400 text-white py-2 rounded-lg hover:bg-red-500 transition"
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
