import { router } from 'expo-router'
import { useEffect, useState } from 'react'

import { useAuth } from '@/features/auth/context/auth-context'
import {
  createChildProfile,
  type ChildProfileFormInput,
} from '@/features/profiles/api/child-profiles'
import { ProfileForm } from '@/features/profiles/components/profile-form'

function goBack() {
  if (router.canGoBack()) {
    router.back()
    return
  }

  router.replace('/who-is-reading')
}

export default function CreateProfileScreen() {
  const [error, setError] = useState<unknown>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addChildProfile, isRestoring, readerMode, user } = useAuth()
  const isParentFlow = readerMode === 'parent'

  useEffect(() => {
    if (!isRestoring && !user) {
      router.replace('/login')
    }
  }, [isRestoring, user])

  async function handleSubmit(input: ChildProfileFormInput) {
    if (!input.display_name) {
      setError(new Error('Enter the child’s name.'))
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const profile = await createChildProfile(input)
      addChildProfile(profile, { select: !isParentFlow })
      router.dismissTo(isParentFlow ? '/parent-home' : '/home')
    } catch (submissionError) {
      setError(submissionError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProfileForm
      error={error}
      isSubmitting={isSubmitting || isRestoring || !user}
      mode="create"
      onBack={user?.child_profiles.length ? goBack : undefined}
      onSubmit={(input) => void handleSubmit(input)}
    />
  )
}
