import { useMemo, useState } from 'react';
import {
  FaSearch,
  FaFilter,
  FaPlus,
  FaEllipsisV,
  FaStar,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCube,
  FaTrash,
} from 'react-icons/fa';
import AdminNavbar from '../AdminComponents/AdminNavbar';
import bowl from '../assets/Bowl.png';
import honey from '../assets/P2.png';
import shawl from '../assets/P1.png';
import prayerWheel from '../assets/P4.png';
import backpack from '../assets/Swan.png';
import teaSet from '../assets/p3.png';

type ProductStatus = 'Active' | 'Low Stock' | 'Draft' | 'Inactive';

type Product = {
  id: string;
  name: string;
  category: string;
  vendor: string;
  price: number;
  stock: number;
  status: ProductStatus;
  rating: number;
  updated: string;
  image: string;
};

const initialProducts: Product[] = [
  {
    id: 'PRD-1201',
    name: 'Handcrafted Singing Bowl Set',
    category: 'Home Decor',
    vendor: 'Everest Crafts',
    price: 2400,
    stock: 128,
    status: 'Active' as ProductStatus,
    rating: 4.8,
    updated: '2h ago',
    image: bowl,
  },
  {
    id: 'PRD-1189',
    name: 'Organic Wildflower Honey',
    category: 'Gourmet Food',
    vendor: 'Kathmandu Organics',
    price: 650,
    stock: 46,
    status: 'Low Stock' as ProductStatus,
    rating: 4.6,
    updated: '1h ago',
    image: honey,
  },
  {
    id: 'PRD-1176',
    name: 'Pashmina Shawl (Limited Edition)',
    category: 'Textiles',
    vendor: 'Himalayan Threads',
    price: 4200,
    stock: 12,
    status: 'Active' as ProductStatus,
    rating: 4.9,
    updated: 'Yesterday',
    image: shawl,
  },

  {
    id: 'PRD-1',
    name: 'Set',
    category: 'Home Decor',
    vendor: 'Everest Crafts',
    price: 1750,
    stock: 8,
    status: 'Draft' as ProductStatus,
    rating: 0,
    updated: 'Draft',
    image: teaSet,
  },
  {
    id: 'PRD-1162',
    name: 'Copper Prayer Wheel',
    category: 'Spiritual',
    vendor: 'Artisan Metalworks',
    price: 1850,
    stock: 0,
    status: 'Inactive' as ProductStatus,
    rating: 4.2,
    updated: '3d ago',
    image: prayerWheel,
  },
  {
    id: 'PRD-1148',
    name: 'Hemp Backpack',
    category: 'Accessories',
    vendor: 'Summit Gear',
    price: 2150,
    stock: 34,
    status: 'Active' as ProductStatus,
    rating: 4.4,
    updated: '5h ago',
    image: backpack,
  },
  {
    id: 'PRD-1135',
    name: 'Ceramic Tea Set',
    category: 'Home Decor',
    vendor: 'Everest Crafts',
    price: 1750,
    stock: 18,
    status: 'Draft' as ProductStatus,
    rating: 0,
    updated: 'Draft',
    image: teaSet,
  },

];

const categories = ['All categories', 'Home Decor', 'Gourmet Food', 'Textiles', 'Spiritual', 'Accessories'];

const AdminProduct = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All categories');

  const handleDelete = (productId: string) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this product?');
    if (!shouldDelete) return;

    setProducts((prev) => prev.filter((product) => product.id !== productId));
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const matchesTerm =
        term.length === 0 ||
        product.name.toLowerCase().includes(term) ||
        product.vendor.toLowerCase().includes(term) ||
        product.id.toLowerCase().includes(term);

      const matchesCategory = selectedCategory === 'All categories' || product.category === selectedCategory;

      return matchesTerm && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const stats = useMemo(() => {
    const total = products.length;
    const averagePrice =
      products.length > 0
        ? Math.round(products.reduce((sum, product) => sum + product.price, 0) / products.length)
        : 0;
    const uniqueVendors = new Set(products.map((product) => product.vendor)).size;
    const topRated =
      products.length > 0
        ? products.reduce((prev, current) => (current.rating > prev.rating ? current : prev))
        : null;
    return [
      {
        label: 'Total Products',
        value: total,
        description: 'Available in catalog',
        icon: FaCube,
        color: 'bg-blue-500',
      },
      {
        label: 'Avg. Price',
        value: `NRP ${averagePrice.toLocaleString()}`,
        description: 'Across all products',
        icon: FaCheckCircle,
        color: 'bg-green-500',
      },
      {
        label: 'Vendors',
        value: uniqueVendors,
        description: 'Supplying catalog',
        icon: FaExclamationTriangle,
        color: 'bg-amber-500',
      },
      {
        label: 'Top Rated',
        value: topRated ? `${topRated.rating.toFixed(1)}/5` : 'N/A',
        description: topRated ? topRated.name : 'No ratings yet',
        icon: FaEllipsisV,
        color: 'bg-slate-500',
      },
    ];
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <AdminNavbar />

        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
                <p className="text-sm text-gray-500">
                  Manage and review marketplace listings, pricing, inventory, and quality metrics.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
                  <FaSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search product, vendor, or ID..."
                    className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    <FaFilter className="h-5 w-5" />
                    Advanced Filters
                  </button>
                  <button className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
                    <FaPlus className="h-5 w-5" />
                    Add Product
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-400">{stat.description}</p>
                    </div>
                    <div className={`${stat.color} rounded-xl p-3 text-white`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </header>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Catalog Overview</h2>
                <p className="text-sm text-gray-500">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 sm:w-48"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="py-3 pr-6 font-medium">Product</th>
                    <th className="py-3 pr-6 font-medium">Category</th>
                    <th className="py-3 pr-6 font-medium">Vendor</th>
                    <th className="py-3 pr-6 font-medium">Price</th>
                    <th className="py-3 pr-6 font-medium">Stock</th>
                    <th className="py-3 pr-6 font-medium">Rating</th>
                    <th className="py-3 pr-6 font-medium text-right">Updated</th>
                    <th className="py-3 pl-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      <td className="py-4 pr-6">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{product.name}</span>
                            <span className="text-xs text-gray-400">{product.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-6">{product.category}</td>
                      <td className="py-4 pr-6 text-gray-600">{product.vendor}</td>
                      <td className="py-4 pr-6 font-semibold text-gray-900">
                        NRP {product.price.toLocaleString()}
                      </td>
                      <td className="py-4 pr-6">
                        <div className="flex items-center gap-3">
                          <div className="relative h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className={`absolute inset-y-0 left-0 rounded-full ${
                                product.stock === 0
                                  ? 'bg-red-500'
                                  : product.stock < 25
                                  ? 'bg-amber-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(100, (product.stock / 150) * 100)}%` }}
                            />
                          </div>
                          <div className="flex flex-col text-xs font-semibold text-gray-700">
                            <span>{product.stock} units</span>
                            <span className="text-[10px] font-medium text-gray-400">
                              {product.stock === 0
                                ? 'Out of stock'
                                : product.stock < 25
                                ? 'Low inventory'
                                : 'In stock'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-6">
                        {product.rating > 0 ? (
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-800">
                            <FaStar className="h-4 w-4 text-yellow-500" />
                            {product.rating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Not rated</span>
                        )}
                      </td>
                      <td className="py-4 pr-6 text-right text-sm text-gray-500">{product.updated}</td>
                      <td className="py-4 pl-6 text-right">
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <FaTrash className="h-4 w-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-500">
                  No products match the selected filters. Adjust filters or search for another product.
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminProduct;

