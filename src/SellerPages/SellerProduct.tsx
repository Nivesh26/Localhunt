import { useState } from 'react'
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCube,
  FaDollarSign,
} from 'react-icons/fa'
import SellerNavbar from '../SellerComponents/SellerNavbar'
import P1 from '../assets/P1.png'
import P2 from '../assets/P2.png'
import P3 from '../assets/p3.png'

type Product = {
  id: number
  name: string
  sku: string
  price: number
  stock: number
  status: 'Live' | 'Draft' | 'Out of stock'
  imageUrl?: string
  description: string
  handcrafted: boolean
  specs: string[]
  sizeEu?: string
  sizeClothing?: string
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Handwoven Dhaka Scarf',
    sku: 'DHK-241',
    price: 1800,
    stock: 18,
    status: 'Live',
    imageUrl: P1,
    description:
      'Handwoven Dhaka scarf crafted with natural fibres for everyday wear and home styling.',
    handcrafted: true,
    specs: [
      'Premium natural fibres with soft touch',
      'Designed for everyday wear and home styling',
      'Made in Nepal with traditional techniques',
    ],
  },
  {
    id: 2,
    name: 'Himalayan Organic Tea Pack',
    sku: 'TEA-112',
    price: 950,
    stock: 42,
    status: 'Live',
    imageUrl: P2,
    description: 'Assorted Himalayan organic teas sourced from high altitude family farms.',
    handcrafted: false,
    specs: [
      'Organic tea leaves from high altitude farms',
      'Balanced selection of flavours for daily use',
      'Packed in eco-conscious materials',
    ],
  },
  {
    id: 3,
    name: 'Lokta Paper Journal',
    sku: 'LKT-089',
    price: 550,
    stock: 0,
    status: 'Out of stock',
    imageUrl: P3,
    description: 'Lokta paper journal with textured cover, ideal for sketching and journaling.',
    handcrafted: true,
    specs: [
      'Lokta paper pages with natural texture',
      'Suitable for sketching, journaling and gifts',
      'Handcrafted by local artisans in Nepal',
    ],
  },
]

const SellerProduct = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFilePreview, setImageFilePreview] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [handcrafted, setHandcrafted] = useState(true)
  const [specsText, setSpecsText] = useState('')
  const [sizeEu, setSizeEu] = useState('')
  const [sizeClothing, setSizeClothing] = useState('')

  const [errors, setErrors] = useState<{
    name?: string
    sku?: string
    price?: string
    stock?: string
    description?: string
    image?: string
  }>({})

  const handleAddProduct = () => {
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = 'Product name is required'
    }

    if (!sku.trim()) {
      newErrors.sku = 'SKU is required'
    }

    if (!price || Number(price) <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }

    if (!stock || Number(stock) < 0) {
      newErrors.stock = 'Stock must be 0 or greater'
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required'
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (!imageFilePreview && !imageUrl.trim()) {
      newErrors.image = 'Product image is required'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    const finalImage = imageFilePreview || (imageUrl.trim() || undefined)
    const specs = specsText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)

    const newProduct: Product = {
      id: Date.now(),
      name: name.trim(),
      sku: sku.trim(),
      price: Number(price),
      stock: Number(stock),
      status: Number(stock) > 0 ? 'Live' : 'Out of stock',
      imageUrl: finalImage,
      description: description.trim(),
      handcrafted,
      specs,
      sizeEu: sizeEu.trim() || undefined,
      sizeClothing: sizeClothing.trim() || undefined,
    }

    setProducts(prev => [newProduct, ...prev])
    setName('')
    setSku('')
    setPrice('')
    setStock('')
    setImageUrl('')
    setImageFilePreview(null)
    setDescription('')
    setHandcrafted(true)
    setSpecsText('')
    setSizeEu('')
    setSizeClothing('')
    setErrors({})
  }

  const handleDelete = (id: number) => {
    setProducts(prev => prev.filter(product => product.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <SellerNavbar />

        <main className="flex-1 space-y-8">
          {/* Header */}
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white">
                  Products
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Manage Store Products</h1>
                  <p className="text-sm text-gray-500">
                    Add, update, or remove products that appear on your Local Hunt storefront.
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Quick stats + Add product form */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1.1fr]">
            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900">Catalog Summary</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-red-50 px-3 py-3">
                  <div className="rounded-xl bg-red-600 p-2 text-white">
                    <FaCube className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total products</p>
                    <p className="text-lg font-semibold text-gray-900">{products.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-3 py-3">
                  <div className="rounded-xl bg-emerald-500 p-2 text-white">
                    <FaDollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Live products</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {products.filter(p => p.status === 'Live').length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-amber-50 px-3 py-3">
                  <div className="rounded-xl bg-amber-500 p-2 text-white">
                    <FaCube className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Out of stock</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {products.filter(p => p.stock === 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900">Add New Product</h2>
              <p className="mt-1 text-xs text-gray-500">
                Fill in the details and click &quot;Add product&quot; to create a new listing.
              </p>

              <div className="mt-4 space-y-3 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-700">Product name</label>
                    <input
                      value={name}
                      onChange={e => {
                        setName(e.target.value)
                        if (errors.name) setErrors({ ...errors, name: undefined })
                      }}
                      type="text"
                      placeholder="Product name"
                      className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-200 ${
                        errors.name ? 'border-red-500' : 'border-gray-200 focus:border-red-500'
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-700">SKU (Stock Keeping Unit)</label>
                    <input
                      value={sku}
                      onChange={e => {
                        setSku(e.target.value)
                        if (errors.sku) setErrors({ ...errors, sku: undefined })
                      }}
                      type="text"
                      placeholder="DHK-241"
                      className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-200 ${
                        errors.sku ? 'border-red-500' : 'border-gray-200 focus:border-red-500'
                      }`}
                    />
                    {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-medium text-gray-700">Product image</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-gray-600">Upload from computer</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const url = URL.createObjectURL(file)
                          setImageFilePreview(url)
                          setImageUrl('')
                          if (errors.image) setErrors({ ...errors, image: undefined })
                        }}
                        className={`rounded-lg border bg-white px-2 py-1 text-xs file:mr-2 file:rounded-md file:border-0 file:bg-red-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-red-700 ${
                          errors.image ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                      {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">Short description</label>
                  <textarea
                    value={description}
                    onChange={e => {
                      setDescription(e.target.value)
                      if (errors.description) setErrors({ ...errors, description: undefined })
                    }}
                    rows={3}
                    placeholder="Describe the product, materials, and what makes it special for customers."
                    className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-200 ${
                      errors.description ? 'border-red-500' : 'border-gray-200 focus:border-red-500'
                    }`}
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                  <span className="text-[11px] text-gray-400">
                    This appears on the product page, similar to the description buyers see on the storefront.
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-700">Size EU (for footwear)</span>
                    <input
                      value={sizeEu}
                      onChange={e => setSizeEu(e.target.value)}
                      type="text"
                      placeholder="EU sizes"
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-200"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-700">Size (for clothes)</span>
                    <input
                      value={sizeClothing}
                      onChange={e => setSizeClothing(e.target.value)}
                      type="text"
                      placeholder="Clothing sizes"
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-200"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-700">Specifications (bullet points)</span>
                  <textarea
                    value={specsText}
                    onChange={e => setSpecsText(e.target.value)}
                    rows={3}
                    placeholder={'Write one feature per line'}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-200"
                  />
                  <span className="text-[11px] text-gray-400">
                    Each new line becomes a bullet point in the product specifications (like on the product detail page).
                  </span>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-700">Price (NRP)</label>
                    <input
                      value={price}
                      onChange={e => {
                        setPrice(e.target.value)
                        if (errors.price) setErrors({ ...errors, price: undefined })
                      }}
                      type="number"
                      min="0"
                      placeholder="Price in NRP"
                      className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-200 ${
                        errors.price ? 'border-red-500' : 'border-gray-200 focus:border-red-500'
                      }`}
                    />
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-700">Stock</label>
                    <input
                      value={stock}
                      onChange={e => {
                        setStock(e.target.value)
                        if (errors.stock) setErrors({ ...errors, stock: undefined })
                      }}
                      type="number"
                      min="0"
                      placeholder="Stock quantity"
                      className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-200 ${
                        errors.stock ? 'border-red-500' : 'border-gray-200 focus:border-red-500'
                      }`}
                    />
                    {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <FaPlus className="h-5 w-5" />
                  Add product
                </button>
              </div>
            </article>
          </section>

          {/* Product list */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Product Catalog</h2>
              <p className="text-xs text-gray-500">Showing {products.length} products</p>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Photo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Sizes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Details
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                            No image
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-900">{product.name}</td>
                      <td className="px-4 py-3 text-gray-500">{product.sku}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">NRP {product.price}</td>
                      <td className="px-4 py-3 text-gray-500">{product.stock}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            product.status === 'Live'
                              ? 'bg-emerald-50 text-emerald-700'
                              : product.status === 'Out of stock'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {product.sizeEu && (
                          <p>
                            <span className="font-medium">EU:</span> {product.sizeEu}
                          </p>
                        )}
                        {product.sizeClothing && (
                          <p>
                            <span className="font-medium">Clothes:</span> {product.sizeClothing}
                          </p>
                        )}
                        {!product.sizeEu && !product.sizeClothing && <span>—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        <p className="line-clamp-2">{product.description || '—'}</p>
                        {product.specs && product.specs.length > 0 && (
                          <ul className="mt-1 space-y-0.5 text-[11px] text-gray-500">
                            {product.specs.slice(0, 3).map((spec, i) => (
                              <li key={i} className="flex gap-1">
                                <span>•</span>
                                <span className="line-clamp-1">{spec}</span>
                              </li>
                            ))}
                            {product.specs.length > 3 && (
                              <li className="text-[11px] text-gray-400">+ more specs</li>
                            )}
                          </ul>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700">
                            <FaEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-xs text-gray-500">
                        No products yet. Use the form above to add your first product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default SellerProduct