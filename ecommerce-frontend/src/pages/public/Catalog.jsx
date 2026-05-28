import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listProducts } from '../../api/products'
import ProductGrid from '../../components/product/ProductGrid'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

const PAGE_SIZE = 12

export default function Catalog() {
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(0)

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', category, page],
    queryFn: () => listProducts({ category: category || undefined, skip: page * PAGE_SIZE, limit: PAGE_SIZE }),
  })

  const hasNext = (products || []).length >= PAGE_SIZE

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Products</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter by category..."
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(0) }}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {isLoading ? <Spinner /> : <ProductGrid products={products || []} />}
      <div className="flex items-center justify-center gap-4 mt-8">
        <Button variant="secondary" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
          Previous
        </Button>
        <span className="text-sm text-gray-500">Page {page + 1}</span>
        <Button variant="secondary" onClick={() => setPage((p) => p + 1)} disabled={!hasNext}>
          Next
        </Button>
      </div>
    </div>
  )
}
