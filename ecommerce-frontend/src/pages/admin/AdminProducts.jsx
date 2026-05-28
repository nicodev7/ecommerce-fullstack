import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listProducts, createProduct, updateProduct, deleteProduct } from '../../api/products'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'

const emptyForm = { name: '', description: '', price: '', stock: '', category: '' }

export default function AdminProducts() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'admin'],
    queryFn: () => listProducts({ limit: 200 }),
  })

  const createMut = useMutation({
    mutationFn: (data) => createProduct({ ...data, price: parseFloat(data.price), stock: parseInt(data.stock) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); resetForm() },
  })

  const updateMut = useMutation({
    mutationFn: (data) => updateProduct(editing, { ...data, price: parseFloat(data.price), stock: parseInt(data.stock) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); resetForm() },
  })

  const deleteMut = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  const resetForm = () => { setForm(emptyForm); setEditing(null); setShowForm(false) }

  const handleEdit = (p) => {
    setEditing(p.id)
    setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category })
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editing) updateMut.mutate(form)
    else createMut.mutate(form)
  }

  if (isLoading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm) }}>
          {showForm ? 'Cancel' : 'Add Product'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Price" type="number" step="any" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            <textarea className="px-3 py-2 border rounded-lg text-sm col-span-full" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            <Button type="submit" className="col-span-full">{editing ? 'Update' : 'Create'}</Button>
          </form>
        </Card>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-right px-4 py-3 font-medium">Price</th>
              <th className="text-right px-4 py-3 font-medium">Stock</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(products || []).map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.category}</td>
                <td className="px-4 py-3 text-right">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{p.stock}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button variant="ghost" onClick={() => handleEdit(p)}>Edit</Button>
                  <Button variant="danger" onClick={() => deleteMut.mutate(p.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
