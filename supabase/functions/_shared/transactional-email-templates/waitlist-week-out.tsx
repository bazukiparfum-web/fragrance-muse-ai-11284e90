import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { firstName?: string | null; spotsRemaining?: number }

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }
const container = { maxWidth: 560, margin: '0 auto', padding: '32px 24px' }
const eyebrow = { fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: '#8E7845', margin: '0 0 12px' }
const h1 = { fontFamily: 'Georgia, serif', fontSize: 26, lineHeight: '34px', color: '#0A0908', margin: '0 0 16px' }
const p = { fontSize: 15, lineHeight: '24px', color: '#333', margin: '0 0 14px' }

const Email = ({ firstName, spotsRemaining }: Props) => (
  <Html lang="en">
    <Head />
    <Preview>One week until Bazuki opens</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>Aug 22 · One week out</Text>
        <Heading style={h1}>{firstName ? `${firstName}, seven days to go.` : 'Seven days to go.'}</Heading>
        <Text style={p}>On Aug 29, the doors open. Your 50% is locked to your email — no code needed on your first order.</Text>
        {typeof spotsRemaining === 'number' ? <Text style={p}><strong>{spotsRemaining.toLocaleString()}</strong> early blends remaining.</Text> : null}
        <Text style={p}>If you know exactly which of your friends would appreciate an AI-crafted scent, now is the moment to send them your code.</Text>
        <Section style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee' }}>
          <Text style={{ ...p, fontSize: 12, color: '#8E7845' }}>Bazuki — India's first AI-algorithmic fragrance house.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'One week until Bazuki opens',
  displayName: 'Waitlist Aug 22 — One week out',
  previewData: { firstName: 'Aarav', spotsRemaining: 3128 },
} satisfies TemplateEntry
