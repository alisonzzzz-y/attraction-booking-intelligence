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

  it('normalises the browser AbortError raised by a timed-out fetch', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn((_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(
              new DOMException('signal is aborted without reason', 'AbortError'),
            )
          })
        }),
      ),
    )

    const request = fetchWithTimeout('/aborted-request', {}, 50)
    const timeoutExpectation = expect(request).rejects.toBeInstanceOf(
      ApiRequestTimeoutError,
    )
    await vi.advanceTimersByTimeAsync(50)

    await timeoutExpectation
  })
})
