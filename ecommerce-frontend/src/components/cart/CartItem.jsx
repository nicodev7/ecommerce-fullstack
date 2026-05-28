export default function CartItem({ item, onUpdateQty, onRemove }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100">
      <div>
        <p className="font-medium text-gray-900">{item.name || item.product_id}</p>
        <p className="text-sm text-gray-500">${item.price?.toFixed(2) || '—'} each</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => onUpdateQty(item.id, Math.max(1, item.quantity - 1))}
            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
          >
            -
          </button>
          <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQty(item.id, item.quantity + 1)}
            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
          >
            +
          </button>
        </div>
        <button onClick={() => onRemove(item.id)} className="text-sm text-red-600 hover:text-red-800">
          Remove
        </button>
      </div>
    </div>
  )
}
