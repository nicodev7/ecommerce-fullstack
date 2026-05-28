import client from './client'

export const listOrders = () =>
  client.get('/orders/').then((r) => r.data)

export const getOrder = (id) =>
  client.get(`/orders/${id}`).then((r) => r.data)

export const createOrder = () =>
  client.post('/orders/').then((r) => r.data)

export const updateOrderStatus = (id, status) =>
  client.patch(`/orders/${id}/status`, { status }).then((r) => r.data)
