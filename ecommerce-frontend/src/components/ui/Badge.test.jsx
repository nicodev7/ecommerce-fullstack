import { render, screen } from '@testing-library/react'
import Badge from './Badge'

describe('Badge', () => {
  it.each(['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'failed'])(
    'renders %s status',
    (status) => {
      render(<Badge status={status} />)
      expect(screen.getByText(status)).toBeInTheDocument()
    },
  )
})
