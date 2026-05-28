import client from './client'

export const getCart = () =>
  client.get('/cart/').then((r) => r.data)

export const addCartItem = (product_id, quantity) =>
  client.post('/cart/items', { product_id, quantity }).then((r) => r.data)

export const updateCartItem = (itemId, quantity) =>
  client.put(`/cart/items/${itemId}`, { quantity }).then((r) => r.data)

export const removeCartItem = (itemId) =>
  client.delete(`/cart/items/${itemId}`).then((r) => r.data)

export const clearCart = () =>
  client.delete('/cart/').then((r) => r.data)
