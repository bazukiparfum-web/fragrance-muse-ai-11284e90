import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Hr, Html, Preview, Text, Link } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  sessionId?: string
  bestMatchName?: string | null
  dreamWord?: string | null
  siteUrl?: string
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }
const container = { maxWidth: 560, margin: '0 auto', padding: '28px 24px' }
const h1 = { fontSize: 22, lineHeight: '30px', margin: '8px 0 6px', color: '#0D0C0A' }
const body = { fontSize: 14, color: '#1a1a1a', lineHeight: 1.6 }
const muted = { fontSize: 12, color: '#6b6258' }
const ctaBtn = {
  display: 'inline-block', padding: '12px 22px', borderRadius: 8,
  background: '#C9A84C', color: '#0D0C0A', fontWeight: 700, textDecoration: 'none', marginTop: 14,
}

const Email = ({ sessionId = '', bestMatchName = 'your best match', dreamWord, siteUrl = 'https://www.bazukifragrance.com' }: Props) => {
  const link = `${siteUrl}/shop/quiz/results?session=${encodeURIComponent(sessionId)}&utm_source=email&utm_medium=retargeting&utm_campaign=quiz_followup&utm_content=day1`
  return (
    <Html lang="en">
      <Head />
      <Preview>Your scent profile{dreamWord ? `: ${dreamWord}` : ''}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your scent profile{dreamWord ? `: ${dreamWord}` : ''}</Heading>
          <Text style={body}>
            Your best match — <strong>{bestMatchName}</strong> — was built from the personality traits you shared.
            People with similar profiles consistently choose this match first.
          </Text>
          <Text style={muted}>Your formula is saved for 29 more days.</Text>
          <Link href={link} style={ctaBtn}>See My Formula →</Link>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, unknown>) =>
    `Your scent profile${data?.dreamWord ? `: ${data.dreamWord}` : ''}`,
  displayName: 'Quiz Followup — Day 1',
  previewData: { sessionId: 'demo', bestMatchName: 'Signature Essence', dreamWord: 'Velvet' },
} satisfies TemplateEntry
