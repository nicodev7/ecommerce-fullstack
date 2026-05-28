import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProduct } from '../../api/products'
import { addCartItem } from '../../api/cart'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [added, setAdded] = useState(false)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
  })

  const handleAddToCart = async () => {
    if (!token) return navigate('/login')
    try {
      await addCartItem(product.id, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      alert('Failed to add to cart')
    }
  }

  if (isLoading) return <Spinner />
  if (!product) return <p className="text-center text-gray-500">Product not found</p>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="h-80 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            'No image'
          )}
        </div>
        <div>
          <p className="text-xs text-indigo-600 font-medium uppercase">{product.category}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.name}</h1>
          <p className="text-2xl font-bold text-gray-900 mt-4">${product.price.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
          <p className="text-gray-600 mt-4">{product.description}</p>
          <Button onClick={handleAddToCart} className="mt-6 w-full" disabled={product.stock <= 0}>
            {added ? 'Added!' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  )
}
