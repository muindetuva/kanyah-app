import { apiPost } from '@/lib/api/client'

type JoinWaitlistInput = {
  email: string
  source: 'homepage'
}

type JoinWaitlistResponse = {
  message: string
}

export function joinWaitlist(input: JoinWaitlistInput) {
  return apiPost<JoinWaitlistResponse>('/api/v1/waitlist', input)
}
