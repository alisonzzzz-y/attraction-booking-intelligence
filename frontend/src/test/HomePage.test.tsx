import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HomePage } from '../app/HomePage'

describe('HomePage', () => {
  it('explains the product direction without presenting ticket data', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: 'Plan the attractions that cannot wait.',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Pre-API phase')).toBeInTheDocument()
    expect(
      screen.getByText('Workflow preview only. No ticket data is shown.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'See how the data works' }),
    ).toHaveAttribute('href', '/methodology')
  })
})
