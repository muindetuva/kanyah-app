import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { SymbolView } from 'expo-symbols'
import { Image } from 'expo-image'
import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { useAuth } from '@/features/auth/context/auth-context'
import { ChildAppShell } from '@/features/navigation/components/child-app-shell'
import { updateChildProfile as requestProfileUpdate } from '@/features/profiles/api/child-profiles'
import { ProfileAvatar } from '@/features/profiles/components/profile-avatar'
import { useProfileBadges } from '@/features/profiles/hooks/use-profile-badges'
import { getApiErrorMessage } from '@/lib/api/client'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

const pickerOptions: ImagePicker.ImagePickerOptions = {
  allowsEditing: true,
  aspect: [1, 1],
  mediaTypes: ['images'],
  quality: 0.8,
  shape: 'oval',
}

export default function ChildProfileScreen() {
  const [isSavingPhoto, setIsSavingPhoto] = useState(false)
  const [photoActionsVisible, setPhotoActionsVisible] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const { activeProfile, isRestoring, readerMode, updateChildProfile, user } = useAuth()
  const badgesQuery = useProfileBadges(activeProfile?.id)

  useEffect(() => {
    if (!isRestoring && !user) {
      router.replace('/login')
    } else if (!isRestoring && user && (readerMode !== 'child' || !activeProfile)) {
      router.replace(readerMode === 'parent' ? '/account' : '/who-is-reading')
    }
  }, [activeProfile, isRestoring, readerMode, user])

  const profileName = activeProfile?.display_name ?? 'Reader'

  async function savePhoto(photo: ImagePicker.ImagePickerAsset) {
    if (!activeProfile) {
      return
    }

    setPhotoActionsVisible(false)
    setPhotoError(null)
    setIsSavingPhoto(true)

    try {
      const updatedProfile = await requestProfileUpdate(activeProfile.id, {
        display_name: activeProfile.display_name,
        date_of_birth: activeProfile.date_of_birth ?? '',
        avatar_key: activeProfile.avatar_key,
        avatar: photo,
      })
      updateChildProfile(updatedProfile)
    } catch (error) {
      setPhotoError(getApiErrorMessage(error, 'We could not update your photo. Try again.'))
    } finally {
      setIsSavingPhoto(false)
    }
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
      await savePhoto(result.assets[0])
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
      await savePhoto(result.assets[0])
    }
  }

  return (
    <ChildAppShell activeTab="profile">
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text accessibilityRole="header" style={styles.pageTitle}>
          MY PROFILE
        </Text>

        <View style={styles.identity}>
          <Pressable
            accessibilityLabel="Change my profile photo"
            accessibilityRole="button"
            disabled={isSavingPhoto}
            onPress={() => {
              setPhotoActionsVisible((visible) => !visible)
              setPhotoError(null)
            }}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ProfileAvatar
              avatar={activeProfile?.avatar_key ?? 'explorer'}
              imageUrl={activeProfile?.avatar_url}
              selected
              size={112}
            />
            <View style={styles.photoEditBadge}>
              <SymbolView
                name={{
                  ios: isSavingPhoto ? 'arrow.triangle.2.circlepath' : 'camera.fill',
                  android: isSavingPhoto ? 'sync' : 'photo_camera',
                  web: isSavingPhoto ? 'sync' : 'photo_camera',
                }}
                size={18}
                tintColor={appColors.text.onPrimary}
              />
            </View>
          </Pressable>

          {photoActionsVisible ? (
            <View style={styles.photoActions}>
              <Pressable
                accessibilityRole="button"
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
            </View>
          ) : null}

          {isSavingPhoto ? <Text style={styles.photoStatus}>UPDATING PHOTO…</Text> : null}
          {photoError ? (
            <Text accessibilityRole="alert" style={styles.photoError}>
              {photoError}
            </Text>
          ) : null}
          <Text style={styles.journeyTitle}>{profileName.toUpperCase()}&apos;S JOURNEY</Text>
          <Text style={styles.journeyBody}>
            Your reading history, badges and achievements will grow here.
          </Text>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>MY BADGES</Text>
          <Text style={styles.badgeCount}>
            {(badgesQuery.data ?? []).filter((badge) => badge.earned).length} /{' '}
            {badgesQuery.data?.length ?? 0}
          </Text>
        </View>

        {badgesQuery.isError ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>BADGES COULDN&apos;T LOAD</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => badgesQuery.refetch()}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            >
              <Text style={styles.retryText}>TRY AGAIN</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            horizontal
            contentContainerStyle={styles.badgeList}
            showsHorizontalScrollIndicator={false}
          >
            {(badgesQuery.data ?? []).map((badge) => (
              <View
                accessibilityLabel={`${badge.name}. ${badge.earned ? 'Earned' : badge.description}`}
                key={badge.id}
                style={[styles.badgeCard, !badge.earned && styles.badgeCardLocked]}
              >
                <View style={styles.badgeArtworkFrame}>
                  {badge.artworkUrl ? (
                    <Image
                      accessibilityLabel=""
                      contentFit="cover"
                      source={{ uri: badge.artworkUrl }}
                      style={styles.badgeArtwork}
                    />
                  ) : (
                    <SymbolView
                      name={{ ios: 'medal.fill', android: 'military_tech', web: 'military_tech' }}
                      size={42}
                      tintColor={appPalette.colors.primary[500]}
                    />
                  )}
                  {!badge.earned && (
                    <View style={styles.lockOverlay}>
                      <SymbolView
                        name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
                        size={23}
                        tintColor={appColors.text.onPrimary}
                      />
                    </View>
                  )}
                </View>
                <Text numberOfLines={2} style={styles.badgeName}>
                  {badge.name.toUpperCase()}
                </Text>
                <Text numberOfLines={2} style={styles.badgeDescription}>
                  {badge.earned ? 'Earned!' : badge.description}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}

        <Pressable
          accessibilityHint="Requires the Parent PIN on shared and child devices"
          accessibilityRole="button"
          onPress={() => router.push('/parent-unlock')}
          style={({ pressed }) => [styles.parentButton, pressed && styles.pressed]}
        >
          <SymbolView
            name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
            size={20}
            tintColor={appColors.actions.secondary}
          />
          <View style={styles.parentCopy}>
            <Text style={styles.parentTitle}>PARENT AREA</Text>
            <Text style={styles.parentBody}>Profiles, settings and family controls</Text>
          </View>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={20}
            tintColor={appColors.actions.secondary}
          />
        </Pressable>
      </ScrollView>
    </ChildAppShell>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 126,
  },
  pageTitle: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 38,
    textAlign: 'center',
  },
  identity: {
    alignItems: 'center',
    marginTop: 30,
  },
  photoEditBadge: {
    position: 'absolute',
    right: -2,
    bottom: 2,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: appPalette.grays.white,
    borderRadius: 17,
    backgroundColor: appColors.actions.secondary,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  photoAction: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: appPalette.colors.secondary[100],
    borderRadius: 22,
    backgroundColor: appPalette.grays.white,
  },
  photoActionLabel: {
    color: appColors.actions.secondary,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  photoStatus: {
    marginTop: 10,
    color: appColors.actions.secondary,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  photoError: {
    maxWidth: 300,
    marginTop: 10,
    color: appPalette.colors.primary[500],
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  journeyTitle: {
    marginTop: 18,
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 38,
    textAlign: 'center',
  },
  journeyBody: {
    maxWidth: 310,
    marginTop: 7,
    color: appColors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 34,
  },
  sectionTitle: {
    color: appColors.text.primary,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  badgeCount: {
    color: appPalette.colors.purple[400],
    fontSize: 13,
    fontWeight: '800',
  },
  badgeList: {
    gap: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  badgeCard: {
    width: 128,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: appPalette.grays.white,
    boxShadow: '0 8px 18px rgba(90, 52, 28, 0.1)',
  },
  badgeCardLocked: {
    opacity: 0.72,
  },
  badgeArtworkFrame: {
    width: 78,
    height: 78,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 39,
    backgroundColor: appPalette.colors.neutral[100],
  },
  badgeArtwork: {
    width: '100%',
    height: '100%',
  },
  lockOverlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 19, 55, 0.54)',
  },
  badgeName: {
    minHeight: 34,
    marginTop: 10,
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
    textAlign: 'center',
  },
  badgeDescription: {
    minHeight: 30,
    marginTop: 4,
    color: appColors.text.secondary,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
  messageCard: {
    alignItems: 'center',
    marginTop: 12,
    padding: 18,
    borderRadius: 20,
    backgroundColor: appPalette.grays.white,
  },
  messageTitle: {
    color: appColors.text.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  retryButton: {
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: appColors.actions.primary,
  },
  retryText: {
    color: appColors.text.onPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  parentButton: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginTop: 18,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: appPalette.colors.secondary[100],
    borderRadius: 20,
    backgroundColor: appPalette.colors.secondary[10],
  },
  parentCopy: {
    flex: 1,
  },
  parentTitle: {
    color: appColors.actions.secondary,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
  },
  parentBody: {
    marginTop: 2,
    color: appColors.text.secondary,
    fontSize: 12,
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.72,
  },
})
