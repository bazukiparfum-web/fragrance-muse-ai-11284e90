import { template as orderConfirmation } from './order-confirmation.tsx'
import { template as quizFormulaImmediate } from './quiz-formula-immediate.tsx'
import { template as quizFollowupDay1 } from './quiz-followup-day1.tsx'
import { template as quizFollowupDay3 } from './quiz-followup-day3.tsx'
import { template as quizFollowupDay7 } from './quiz-followup-day7.tsx'
import { template as quizFollowupDay25 } from './quiz-followup-day25.tsx'
import { template as adminUserInvite } from './admin-user-invite.tsx'

export interface TemplateEntry {
  // deno-lint-ignore no-explicit-any
  component: (props: any) => any
  subject: string | ((data: Record<string, unknown>) => string)
  displayName?: string
  previewData?: Record<string, unknown>
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'order-confirmation': orderConfirmation,
  'quiz-formula-immediate': quizFormulaImmediate,
  'quiz-followup-day1': quizFollowupDay1,
  'quiz-followup-day3': quizFollowupDay3,
  'quiz-followup-day7': quizFollowupDay7,
  'quiz-followup-day25': quizFollowupDay25,
  'admin-user-invite': adminUserInvite,
}
