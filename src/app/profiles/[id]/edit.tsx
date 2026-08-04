import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'

import { useAuth } from '@/features/auth/context/auth-context'
import {
  deleteChildProfile,
  type ChildProfileFormInput,
  updateChildProfile as requestProfileUpdate,
} from '@/features/profiles/api/child-profiles'
import { ProfileForm } from '@/features/profiles/components/profile-form'

function goBack() {
  if (router.canGoBack()) {
    router.back()
    return
  }

  router.replace('/parent-home')
}

export default function EditProfileScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>()
  const profileId = Number(Array.isArray(params.id) ? params.id[0] : params.id)
  const [error, setError] = useState<unknown>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    isRestoring,
    readerMode,
    removeChildProfile,
    updateChildProfile,
    user,
  } = useAuth()
  const profile = user?.child_profiles.find((childProfile) => childProfile.id === profileId)

  useEffect(() => {
    if (!isRestoring && !user) {
      router.replace('/login')
      return
    }

    if (!isRestoring && user && readerMode !== 'parent') {
      router.replace('/who-is-reading')
      return
    }

    if (!isRestoring && user && !profile) {
      router.replace('/parent-home')
    }
  }, [isRestoring, profile, readerMode, user])

  async function handleSubmit(input: ChildProfileFormInput) {
    if (!profile || !input.display_name) {
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const updatedProfile = await requestProfileUpdate(profile.id, input)
      updateChildProfile(updatedProfile)
      router.dismissTo('/parent-home')
    } catch (submissionError) {
      setError(submissionError)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!profile) {
      return
    }

    setError(null)
    setIsDeleting(true)

    try {
      await deleteChildProfile(profile.id)
      removeChildProfile(profile.id)
      router.dismissTo('/parent-home')
    } catch (deletionError) {
      setError(deletionError)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!profile) {
    return null
  }

  return (
    <ProfileForm
      error={error}
      initialProfile={profile}
      isDeleting={isDeleting}
      isSubmitting={isSubmitting}
      mode="edit"
      onBack={goBack}
      onDelete={() => void handleDelete()}
      onSubmit={(input) => void handleSubmit(input)}
    />
  )
}
