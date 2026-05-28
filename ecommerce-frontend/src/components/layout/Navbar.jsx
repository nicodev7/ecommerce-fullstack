import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              Shop
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              <Link to="/products" className="text-sm text-gray-600 hover:text-gray-900">
                Products
              </Link>
              {user && (
                <Link to="/cart" className="text-sm text-gray-600 hover:text-gray-900">
                  Cart
                </Link>
              )}
              {user && (
                <Link to="/orders" className="text-sm text-gray-600 hover:text-gray-900">
                  Orders
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900">
                  {user.email}
                </Link>
                <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
