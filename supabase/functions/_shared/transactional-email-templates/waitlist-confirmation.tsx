import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  email?: string
  referralCode?: string | null
  utmSource?: string | null
}


const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }
const container = { maxWidth: 560, margin: '0 auto', padding: '32px 24px' }
const eyebrow = {
  fontSize: 11,
  letterSpacing: '0.28em',
  textTransform: 'uppercase' as const,
  color: '#8E7845',
  margin: '0 0 12px',
}
const h1 = {
  fontFamily: 'Georgia, "Cormorant Garamond", serif',
  fontSize: 28,
  lineHeight: '36px',
  margin: '0 0 12px',
  color: '#0A0908',
}
const body = { fontSize: 15, lineHeight: '24px', color: '#3a342d', margin: '10px 0' }
const perks = { fontSize: 14, lineHeight: '22px', color: '#3a342d', margin: '4px 0' }
const referralBox = {
  marginTop: 20,
  padding: '14px 16px',
  border: '1px solid #C9A45C',
  background: '#fdf8ec',
  borderRadius: 4,
}
const referralLabel = {
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  color: '#8B6914',
  margin: 0,
}
const referralCodeStyle = {
  fontFamily: 'ui-monospace, Menlo, monospace',
  fontSize: 18,
  color: '#8B6914',
  margin: '4px 0 0',
  fontWeight: 600 as const,
}
const footer = { fontSize: 12, color: '#8a8378', margin: '24px 0 0', textAlign: 'center' as const }
const brand = {
  fontFamily: 'Georgia, "Cormorant Garamond", serif',
  fontSize: 14,
  letterSpacing: '0.28em',
  color: '#8E7845',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
  margin: '0 0 6px',
}

const Email = ({ email, referralCode, utmSource }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're on the Bazuki list — launching 29 August 2026.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>— Reservation confirmed —</Text>
        <Heading style={h1}>You're on the list.</Heading>
        <Text style={body}>
          Thanks for reserving early access to Bazuki — India's first AI-algorithmic
          perfume house. We'll write when the machine is ready.
        </Text>

        <Section style={{ margin: '20px 0 8px' }}>
          <Text style={{ ...eyebrow, margin: '0 0 8px' }}>What you get</Text>
          <Text style={perks}>✦ Priority quiz access before public launch</Text>
          <Text style={perks}>✦ A launch-week formula credit (first 500 signups)</Text>
          <Text style={perks}>✦ First look at the 52-ingredient library</Text>
        </Section>

        {referralCode || utmSource ? (
          <Section style={referralBox}>
            {referralCode ? (
              <>
                <Text style={referralLabel}>Referral applied</Text>
                <Text style={referralCodeStyle}>{referralCode}</Text>
                <Text style={{ ...body, fontSize: 12, margin: '6px 0 0', color: '#6b6258' }}>
                  We've noted your referrer — they'll be credited at launch.
                </Text>
              </>
            ) : null}
            {utmSource ? (
              <Text
                style={{
                  ...body,
                  fontSize: 12,
                  margin: referralCode ? '10px 0 0' : '0',
                  color: '#6b6258',
                }}
              >
                Source: <strong style={{ color: '#8B6914' }}>{utmSource}</strong>
              </Text>
            ) : null}
          </Section>
        ) : null}


        <Hr style={{ borderColor: '#ece5d8', margin: '28px 0 16px' }} />

        <Text style={brand}>Bazuki</Text>
        <Text style={footer}>
          Launching 29 August 2026 · 12:00 AM IST
          <br />
          discover your formula — @bazukiperfumes
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: "You're on the Bazuki list ✦",
  displayName: 'Waitlist Confirmation',
  previewData: { email: 'jane@example.com', referralCode: 'FRIEND-1234', utmSource: 'instagram' },
} satisfies TemplateEntry
