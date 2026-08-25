import { LegalScreen, type LegalSection } from '@/features/legal/components/legal-screen'

const sections: LegalSection[] = [
  {
    title: '1. Information we collect',
    body: 'We collect parent account details such as name and phone number. Child profiles may include a display name, age, avatar or profile photo, preferences, reading progress and activity.',
  },
  {
    title: '2. How we use information',
    body: 'We use this information to provide accounts and profiles, recommend suitable stories, save reading progress, show parents activity and improve Kanyah.',
  },
  {
    title: '3. Sharing information',
    body: 'We do not sell personal information. We share only what is necessary with service providers that help us operate Kanyah, or when required by law.',
  },
  {
    title: '4. Children’s privacy',
    body: 'A parent or guardian controls each child profile. We aim to collect only the information needed to provide the reading experience and parent controls.',
  },
  {
    title: '5. Storage and security',
    body: 'We use reasonable measures to protect personal information and keep it only while it is needed to provide Kanyah, meet legal obligations or resolve issues.',
  },
  {
    title: '6. Parent choices',
    body: 'Parents can review and update child profiles in the app. They can also request account or profile deletion and stop future use of a child’s information.',
  },
]

export default function PrivacyScreen() {
  return (
    <LegalScreen
      intro="This policy explains the information Kanyah uses and the choices available to parents and guardians."
      sections={sections}
      title="PRIVACY POLICY"
    />
  )
}
