export type ChildAvatarKey = 'explorer' | 'hare' | 'paw' | 'rocket'

export type ChildProfile = {
  id: number
  display_name: string
  age: number
  date_of_birth: string | null
  avatar_key: ChildAvatarKey
  avatar_url: string | null
  status: 'active' | 'inactive'
}

export type AuthUser = {
  id: number
  name: string
  phone: string
  role: 'parent'
  has_parent_pin: boolean
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
  pin: string
  pin_confirmation: string
  terms: boolean
}

export type LoginInput = {
  phone: string
  pin: string
}

export type UpdateParentAccountInput = {
  name: string
}

export type CreateChildProfileInput = {
  display_name: string
  date_of_birth: string
  avatar_key: ChildAvatarKey
}

export type ApiResource<T> = {
  data: T
}
