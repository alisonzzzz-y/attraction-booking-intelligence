import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ApiRequestTimeoutError,
  fetchWithTimeout,
} from '../shared/api/fetchWithTimeout'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('fetchWithTimeout', () => {
  it('rejects instead of leaving the page loading when a request never settles', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => undefined)))

    const request = fetchWithTimeout('/slow-request', {}, 50)
    const timeoutExpectation = expect(request).rejects.toBeInstanceOf(
      ApiRequestTimeoutError,
    )
    await vi.advanceTimersByTimeAsync(50)

    await timeoutExpectation
  })
})
