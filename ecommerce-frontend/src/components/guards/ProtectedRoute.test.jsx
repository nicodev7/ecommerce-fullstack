import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import ProtectedRoute from './ProtectedRoute'

afterEach(() => {
  useAuthStore.getState().logout()
})

describe('ProtectedRoute', () => {
  it('renders children when token exists', () => {
    useAuthStore.getState().setAuth({ role: 'user' }, 'valid-token')
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<p>Protected Content</p>} />
          </Route>
          <Route path="/login" element={<p>Login Page</p>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /login when no token', () => {
    useAuthStore.getState().logout()
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<p>Protected Content</p>} />
          </Route>
          <Route path="/login" element={<p>Login Page</p>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })
})
