import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HomePage } from '../app/HomePage'

describe('HomePage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the project scope and a successful backend health check', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'UP' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>,
    )

    expect(
      screen.getByRole('heading', { name: 'Attraction Booking Intelligence' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Connected')).toBeInTheDocument()
    expect(screen.getByText(/Attraction search/)).toBeInTheDocument()
  })
})
