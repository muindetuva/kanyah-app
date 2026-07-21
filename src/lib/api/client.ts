export const API_ORIGIN =
  process.env.EXPO_PUBLIC_API_ORIGIN ?? 'http://localhost:8000'

function buildApiUrl(path: string) {
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path))

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const payload = (await response.json()) as T & { message?: string }

  if (!response.ok) {
    throw new Error(payload.message ?? `Request failed with status ${response.status}`)
  }

  return payload
}
