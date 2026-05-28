import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getCart, updateCartItem, removeCartItem, clearCart } from '../../api/cart'
import { createOrder } from '../../api/orders'
import CartItem from '../../components/cart/CartItem'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

export default function Cart() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
  })

  const updateQty = useMutation({
    mutationFn: ({ itemId, quantity }) => updateCartItem(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  const removeItem = useMutation({
    mutationFn: (itemId) => removeCartItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  const clear = useMutation({
    mutationFn: clearCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  const checkout = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => navigate(`/orders/${order.id}`),
  })

  if (isLoading) return <Spinner />

  const items = cart?.items || []

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        {items.length > 0 && (
          <Button variant="ghost" onClick={() => clear.mutate()}>
            Clear
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Your cart is empty</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQty={(itemId, qty) => updateQty.mutate({ itemId, quantity: qty })}
              onRemove={(itemId) => removeItem.mutate(itemId)}
            />
          ))}
          <Button onClick={() => checkout.mutate()} className="w-full mt-6">
            Place Order
          </Button>
        </div>
      )}
    </div>
  )
}
