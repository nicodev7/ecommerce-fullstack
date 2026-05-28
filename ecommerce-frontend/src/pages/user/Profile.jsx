import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { updateMe } from '../../api/users'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

export default function Profile() {
  const { user, setAuth } = useAuthStore()
  const [email, setEmail] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateMe(email)
      setAuth({ ...user, email: updated.email }, localStorage.getItem('token'))
    } catch {
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-8">
      <h1 className="text-2xl font-bold text-gray-900 text-center">Profile</h1>
      <Card className="mt-6">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <p className="text-xs text-gray-400">Role: {user?.role}</p>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
