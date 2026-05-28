import client from './client'

export const listProducts = (params) =>
  client.get('/products/', { params }).then((r) => r.data)

export const getProduct = (id) =>
  client.get(`/products/${id}`).then((r) => r.data)

export const createProduct = (data) =>
  client.post('/products/', data).then((r) => r.data)

export const updateProduct = (id, data) =>
  client.put(`/products/${id}`, data).then((r) => r.data)

export const deleteProduct = (id) =>
  client.delete(`/products/${id}`).then((r) => r.data)
