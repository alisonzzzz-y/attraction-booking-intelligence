import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { PlanPage } from '../app/PlanPage'

describe('PlanPage', () => {
  it('keeps valid dates in a shareable results URL', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/plan']}>
        <Routes>
          <Route path="/plan" element={<PlanPage today="2026-08-19" />} />
          <Route path="/results" element={<div>Results route reached</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Arrival date'), '2026-09-10')
    await user.type(screen.getByLabelText('Departure date'), '2026-09-12')
    await user.click(
      screen.getByRole('button', { name: 'Find Rome attractions' }),
    )

    expect(screen.getByText('Results route reached')).toBeInTheDocument()
  })

  it('rejects a stay longer than fourteen days', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <PlanPage today="2026-08-19" />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Arrival date'), '2026-09-01')
    await user.type(screen.getByLabelText('Departure date'), '2026-09-15')
    await user.click(
      screen.getByRole('button', { name: 'Find Rome attractions' }),
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Choose a Rome stay of 14 days or fewer.',
    )
  })
})
