const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

const apiBaseUrl = configuredApiBaseUrl
  ? configuredApiBaseUrl.replace(/\/$/, '')
  : ''

export function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`
}
