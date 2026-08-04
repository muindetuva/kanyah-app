import type { ImagePickerAsset } from 'expo-image-picker'
import { Platform } from 'react-native'

import type {
  ApiResource,
  ChildProfile,
  CreateChildProfileInput,
} from '@/features/auth/types'
import { apiDelete, apiPost } from '@/lib/api/client'

export type ChildProfileFormInput = CreateChildProfileInput & {
  avatar?: ImagePickerAsset | null
  remove_avatar?: boolean
}

async function appendAvatar(formData: FormData, avatar: ImagePickerAsset) {
  const mimeType = avatar.mimeType ?? 'image/jpeg'
  const extension =
    mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg'
  const fileName = avatar.fileName ?? `profile-${Date.now()}.${extension}`

  if (Platform.OS === 'web') {
    if (avatar.file) {
      formData.append('avatar', avatar.file, fileName)
    } else {
      const blob = await fetch(avatar.uri).then((response) => response.blob())
      formData.append('avatar', blob, fileName)
    }
    return
  }

  formData.append(
    'avatar',
    {
      uri: avatar.uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob,
  )
}

async function makeProfileFormData(input: ChildProfileFormInput): Promise<FormData> {
  const formData = new FormData()

  formData.append('display_name', input.display_name)
  formData.append('age', String(input.age))
  formData.append('avatar_key', input.avatar_key)

  if (input.avatar) {
    await appendAvatar(formData, input.avatar)
  }

  if (input.remove_avatar) {
    formData.append('remove_avatar', '1')
  }

  return formData
}

export async function createChildProfile(
  input: ChildProfileFormInput,
): Promise<ChildProfile> {
  const response = await apiPost<ApiResource<ChildProfile>>(
    '/api/v1/child-profiles',
    await makeProfileFormData(input),
    true,
  )

  return response.data
}

export async function updateChildProfile(
  profileId: number,
  input: ChildProfileFormInput,
): Promise<ChildProfile> {
  const formData = await makeProfileFormData(input)
  formData.append('_method', 'PATCH')

  const response = await apiPost<ApiResource<ChildProfile>>(
    `/api/v1/child-profiles/${profileId}`,
    formData,
    true,
  )

  return response.data
}

export async function deleteChildProfile(profileId: number): Promise<void> {
  await apiDelete<void>(`/api/v1/child-profiles/${profileId}`, true)
}
