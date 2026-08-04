import * as ImagePicker from 'expo-image-picker'
import { SymbolView } from 'expo-symbols'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import {
  AuthBackButton,
  AuthField,
  AuthPrimaryButton,
  AuthShell,
} from '@/features/auth/components/auth-ui'
import type { ChildAvatarKey, ChildProfile } from '@/features/auth/types'
import type { ChildProfileFormInput } from '@/features/profiles/api/child-profiles'
import { ProfileAvatar } from '@/features/profiles/components/profile-avatar'
import { getApiErrorMessage, getApiFieldError } from '@/lib/api/client'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

const avatarOptions: ChildAvatarKey[] = ['paw', 'explorer', 'rocket', 'hare']

type ProfileFormProps = {
  error: unknown
  initialProfile?: ChildProfile
  isDeleting?: boolean
  isSubmitting: boolean
  mode: 'create' | 'edit'
  onBack?: () => void
  onDelete?: () => void
  onSubmit: (input: ChildProfileFormInput) => void
}

const pickerOptions: ImagePicker.ImagePickerOptions = {
  allowsEditing: true,
  aspect: [1, 1],
  mediaTypes: ['images'],
  quality: 0.8,
  shape: 'oval',
}

export function ProfileForm({
  error,
  initialProfile,
  isDeleting = false,
  isSubmitting,
  mode,
  onBack,
  onDelete,
  onSubmit,
}: ProfileFormProps) {
  const [age, setAge] = useState(initialProfile?.age ?? 6)
  const [avatar, setAvatar] = useState<ChildAvatarKey>(
    initialProfile?.avatar_key ?? 'explorer',
  )
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [name, setName] = useState(initialProfile?.display_name ?? '')
  const [photoActionsVisible, setPhotoActionsVisible] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [pickedPhoto, setPickedPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false)

  const existingPhotoUrl = removeExistingPhoto ? null : initialProfile?.avatar_url
  const previewUrl = pickedPhoto?.uri ?? existingPhotoUrl
  const busy = isSubmitting || isDeleting

  function chooseBuiltInAvatar(option: ChildAvatarKey) {
    setAvatar(option)
    setPickedPhoto(null)
    setRemoveExistingPhoto(Boolean(initialProfile?.avatar_url))
    setPhotoActionsVisible(false)
    setPhotoError(null)
  }

  function applyPickedPhoto(photo: ImagePicker.ImagePickerAsset) {
    setPickedPhoto(photo)
    setRemoveExistingPhoto(false)
    setPhotoActionsVisible(false)
    setPhotoError(null)
  }

  async function takePhoto() {
    setPhotoError(null)
    const permission = await ImagePicker.requestCameraPermissionsAsync()

    if (!permission.granted) {
      setPhotoError('Camera access is needed to take a profile photo.')
      return
    }

    const result = await ImagePicker.launchCameraAsync(pickerOptions)

    if (!result.canceled) {
      applyPickedPhoto(result.assets[0])
    }
  }

  async function choosePhoto() {
    setPhotoError(null)
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permission.granted) {
      setPhotoError('Photo access is needed to choose a profile photo.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync(pickerOptions)

    if (!result.canceled) {
      applyPickedPhoto(result.assets[0])
    }
  }

  function removePhoto() {
    setPickedPhoto(null)
    setRemoveExistingPhoto(Boolean(initialProfile?.avatar_url))
    setPhotoActionsVisible(false)
    setPhotoError(null)
  }

  function submit() {
    onSubmit({
      display_name: name.trim(),
      age,
      avatar_key: avatar,
      avatar: pickedPhoto,
      remove_avatar: removeExistingPhoto,
    })
  }

  return (
    <AuthShell contentStyle={styles.scrollContent}>
      {onBack ? <AuthBackButton onPress={onBack} /> : null}

      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          {mode === 'create' ? 'CREATE PROFILE' : 'EDIT PROFILE'}
        </Text>
        {mode === 'create' ? (
          <Text style={styles.subtitle}>A few details help us find stories they&apos;ll love.</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <View style={styles.photoSection}>
          <Pressable
            accessibilityLabel={previewUrl ? 'Change profile photo' : 'Add profile photo'}
            accessibilityRole="button"
            disabled={busy}
            onPress={() => setPhotoActionsVisible((visible) => !visible)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ProfileAvatar avatar={avatar} imageUrl={previewUrl} selected size={100} />
            <View style={styles.photoEditBadge}>
              <SymbolView
                name={{
                  ios: previewUrl ? 'pencil' : 'plus',
                  android: previewUrl ? 'edit' : 'add',
                  web: previewUrl ? 'edit' : 'add',
                }}
                size={17}
                tintColor={appColors.text.onPrimary}
              />
            </View>
          </Pressable>

          {photoActionsVisible ? (
            <View style={styles.photoActions}>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => void takePhoto()}
                style={({ pressed }) => [styles.photoAction, pressed && styles.pressed]}
              >
                <SymbolView
                  name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
                  size={18}
                  tintColor={appColors.actions.secondary}
                />
                <Text style={styles.photoActionLabel}>CAMERA</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => void choosePhoto()}
                style={({ pressed }) => [styles.photoAction, pressed && styles.pressed]}
              >
                <SymbolView
                  name={{ ios: 'photo.fill', android: 'photo_library', web: 'photo_library' }}
                  size={18}
                  tintColor={appColors.actions.secondary}
                />
                <Text style={styles.photoActionLabel}>PHOTOS</Text>
              </Pressable>
              {previewUrl ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={removePhoto}
                  style={({ pressed }) => [styles.photoAction, pressed && styles.pressed]}
                >
                  <SymbolView
                    name={{ ios: 'trash', android: 'delete_outline', web: 'delete_outline' }}
                    size={18}
                    tintColor={appPalette.colors.primary[500]}
                  />
                  <Text style={styles.removePhotoLabel}>REMOVE</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {photoError ? (
            <Text accessibilityRole="alert" style={styles.photoError}>
              {photoError}
            </Text>
          ) : null}
        </View>

        <AuthField
          autoComplete="name"
          editable={!busy}
          error={getApiFieldError(error, 'display_name')}
          icon="person"
          label="CHILD'S NAME"
          onChangeText={setName}
          placeholder="Enter their name"
          returnKeyType="done"
          value={name}
        />

        <View style={styles.ageGroup}>
          <Text style={styles.fieldLabel}>AGE</Text>
          <View style={styles.ageStepper}>
            <Pressable
              accessibilityLabel="Decrease age"
              accessibilityRole="button"
              disabled={busy || age <= 1}
              hitSlop={6}
              onPress={() => setAge((currentAge) => Math.max(1, currentAge - 1))}
              style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
            >
              <Text style={styles.stepperSymbol}>−</Text>
            </Pressable>
            <Text accessibilityLabel={`${age} years old`} style={styles.ageValue}>
              {age}
            </Text>
            <Pressable
              accessibilityLabel="Increase age"
              accessibilityRole="button"
              disabled={busy || age >= 17}
              hitSlop={6}
              onPress={() => setAge((currentAge) => Math.min(17, currentAge + 1))}
              style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
            >
              <Text style={styles.stepperSymbol}>+</Text>
            </Pressable>
          </View>
          {getApiFieldError(error, 'age') ? (
            <Text style={styles.fieldError}>{getApiFieldError(error, 'age')}</Text>
          ) : null}
        </View>

        <View style={styles.avatarGroup}>
          <Text style={styles.fieldLabel}>CHOOSE AN AVATAR</Text>
          <View style={styles.avatarOptions}>
            {avatarOptions.map((option) => {
              const selected = option === avatar && !previewUrl

              return (
                <Pressable
                  accessibilityLabel={`Choose ${option} avatar`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  disabled={busy}
                  key={option}
                  onPress={() => chooseBuiltInAvatar(option)}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <ProfileAvatar avatar={option} selected={selected} size={54} />
                </Pressable>
              )
            })}
          </View>
        </View>
      </View>

      {error ? (
        <Text accessibilityRole="alert" style={styles.submissionError}>
          {getApiErrorMessage(
            error,
            mode === 'create'
              ? 'We could not create this profile. Please try again.'
              : 'We could not save this profile. Please try again.',
          )}
        </Text>
      ) : null}

      <View style={styles.action}>
        <AuthPrimaryButton
          disabled={busy || !name.trim()}
          label={
            isSubmitting
              ? mode === 'create'
                ? 'CREATING PROFILE…'
                : 'SAVING CHANGES…'
              : mode === 'create'
                ? 'CREATE PROFILE'
                : 'SAVE CHANGES'
          }
          onPress={submit}
        />
      </View>

      {mode === 'edit' && onDelete ? (
        confirmingDelete ? (
          <View style={styles.deleteConfirmation}>
            <Text style={styles.deleteQuestion}>Remove {name || 'this profile'}?</Text>
            <Text style={styles.deleteExplanation}>Their saved profile details will be deleted.</Text>
            <View style={styles.deleteActions}>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => setConfirmingDelete(false)}
                style={({ pressed }) => [styles.cancelDeleteButton, pressed && styles.pressed]}
              >
                <Text style={styles.cancelDeleteLabel}>CANCEL</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={onDelete}
                style={({ pressed }) => [styles.confirmDeleteButton, pressed && styles.pressed]}
              >
                <Text style={styles.confirmDeleteLabel}>
                  {isDeleting ? 'REMOVING…' : 'REMOVE'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => setConfirmingDelete(true)}
            style={({ pressed }) => [styles.removeProfileButton, pressed && styles.pressed]}
          >
            <SymbolView
              name={{ ios: 'trash', android: 'delete_outline', web: 'delete_outline' }}
              size={18}
              tintColor={appPalette.colors.primary[500]}
            />
            <Text style={styles.removeProfileLabel}>REMOVE PROFILE</Text>
          </Pressable>
        )
      ) : null}
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 28,
    paddingHorizontal: 16,
  },
  title: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0.3,
    lineHeight: 43,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 290,
    marginTop: 8,
    color: appPalette.colors.brown[500],
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    gap: 22,
    marginTop: 28,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 26,
    borderRadius: 28,
    backgroundColor: appPalette.grays.white,
    boxShadow: '0 14px 28px rgba(90, 52, 28, 0.13)',
  },
  photoSection: {
    alignItems: 'center',
    gap: 12,
  },
  photoEditBadge: {
    position: 'absolute',
    right: -2,
    bottom: 2,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: appPalette.grays.white,
    borderRadius: 16,
    backgroundColor: appColors.actions.secondary,
  },
  photoActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  photoAction: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: appPalette.colors.secondary[100],
    borderRadius: 20,
    backgroundColor: appPalette.colors.secondary[10],
  },
  photoActionLabel: {
    color: appColors.actions.secondary,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  removePhotoLabel: {
    color: appPalette.colors.primary[500],
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  photoError: {
    color: appPalette.colors.primary[500],
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  fieldLabel: {
    color: appPalette.colors.neutral[1000],
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  fieldError: {
    color: appPalette.colors.primary[500],
    fontSize: 12,
    lineHeight: 16,
  },
  ageGroup: {
    gap: 8,
  },
  ageStepper: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: appPalette.colors.secondary[100],
    borderRadius: 12,
    backgroundColor: appColors.backgrounds.secondary,
  },
  stepperButton: {
    width: 54,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSymbol: {
    color: appPalette.colors.brown[500],
    fontSize: 22,
    lineHeight: 26,
  },
  ageValue: {
    color: appPalette.colors.neutral[1000],
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  avatarGroup: {
    gap: 12,
  },
  avatarOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  action: {
    marginTop: 26,
  },
  submissionError: {
    marginTop: 18,
    paddingHorizontal: 12,
    color: appPalette.colors.primary[500],
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  removeProfileButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 12,
  },
  removeProfileLabel: {
    color: appPalette.colors.primary[500],
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  deleteConfirmation: {
    gap: 8,
    marginTop: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: appPalette.colors.primary[100],
    borderRadius: 18,
    backgroundColor: appPalette.colors.primary[10],
  },
  deleteQuestion: {
    color: appColors.text.primary,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
    textAlign: 'center',
  },
  deleteExplanation: {
    color: appPalette.colors.brown[500],
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  cancelDeleteButton: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: appPalette.colors.secondary[100],
    borderRadius: 22,
  },
  confirmDeleteButton: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: appPalette.colors.primary[500],
  },
  cancelDeleteLabel: {
    color: appColors.actions.secondary,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  confirmDeleteLabel: {
    color: appColors.text.onPrimary,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.72,
  },
})
