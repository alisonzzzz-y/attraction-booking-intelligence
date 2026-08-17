import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { MethodologyPage } from '../app/MethodologyPage'

describe('MethodologyPage', () => {
  it('keeps unknown and failed provider states distinct', () => {
    render(
      <MemoryRouter>
        <MethodologyPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: 'A ticket fact needs evidence, context, and a clock.',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Unknown')).toBeInTheDocument()
    expect(screen.getByText('Request failed')).toBeInTheDocument()
    expect(screen.getByText(/It will not generate prices/)).toBeInTheDocument()
  })
})
