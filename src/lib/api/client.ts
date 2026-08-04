import { getAuthToken } from '@/features/auth/storage/auth-token'

export const API_ORIGIN =
  process.env.EXPO_PUBLIC_API_ORIGIN ?? 'http://localhost:8000'

export type ApiValidationErrors = Record<string, string[]>

export class ApiError extends Error {
  errors: ApiValidationErrors
  status: number

  constructor(message: string, status: number, errors: ApiValidationErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

function buildApiUrl(path: string) {
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

type ApiRequestOptions = {
  authenticated?: boolean
  body?: unknown
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData

  if (options.body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (options.authenticated) {
    const token = await getAuthToken()

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const body: BodyInit | undefined =
    options.body === undefined
      ? undefined
      : isFormData
        ? (options.body as FormData)
        : JSON.stringify(options.body)

  const response = await fetch(buildApiUrl(path), {
    method: options.method ?? 'GET',
    headers,
    body,
  })

  const payload = (response.status === 204 ? {} : await response.json()) as T & {
    errors?: ApiValidationErrors
    message?: string
  }

  if (!response.ok) {
    throw new ApiError(
      payload.message ?? `Request failed with status ${response.status}`,
      response.status,
      payload.errors,
    )
  }

  return payload
}

export function apiGet<T>(path: string, authenticated = false): Promise<T> {
  return apiRequest<T>(path, { authenticated })
}

export function apiPost<T>(path: string, body?: unknown, authenticated = false): Promise<T> {
  return apiRequest<T>(path, {
    method: 'POST',
    body,
    authenticated,
  })
}

export function apiDelete<T>(path: string, authenticated = false): Promise<T> {
  return apiRequest<T>(path, {
    method: 'DELETE',
    authenticated,
  })
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const firstValidationMessage = Object.values(error.errors)[0]?.[0]
    return firstValidationMessage ?? error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export function getApiFieldError(error: unknown, field: string): string | undefined {
  return error instanceof ApiError ? error.errors[field]?.[0] : undefined
}
