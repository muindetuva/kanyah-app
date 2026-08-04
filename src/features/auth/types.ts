export type ChildAvatarKey = 'explorer' | 'hare' | 'paw' | 'rocket'

export type ChildProfile = {
  id: number
  display_name: string
  age: number
  birth_year: number
  avatar_key: ChildAvatarKey
  avatar_url: string | null
  status: 'active' | 'inactive'
}

export type AuthUser = {
  id: number
  name: string
  phone: string
  role: 'parent'
  child_profiles: ChildProfile[]
}

export type AuthResponse = {
  token_type: 'Bearer'
  token: string
  user: AuthUser
}

export type RegisterInput = {
  name: string
  phone: string
  password: string
  password_confirmation: string
  terms: boolean
}

export type LoginInput = {
  phone: string
  password: string
}

export type CreateChildProfileInput = {
  display_name: string
  age: number
  avatar_key: ChildAvatarKey
}

export type ApiResource<T> = {
  data: T
}
