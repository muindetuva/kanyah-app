import { LegalScreen, type LegalSection } from '@/features/legal/components/legal-screen'

const sections: LegalSection[] = [
  {
    title: '1. Parent accounts',
    body: 'You confirm that you are a parent or legal guardian and that the information you provide is accurate. Keep your phone and Parent PIN private.',
  },
  {
    title: '2. Child profiles',
    body: 'Create profiles only for children in your care or under your supervision. You are responsible for managing their profiles and use of Kanyah.',
  },
  {
    title: '3. Stories and narration',
    body: 'Kanyah provides stories for personal, non-commercial reading and listening. Stories, illustrations, narration and availability may change as the library develops.',
  },
  {
    title: '4. Acceptable use',
    body: 'Do not misuse Kanyah, interfere with the service, attempt unauthorised access, or copy and distribute its content without permission.',
  },
  {
    title: '5. Accounts and availability',
    body: 'We may restrict accounts that misuse the service. Kanyah may occasionally be unavailable while we maintain or improve it.',
  },
  {
    title: '6. Changes',
    body: 'We may update these terms as Kanyah develops. We will provide notice when a change materially affects how the service is used.',
  },
]

export default function TermsScreen() {
  return (
    <LegalScreen
      intro="These terms apply when you create an account or use Kanyah."
      sections={sections}
      title="TERMS OF SERVICE"
    />
  )
}
