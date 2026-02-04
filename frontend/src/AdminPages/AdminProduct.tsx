import { useMemo, useState, useEffect } from 'react';
import {
  FaSearch,
  FaEllipsisV,
  FaStar,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCube,
  FaTrash,
} from 'react-icons/fa';
import AdminNavbar from '../AdminComponents/AdminNavbar';
import { toast } from 'react-toastify';

type ProductStatus = 'Active' | 'Low Stock' | 'Draft' | 'Inactive';

type Product = {
  id: number;
  name: string;
  category: string;
  vendor: string;
  price: number;
  stock: number;
  status: ProductStatus;
  rating: number;
  updated: string;
  image: string;
  sku: string;
};

type BackendProduct = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  imageUrl: string;
  status: string;
  specs: string;
  sizeEu: string;
  sizeClothing: string;
  sellerId: number;
  sellerName: string;
  createdAt: string;
  updatedAt: string;
};

const AdminProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All categories');

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Map backend status to frontend status
  const mapStatus = (status: string, stock: number): ProductStatus => {
    if (status === 'Draft') return 'Draft';
    if (status === 'Out of stock' || stock === 0) return 'Inactive';
    if (stock < 25) return 'Low Stock';
    return 'Active';
  };

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data: BackendProduct[] = await response.json();
        
        const formattedProducts: Product[] = data.map((p) => {
          // Parse comma-separated image URLs and convert first one to full URL
          let imageUrl = '';
          if (p.imageUrl) {
            // Get first image from comma-separated string
            const firstImage = p.imageUrl.split(',')[0].trim();
            if (firstImage) {
              // If it already starts with http, use it as is
              if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
                imageUrl = firstImage;
              } else {
                // Otherwise, prepend the backend URL
                imageUrl = `http://localhost:8080${firstImage.startsWith('/') ? firstImage : '/' + firstImage}`;
              }
            }
          }
          
          return {
            id: p.id,
            name: p.name,
            category: p.category,
            vendor: p.sellerName || 'Unknown Vendor',
            price: p.price,
            stock: p.stock,
            status: mapStatus(p.status, p.stock),
            rating: 0, // Backend doesn't have rating yet
            updated: formatRelativeTime(p.updatedAt),
            image: imageUrl,
            sku: p.sku,
          };
        });

        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (productId: number) => {
    const shouldDelete = window.confirm(
      'Permanently delete this product? All related data (reviews, orders, chat, etc.) will be removed from the database. This cannot be undone.'
    );
    if (!shouldDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data.message === 'string' ? data.message : 'Failed to delete product');
      }

      setProducts((prev) => prev.filter((product) => product.id !== productId));
      toast.success('Product deleted permanently');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete product');
    }
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const matchesTerm =
        term.length === 0 ||
        product.name.toLowerCase().includes(term) ||
        product.vendor.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.id.toString().includes(term);

      const matchesCategory = selectedCategory === 'All categories' || product.category === selectedCategory;

      return matchesTerm && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Get unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map((p) => p.category))).sort();
    return ['All categories', ...uniqueCategories];
  }, [products]);

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
              {loading ? (
                <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-500">
                  Loading products...
                </div>
              ) : (
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
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  // Replace broken image with placeholder
                                  const target = e.target as HTMLImageElement;
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                  }
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                                <FaCube className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{product.name}</span>
                            <span className="text-xs text-gray-400">{product.sku}</span>
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
              )}

              {!loading && filteredProducts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-500">
                  {products.length === 0
                    ? 'No products found. Products will appear here once vendors add them.'
                    : 'No products match the selected filters. Adjust filters or search for another product.'}
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

