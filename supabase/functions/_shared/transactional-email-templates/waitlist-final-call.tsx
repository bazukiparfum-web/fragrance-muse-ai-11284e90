import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Button } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { firstName?: string | null; ctaUrl?: string }

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }
const container = { maxWidth: 560, margin: '0 auto', padding: '32px 24px' }
const eyebrow = { fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: '#8E7845', margin: '0 0 12px' }
const h1 = { fontFamily: 'Georgia, serif', fontSize: 28, lineHeight: '36px', color: '#0A0908', margin: '0 0 16px' }
const p = { fontSize: 15, lineHeight: '24px', color: '#333', margin: '0 0 14px' }
const cta = { background: '#C9A227', color: '#0A0908', padding: '14px 22px', fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' as const, borderRadius: 2, textDecoration: 'none', display: 'inline-block' }

const Email = ({ firstName, ctaUrl }: Props) => (
  <Html lang="en">
    <Head />
    <Preview>Bazuki opens tomorrow — your 50% is ready</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>Aug 28 · Final call</Text>
        <Heading style={h1}>{firstName ? `${firstName}, tomorrow.` : 'Tomorrow.'}</Heading>
        <Text style={p}>Bazuki opens on Aug 29. Your early-access 50% is applied automatically at checkout — no code to type, no code to lose.</Text>
        <Text style={p}>Take the quiz first. Two minutes. Your formula is waiting on the other side.</Text>
        {ctaUrl ? (
          <Section style={{ margin: '20px 0' }}>
            <Button href={ctaUrl} style={cta}>Start the quiz</Button>
          </Section>
        ) : null}
        <Section style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee' }}>
          <Text style={{ ...p, fontSize: 12, color: '#8E7845' }}>Bazuki — India's first AI-algorithmic fragrance house.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Bazuki opens tomorrow',
  displayName: 'Waitlist Aug 28 — Final call',
  previewData: { firstName: 'Aarav', ctaUrl: 'https://www.bazukifragrance.com/shop/quiz' },
} satisfies TemplateEntry
