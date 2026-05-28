import client from './client'

export const getStats = () =>
  client.get('/admin/stats').then((r) => r.data)

export const listAllUsers = () =>
  client.get('/admin/users').then((r) => r.data)

export const listAllOrders = () =>
  client.get('/admin/orders').then((r) => r.data)
