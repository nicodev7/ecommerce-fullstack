import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import AdminRoute from './AdminRoute'

afterEach(() => {
  useAuthStore.getState().logout()
})

describe('AdminRoute', () => {
  it('renders children when user is admin', () => {
    useAuthStore.getState().setAuth({ role: 'admin' }, 'admin-token')
    render(
      <MemoryRouter initialEntries={['/admin-panel']}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin-panel" element={<p>Admin Content</p>} />
          </Route>
          <Route path="/login" element={<p>Login Page</p>} />
          <Route path="/" element={<p>Home Page</p>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('redirects to / when user is not admin', () => {
    useAuthStore.getState().setAuth({ role: 'user' }, 'user-token')
    render(
      <MemoryRouter initialEntries={['/admin-panel']}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin-panel" element={<p>Admin Content</p>} />
          </Route>
          <Route path="/login" element={<p>Login Page</p>} />
          <Route path="/" element={<p>Home Page</p>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Home Page')).toBeInTheDocument()
  })

  it('redirects to /login when no token', () => {
    useAuthStore.getState().logout()
    render(
      <MemoryRouter initialEntries={['/admin-panel']}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin-panel" element={<p>Admin Content</p>} />
          </Route>
          <Route path="/login" element={<p>Login Page</p>} />
          <Route path="/" element={<p>Home Page</p>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })
})
