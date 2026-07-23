import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Link } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { firstName?: string | null; referralCode?: string | null; shareUrl?: string }

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }
const container = { maxWidth: 560, margin: '0 auto', padding: '32px 24px' }
const eyebrow = { fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: '#8E7845', margin: '0 0 12px' }
const h1 = { fontFamily: 'Georgia, serif', fontSize: 26, lineHeight: '34px', color: '#0A0908', margin: '0 0 16px' }
const p = { fontSize: 15, lineHeight: '24px', color: '#333', margin: '0 0 14px' }
const codeBox = { display: 'inline-block', padding: '10px 18px', border: '1px solid #C9A227', color: '#C9A227', fontFamily: 'monospace', fontSize: 18, letterSpacing: '0.12em', margin: '6px 0 18px' }

const Email = ({ firstName, referralCode, shareUrl }: Props) => (
  <Html lang="en">
    <Head />
    <Preview>Share your code — earn early access rewards</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>Day 8 · Share your unlock</Text>
        <Heading style={h1}>{firstName ? `${firstName}, invite a few.` : 'Invite a few.'}</Heading>
        <Text style={p}>Every friend who claims early access with your code takes one of the 5,000 opening blends — and puts you closer to unlocking a free custom formula from us at launch.</Text>
        {referralCode ? <Text style={codeBox}>{referralCode}</Text> : null}
        {shareUrl ? (
          <Text style={p}>
            Share this link: <Link href={shareUrl} style={{ color: '#C9A227' }}>{shareUrl}</Link>
          </Text>
        ) : null}
        <Text style={p}>Bazuki works because it's personal. Send it to people who take scent seriously.</Text>
        <Section style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee' }}>
          <Text style={{ ...p, fontSize: 12, color: '#8E7845' }}>Bazuki — India's first AI-algorithmic fragrance house.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Share your Bazuki code',
  displayName: 'Waitlist Day 8 — Referral push',
  previewData: { firstName: 'Aarav', referralCode: 'BZK-A1B2', shareUrl: 'https://www.bazukifragrance.com/coming-soon?ref=BZK-A1B2' },
} satisfies TemplateEntry
