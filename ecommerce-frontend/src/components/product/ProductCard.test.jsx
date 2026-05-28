import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductCard from './ProductCard'

const product = {
  id: '123',
  name: 'Test Widget',
  price: 29.99,
  category: 'gadgets',
  description: 'A test product',
  images: [],
}

const renderCard = () =>
  render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>,
  )

describe('ProductCard', () => {
  it('renders product name', () => {
    renderCard()
    expect(screen.getByText('Test Widget')).toBeInTheDocument()
  })

  it('renders price', () => {
    renderCard()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
  })

  it('renders category', () => {
    renderCard()
    expect(screen.getByText('gadgets')).toBeInTheDocument()
  })

  it('renders description', () => {
    renderCard()
    expect(screen.getByText('A test product')).toBeInTheDocument()
  })

  it('links to product detail page', () => {
    renderCard()
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/products/123')
  })
})
