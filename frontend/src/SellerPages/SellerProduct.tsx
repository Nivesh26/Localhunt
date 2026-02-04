import { useState, useEffect } from 'react'
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCube,
  FaDollarSign,
  FaTimes,
} from 'react-icons/fa'
import SellerNavbar from '../SellerComponents/SellerNavbar'
import { toast } from 'react-toastify'
import { sessionUtils } from '../utils/sessionUtils'
import { useNavigate } from 'react-router-dom'

type Product = {
  id: number
  name: string
  sku: string
  price: number
  stock: number
  status: 'Live' | 'Draft' | 'Out of stock' | 'Unlisted'
  category: string
  imageUrl?: string
  description: string
  handcrafted: boolean
  specs: string[]
  sizeEu?: string
  sizeClothing?: string
}

const categories = [
  'Home Decor',
  'Gourmet Food',
  'Textiles',
  'Spiritual',
  'Accessories',
  'Clothing',
  'Handicrafts',
  'Jewelry',
  'Masks',
  'Pottery',
  'Brassware',
  'Traditional Food',
  'Other',
]

const SellerProduct = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [category, setCategory] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [handcrafted, setHandcrafted] = useState(true)
  const [specsText, setSpecsText] = useState('')
  const [sizeEu, setSizeEu] = useState<string[]>([])
  const [sizeClothing, setSizeClothing] = useState<string[]>([])
  const [sizeEuDropdownOpen, setSizeEuDropdownOpen] = useState(false)
  const [sizeClothingDropdownOpen, setSizeClothingDropdownOpen] = useState(false)

  const [errors, setErrors] = useState<{
    name?: string
    sku?: string
    price?: string
    stock?: string
    category?: string
    description?: string
    image?: string
  }>({})

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const user = sessionUtils.getUser()
      if (!user) {
        toast.error('Please login to view products')
        return
      }

      const sellerId = user.userId

      const response = await fetch(`http://localhost:8080/api/products/seller/${sellerId}`)
      if (response.ok) {
        const data = await response.json()
        // Convert backend response to frontend format
        const formattedProducts: Product[] = data.map((p: any) => {
          // Convert comma-separated imageUrl paths to full URLs
          let imageUrl = p.imageUrl || ''
          if (imageUrl) {
            // Parse comma-separated URLs and convert each to full URL
            const urls = imageUrl.split(',').map((url: string) => {
              const trimmed = url.trim()
              if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
                return `http://localhost:8080${trimmed.startsWith('/') ? trimmed : '/' + trimmed}`
              }
              return trimmed
            }).filter(Boolean)
            imageUrl = urls.join(',')
          }
          
          return {
            id: p.id,
            name: p.name,
            sku: p.sku,
            price: p.price,
            stock: p.stock,
            status: p.status as 'Live' | 'Draft' | 'Out of stock' | 'Unlisted',
            category: p.category,
            imageUrl: imageUrl,
            description: p.description || '',
            handcrafted: false, // Not stored in backend currently
            specs: p.specs ? p.specs.split('\n').filter((s: string) => s.trim()) : [],
            sizeEu: p.sizeEu || '',
            sizeClothing: p.sizeClothing || '',
          }
        })
        setProducts(formattedProducts)
      } else if (response.status === 404) {
        // Seller was deleted from database
        sessionUtils.clearSession()
        toast.error('Your account has been deleted. Please contact support.')
        navigate('/sellerlogin')
      } else {
        toast.error('Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('An error occurred while fetching products')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEditingProductId(null)
    setName('')
    setSku('')
    setPrice('')
    setStock('')
    setCategory('')
    setImageUrls([])
    setDescription('')
    setHandcrafted(true)
    setSpecsText('')
    setSizeEu([])
    setSizeClothing([])
    setErrors({})
  }

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id)
    setName(product.name)
    setSku(product.sku)
    setPrice(product.price.toString())
    setStock(product.stock.toString())
    setCategory(product.category)
    // Parse comma-separated image URLs to array
    const imageUrlsArray = product.imageUrl ? product.imageUrl.split(',').map(url => url.trim()).filter(Boolean) : []
    setImageUrls(imageUrlsArray)
    setDescription(product.description || '')
    setSpecsText(product.specs.join('\n'))
    setSizeEu(product.sizeEu ? product.sizeEu.split(',').map(s => s.trim()).filter(Boolean) : [])
    setSizeClothing(product.sizeClothing ? product.sizeClothing.split(',').map(s => s.trim()).filter(Boolean) : [])
    setErrors({})
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddProduct = async () => {
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = 'Product name is required'
    }

    if (!sku.trim()) {
      newErrors.sku = 'SKU is required'
    }

    if (!category) {
      newErrors.category = 'Category is required'
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

    if (imageUrls.length === 0) {
      newErrors.image = 'At least 1 product image is required'
    } else if (imageUrls.length > 4) {
      newErrors.image = 'Maximum 4 images allowed'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    setSaving(true)
    try {
      const user = sessionUtils.getUser()
      if (!user) {
        toast.error('Please login to add products')
        return
      }

      const sellerId = user.userId

      const specs = specsText
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .join('\n')

      // Convert imageUrls array to comma-separated paths (remove http://localhost:8080 if present)
      const imageUrlPaths = imageUrls.map(url => {
        let path = url.trim()
        if (path.startsWith('http://localhost:8080')) {
          path = path.replace('http://localhost:8080', '')
        }
        return path
      }).filter(Boolean).join(',')

      const productData = {
        name: name.trim(),
        sku: sku.trim(),
        price: Number(price),
        stock: Number(stock),
        category: category,
        description: description.trim(),
        imageUrl: imageUrlPaths,
        specs: specs,
        sizeEu: sizeEu.length > 0 ? sizeEu.join(', ') : null,
        sizeClothing: sizeClothing.length > 0 ? sizeClothing.join(', ') : null,
        sellerId: sellerId,
      }

      const url = editingProductId
        ? `http://localhost:8080/api/products/${editingProductId}`
        : 'http://localhost:8080/api/products'
      
      const method = editingProductId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(editingProductId ? 'Product updated successfully!' : 'Product added successfully!')
        // Reset form
        resetForm()
        // Refresh products list
        fetchProducts()
      } else if (response.status === 404) {
        // Seller was deleted from database
        sessionUtils.clearSession()
        toast.error('Your account has been deleted. Please contact support.')
        navigate('/sellerlogin')
      } else {
        toast.error(data.message || (editingProductId ? 'Failed to update product' : 'Failed to add product'))
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error(editingProductId ? 'An error occurred while updating the product' : 'An error occurred while adding the product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Product deleted successfully')
        // Refresh products list
        fetchProducts()
      } else {
        toast.error(data.message || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('An error occurred while deleting the product')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-4 lg:gap-6 px-4 sm:px-6 py-8 pt-14 lg:pt-8">
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
              <h2 className="text-sm font-semibold text-gray-900">
                {editingProductId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {editingProductId
                  ? 'Update the product details and click &quot;Update product&quot; to save changes.'
                  : 'Fill in the details and click &quot;Add product&quot; to create a new listing.'}
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
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">Category</label>
                  <select
                    value={category}
                    onChange={e => {
                      setCategory(e.target.value)
                      if (errors.category) setErrors({ ...errors, category: undefined })
                    }}
                    className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-200 ${
                      errors.category ? 'border-red-500' : 'border-gray-200 focus:border-red-500'
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-medium text-gray-700">Product images (1-4 images required)</span>
                  <div className="flex flex-col gap-3">
                    {/* Image Preview Grid */}
                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Product image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newUrls = imageUrls.filter((_, i) => i !== index)
                                setImageUrls(newUrls)
                                if (errors.image) setErrors({ ...errors, image: undefined })
                              }}
                              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Upload Button */}
                    {imageUrls.length < 4 && (
                      <div className="flex flex-col gap-1 text-xs">
                        <label className="text-gray-600">Upload from computer ({imageUrls.length}/4)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async e => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            
                            if (imageUrls.length >= 4) {
                              toast.error('Maximum 4 images allowed')
                              return
                            }

                            if (errors.image) setErrors({ ...errors, image: undefined })

                            // Upload file immediately
                            try {
                              const formData = new FormData()
                              formData.append('file', file)

                              const uploadResponse = await fetch('http://localhost:8080/api/products/upload', {
                                method: 'POST',
                                body: formData,
                              })

                              const uploadData = await uploadResponse.json()
                              if (uploadData.success && uploadData.fileUrl) {
                                const newUrl = `http://localhost:8080${uploadData.fileUrl}`
                                setImageUrls([...imageUrls, newUrl])
                              } else {
                                toast.error('Failed to upload image')
                              }
                            } catch (error) {
                              console.error('Error uploading file:', error)
                              toast.error('Error uploading image')
                            }
                            // Reset file input
                            e.target.value = ''
                          }}
                          className={`rounded-lg border bg-white px-2 py-1 text-xs file:mr-2 file:rounded-md file:border-0 file:bg-red-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-red-700 ${
                            errors.image ? 'border-red-500' : 'border-gray-200'
                          }`}
                        />
                      </div>
                    )}
                    {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
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
                  <div className="flex flex-col gap-1 relative">
                    <label className="text-xs font-medium text-gray-700">Size EU (for footwear)</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSizeEuDropdownOpen(!sizeEuDropdownOpen)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-left focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-200 bg-white flex items-center justify-between"
                      >
                        <span className={sizeEu.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
                          {sizeEu.length === 0 ? 'Select sizes' : `${sizeEu.length} size(s) selected`}
                        </span>
                        <svg
                          className={`w-4 h-4 text-gray-500 transition-transform ${sizeEuDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {sizeEuDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setSizeEuDropdownOpen(false)}
                          ></div>
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {['38', '39', '40', '41', '42'].map((size) => (
                              <label
                                key={size}
                                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={sizeEu.includes(size)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSizeEu([...sizeEu, size])
                                    } else {
                                      setSizeEu(sizeEu.filter(s => s !== size))
                                    }
                                  }}
                                  className="mr-3 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <span className="text-sm text-gray-700">{size}</span>
                              </label>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {sizeEu.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sizeEu.map(size => (
                          <span
                            key={size}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium"
                          >
                            {size}
                            <button
                              type="button"
                              onClick={() => setSizeEu(sizeEu.filter(s => s !== size))}
                              className="hover:text-red-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 relative">
                    <label className="text-xs font-medium text-gray-700">Size (for clothes)</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSizeClothingDropdownOpen(!sizeClothingDropdownOpen)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-left focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-200 bg-white flex items-center justify-between"
                      >
                        <span className={sizeClothing.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
                          {sizeClothing.length === 0 ? 'Select sizes' : `${sizeClothing.length} size(s) selected`}
                        </span>
                        <svg
                          className={`w-4 h-4 text-gray-500 transition-transform ${sizeClothingDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {sizeClothingDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setSizeClothingDropdownOpen(false)}
                          ></div>
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => (
                              <label
                                key={size}
                                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={sizeClothing.includes(size)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSizeClothing([...sizeClothing, size])
                                    } else {
                                      setSizeClothing(sizeClothing.filter(s => s !== size))
                                    }
                                  }}
                                  className="mr-3 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <span className="text-sm text-gray-700">{size}</span>
                              </label>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {sizeClothing.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sizeClothing.map(size => (
                          <span
                            key={size}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium"
                          >
                            {size}
                            <button
                              type="button"
                              onClick={() => setSizeClothing(sizeClothing.filter(s => s !== size))}
                              className="hover:text-red-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
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

                <div className="mt-2 flex gap-2">
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={saving}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    disabled={saving}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingProductId ? (
                      <>
                        {saving ? 'Updating...' : 'Update product'}
                      </>
                    ) : (
                      <>
                        <FaPlus className="h-5 w-5" />
                        {saving ? 'Adding...' : 'Add product'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          </section>

          {/* Product list – only Live, Draft, Out of stock (removed/Unlisted show in Removed from shop page) */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Product Catalog</h2>
              <p className="text-xs text-gray-500">Showing {products.filter(p => p.status !== 'Unlisted').length} products</p>
            </div>

            {loading ? (
              <div className="mt-4 flex items-center justify-center py-12">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : (
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
                      Category
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
                  {products.filter(p => p.status !== 'Unlisted').map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl.split(',')[0].trim()}
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
                      <td className="px-4 py-3 text-gray-500">{product.category}</td>
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
                          <button
                            onClick={() => handleEdit(product)}
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                          >
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
                  {products.filter(p => p.status !== 'Unlisted').length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-6 text-center text-xs text-gray-500">
                        No products in catalog. Use the form above to add a product. Removed items are in Removed from shop.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default SellerProduct