import type {
  ApiResource,
  AuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
  UpdateParentAccountInput,
  UpdateParentPasswordInput,
} from '@/features/auth/types'
import { apiGet, apiPatch, apiPost, apiPut } from '@/lib/api/client'

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

export async function updateParentAccount(input: UpdateParentAccountInput): Promise<AuthUser> {
  const response = await apiPatch<ApiResource<AuthUser>>('/api/v1/auth/account', input, true)
  return response.data
}

export async function updateParentPassword(input: UpdateParentPasswordInput): Promise<void> {
  await apiPut<{ message: string }>('/api/v1/auth/password', input, true)
}

export async function storeParentPin(pin: string, pinConfirmation: string): Promise<void> {
  await apiPut<{ has_parent_pin: true; message: string }>(
    '/api/v1/auth/parent-pin',
    { pin, pin_confirmation: pinConfirmation },
    true,
  )
}

export async function verifyParentPin(pin: string): Promise<void> {
  await apiPost<{ verified: true }>('/api/v1/auth/parent-pin/verify', { pin }, true)
}

export async function verifyParentPassword(password: string): Promise<void> {
  await apiPost<{ verified: true }>(
    '/api/v1/auth/parent-password/verify',
    { password },
    true,
  )
}
