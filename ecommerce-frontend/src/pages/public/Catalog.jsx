import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listProducts } from '../../api/products'
import ProductGrid from '../../components/product/ProductGrid'
import Spinner from '../../components/ui/Spinner'

export default function Catalog() {
  const [category, setCategory] = useState('')

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', category],
    queryFn: () => listProducts({ category: category || undefined, limit: 100 }),
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Products</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter by category..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {isLoading ? <Spinner /> : <ProductGrid products={products || []} />}
    </div>
  )
}
