import { describe, expect, it } from 'vitest'
import { createAppQueryClient } from '../app/providers'

describe('app query defaults', () => {
  it('does not refetch stale planning data when the browser regains focus', () => {
    const queryClient = createAppQueryClient()

    expect(queryClient.getDefaultOptions().queries).toMatchObject({
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    })
  })
})
