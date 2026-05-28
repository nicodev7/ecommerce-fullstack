import { useQuery } from '@tanstack/react-query'
import { listProducts } from '../../api/products'
import ProductGrid from '../../components/product/ProductGrid'
import Spinner from '../../components/ui/Spinner'
import { Link } from 'react-router-dom'

export default function Home() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => listProducts({ limit: 8 }),
  })

  return (
    <div>
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to the Shop</h1>
        <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
          Browse our catalog and find what you need.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
        >
          Browse Products
        </Link>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-sm text-indigo-600 hover:text-indigo-800">
            View all &rarr;
          </Link>
        </div>
        {isLoading ? <Spinner /> : <ProductGrid products={products || []} />}
      </section>
    </div>
  )
}
