import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { PlanPage } from '../app/PlanPage'

function ResultsLocation() {
  const location = useLocation()
  return <div>Results location: {`${location.pathname}${location.search}`}</div>
}

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

describe('PlanPage', () => {
  it('keeps an exact thirty-one-day stay in a shareable results URL', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/plan']}>
        <Routes>
          <Route path="/plan" element={<PlanPage today="2026-08-19" />} />
          <Route path="/results" element={<ResultsLocation />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Arrival date'), '2026-09-01')
    await user.type(screen.getByLabelText('Departure date'), '2026-10-01')
    await user.click(
      screen.getByRole('button', { name: 'Find Rome attractions' }),
    )

    expect(screen.getByText(/Results location:/)).toHaveTextContent(
      '/results?city=rome&stayStartDate=2026-09-01&stayEndDate=2026-10-01',
    )
  })

  it('keeps a flexible travel window explicit in the results URL', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/plan']}>
        <Routes>
          <Route path="/plan" element={<PlanPage today="2026-08-19" />} />
          <Route path="/results" element={<ResultsLocation />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByLabelText(/Flexible window/))
    await user.selectOptions(screen.getByLabelText('Travel month'), '2026-09')
    await user.click(screen.getByLabelText('10 days'))
    await user.click(screen.getByLabelText('±2 days'))
    await user.click(
      screen.getByRole('button', { name: 'Find Rome attractions' }),
    )

    expect(screen.getByText(/Results location:/)).toHaveTextContent(
      '/results?city=rome&stayStartDate=2026-09-01&stayEndDate=2026-09-12&dateMode=flexible&travelMonth=2026-09&tripLengthDays=10&lengthFlexDays=2',
    )
  })

  it('offers to continue a trip previously saved in this browser', () => {
    window.localStorage.setItem(
      'abi.saved-trip.v1',
      JSON.stringify({
        version: 1,
        city: 'rome',
        dateMode: 'flexible',
        stayStartDate: '2026-09-01',
        stayEndDate: '2026-09-06',
        travelMonth: '2026-09',
        tripLengthDays: 5,
        lengthFlexDays: 1,
        attractionIds: ['pantheon', 'borghese-gallery'],
        savedAt: '2026-08-25T08:00:00.000Z',
      }),
    )

    render(
      <MemoryRouter>
        <PlanPage today="2026-08-19" />
      </MemoryRouter>,
    )

    expect(screen.getByText(/2 saved attractions/)).toBeInTheDocument()
    expect(
      screen.getByText(/Around 5 days in September 2026, ±1 day/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Continue saved trip' }),
    ).toHaveAttribute(
      'href',
      '/results?city=rome&stayStartDate=2026-09-01&stayEndDate=2026-09-06&dateMode=flexible&travelMonth=2026-09&tripLengthDays=5&lengthFlexDays=1',
    )
  })

  it('rejects a stay longer than thirty-one days', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <PlanPage today="2026-08-19" />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Arrival date'), '2026-09-01')
    await user.type(screen.getByLabelText('Departure date'), '2026-10-02')
    await user.click(
      screen.getByRole('button', { name: 'Find Rome attractions' }),
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Choose a Rome stay of 31 days or fewer.',
    )
  })
})
