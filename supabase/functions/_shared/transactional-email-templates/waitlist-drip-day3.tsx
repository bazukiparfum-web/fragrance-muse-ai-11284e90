import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { firstName?: string | null }

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }
const container = { maxWidth: 560, margin: '0 auto', padding: '32px 24px' }
const eyebrow = { fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: '#8E7845', margin: '0 0 12px' }
const h1 = { fontFamily: 'Georgia, serif', fontSize: 26, lineHeight: '34px', color: '#0A0908', margin: '0 0 16px' }
const p = { fontSize: 15, lineHeight: '24px', color: '#333', margin: '0 0 14px' }

const Email = ({ firstName }: Props) => (
  <Html lang="en">
    <Head />
    <Preview>How Bazuki actually builds your formula</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>Day 3 · The mechanism</Text>
        <Heading style={h1}>{firstName ? `${firstName}, here's how it works.` : `Here's how it works.`}</Heading>
        <Text style={p}>Most perfumes start with a brief and end months later. Bazuki starts with a quiz and ends with a machine.</Text>
        <Text style={p}>You answer 12 questions. Our algorithm pairs your answers to raw ingredients — 50+ available at launch. A robotic dispenser blends the exact grams into a single bottle. No two are the same.</Text>
        <Text style={p}>When early access opens, your 50% is waiting.</Text>
        <Section style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee' }}>
          <Text style={{ ...p, fontSize: 12, color: '#8E7845' }}>Bazuki — India's first AI-algorithmic fragrance house.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'How your formula is actually built',
  displayName: 'Waitlist Day 3 — Mechanism',
  previewData: { firstName: 'Aarav' },
} satisfies TemplateEntry
