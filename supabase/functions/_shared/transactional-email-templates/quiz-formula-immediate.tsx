import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Note { name?: string; note?: string }
interface FormulaResult {
  rank?: number
  fragrance_name?: string
  name?: string
  match_percentage?: number
  matchScore?: number
  top_notes?: string[]
  heart_notes?: string[]
  base_notes?: string[]
  formula?: { top?: Note[]; heart?: Note[]; base?: Note[] }
}
interface Props {
  sessionId?: string
  bestMatchName?: string | null
  formulaResults?: FormulaResult[]
  siteUrl?: string
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }
const container = { maxWidth: 560, margin: '0 auto', padding: '28px 24px' }
const h1 = { fontSize: 24, lineHeight: '32px', margin: '8px 0 6px', color: '#0D0C0A' }
const muted = { fontSize: 13, color: '#6b6258', margin: '4px 0' }
const card = { padding: '14px 16px', border: '1px solid #ece5d8', borderRadius: 8, margin: '10px 0' }
const name = { fontSize: 16, fontWeight: 700, color: '#0D0C0A', margin: 0 }
const meta = { fontSize: 12, color: '#8B6914', margin: '2px 0 6px' }
const noteRow = { fontSize: 12, color: '#1a1a1a', margin: '2px 0' }
const ctaBtn = {
  display: 'inline-block', padding: '12px 22px', borderRadius: 8,
  background: '#C9A84C', color: '#0D0C0A', fontWeight: 700,
  textDecoration: 'none', marginTop: 12,
}

const noteNames = (arr?: Note[] | string[]): string[] => {
  if (!arr) return []
  if (typeof arr[0] === 'string') return arr as string[]
  return (arr as Note[]).map((n) => n?.name || n?.note || '').filter(Boolean)
}

const Email = ({
  sessionId = '',
  bestMatchName,
  formulaResults = [],
  siteUrl = 'https://www.bazukifragrance.com',
}: Props) => {
  const link = `${siteUrl}/shop/quiz/results?session=${encodeURIComponent(sessionId)}&utm_source=email&utm_medium=retargeting&utm_campaign=quiz_followup&utm_content=immediate`
  const top = formulaResults[0]
  const topName = top?.fragrance_name || top?.name || bestMatchName || 'Your Match'
  const topTop = noteNames(top?.top_notes || top?.formula?.top)
  return (
    <Html lang="en">
      <Head />
      <Preview>Your Bazuki formula is ready ✦</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Bazuki formula is ready ✦</Heading>
          <Text style={muted}>Saved for the next 30 days, just for you.</Text>
          {formulaResults.slice(0, 3).map((r, i) => {
            const n = r?.fragrance_name || r?.name || `Match ${i + 1}`
            const m = r?.match_percentage ?? r?.matchScore ?? ''
            return (
              <Section key={i} style={card}>
                <Text style={name}>{n}</Text>
                {m !== '' && <Text style={meta}>{m}% Match</Text>}
                {i === 0 && topTop.length > 0 && (
                  <Text style={noteRow}>Top notes: {topTop.join(', ')}</Text>
                )}
              </Section>
            )
          })}
          <Link href={link} style={ctaBtn}>Order Your Formula →</Link>
          <Hr style={{ borderColor: '#ece5d8', margin: '24px 0 12px' }} />
          <Text style={muted}>
            View your full results anytime: <Link href={link}>{link}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: 'Your Bazuki formula is ready ✦',
  displayName: 'Quiz Formula — Immediate',
  previewData: {
    sessionId: 'demo-session',
    bestMatchName: 'Signature Essence',
    formulaResults: [
      { rank: 1, fragrance_name: 'Signature Essence', match_percentage: 75, top_notes: ['Bergamot', 'Lemon'] },
      { rank: 2, fragrance_name: 'Timeless Harmony', match_percentage: 72 },
      { rank: 3, fragrance_name: 'Modern Classic', match_percentage: 70 },
    ],
  },
} satisfies TemplateEntry
