import client from './client'

export const initiatePayment = (order_id, method) =>
  client.post('/payments/', { order_id, method }).then((r) => r.data)

export const getPayment = (id) =>
  client.get(`/payments/${id}`).then((r) => r.data)

export const simulatePayment = (id) =>
  client.post(`/payments/${id}/simulate`).then((r) => r.data)
