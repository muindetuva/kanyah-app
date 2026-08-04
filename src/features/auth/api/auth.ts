import type {
  ApiResource,
  AuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
} from '@/features/auth/types'
import { apiGet, apiPost } from '@/lib/api/client'

export function register(input: RegisterInput): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/api/v1/auth/register', input)
}

export function login(input: LoginInput): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/api/v1/auth/login', input)
}

export async function logout(): Promise<void> {
  await apiPost<{ message: string }>('/api/v1/auth/logout', undefined, true)
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiGet<ApiResource<AuthUser>>('/api/v1/auth/me', true)
  return response.data
}
