import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Link } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  sessionId?: string
  topNotes?: string[]
  bestMatchName?: string | null
  siteUrl?: string
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }
const container = { maxWidth: 560, margin: '0 auto', padding: '28px 24px' }
const h1 = { fontSize: 20, lineHeight: '28px', margin: '8px 0 6px', color: '#0D0C0A' }
const body = { fontSize: 14, color: '#1a1a1a', lineHeight: 1.6 }
const ctaBtn = {
  display: 'inline-block', padding: '12px 22px', borderRadius: 8,
  background: '#C9A84C', color: '#0D0C0A', fontWeight: 700, textDecoration: 'none', marginTop: 14,
}

const Email = ({ sessionId = '', topNotes = [], bestMatchName, siteUrl = 'https://www.bazukifragrance.com' }: Props) => {
  const link = `${siteUrl}/shop/quiz/results?session=${encodeURIComponent(sessionId)}&utm_source=email&utm_medium=retargeting&utm_campaign=quiz_followup&utm_content=day3`
  const joined = topNotes.slice(0, 3).join(', ')
  return (
    <Html lang="en">
      <Head />
      <Preview>{joined || 'Your notes'} — your formula, unclaimed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{joined || 'Your formula'} — built for you</Heading>
          <Text style={body}>
            Your formula{bestMatchName ? `, ${bestMatchName},` : ''} was crafted from these signature notes:
            {joined ? <> <strong>{joined}</strong>.</> : '.'}
          </Text>
          <Text style={body}>This blend was built for you and only you.</Text>
          <Link href={link} style={ctaBtn}>Try the Discovery Set →</Link>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, unknown>) => {
    const notes = (data?.topNotes as string[] | undefined)?.slice(0, 3).join(', ')
    return notes ? `${notes} — your formula, unclaimed` : 'Your formula is still unclaimed'
  },
  displayName: 'Quiz Followup — Day 3',
  previewData: { sessionId: 'demo', topNotes: ['Bergamot', 'Jasmine', 'Sandalwood'], bestMatchName: 'Signature Essence' },
} satisfies TemplateEntry
