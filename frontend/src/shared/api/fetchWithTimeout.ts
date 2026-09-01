const DEFAULT_REQUEST_TIMEOUT_MS = 12_000

export class ApiRequestTimeoutError extends Error {
  constructor() {
    super('The request took too long to complete.')
    this.name = 'ApiRequestTimeoutError'
  }
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
) {
  const controller = new AbortController()
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort()
      reject(new ApiRequestTimeoutError())
    }, timeoutMs)
  })

  try {
    return await Promise.race([
      fetch(input, { ...init, signal: controller.signal }),
      timeout,
    ])
  } catch (error) {
    if (controller.signal.aborted && !(error instanceof ApiRequestTimeoutError)) {
      throw new ApiRequestTimeoutError()
    }

    throw error
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}
