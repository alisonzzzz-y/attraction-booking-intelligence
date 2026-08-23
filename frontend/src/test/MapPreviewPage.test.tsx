import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MapPreviewPage } from '../app/MapPreviewPage'

describe('MapPreviewPage', () => {
  it('keeps an explicit fallback when the browser key is unavailable', () => {
    render(<MapPreviewPage apiKey="" />)

    expect(
      screen.getByRole('heading', {
        name: 'A first map, centred on the Colosseum.',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Browser key not found.')).toBeInTheDocument()
    expect(screen.getByText(/not a live attraction result/)).toBeInTheDocument()
  })
})
