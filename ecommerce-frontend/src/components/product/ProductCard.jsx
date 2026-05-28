import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
        <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            'No image'
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-indigo-600 font-medium uppercase">{product.category}</p>
          <h3 className="font-semibold text-gray-900 mt-1 group-hover:text-indigo-600 transition">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
          <p className="text-lg font-bold text-gray-900 mt-2">${product.price.toFixed(2)}</p>
        </div>
      </div>
    </Link>
  )
}
