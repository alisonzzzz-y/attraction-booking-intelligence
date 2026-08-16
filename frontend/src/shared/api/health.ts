import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

const healthSchema = z.object({
  status: z.string(),
})

export type Health = z.infer<typeof healthSchema>

export async function getHealth(): Promise<Health> {
  const response = await fetch('/actuator/health')

  if (!response.ok) {
    throw new Error(`Health request failed with status ${response.status}`)
  }

  return healthSchema.parse(await response.json())
}

export function useHealth() {
  return useQuery({
    queryKey: ['backend-health'],
    queryFn: getHealth,
  })
}
