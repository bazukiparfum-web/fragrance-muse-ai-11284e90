import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Link } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { sessionId?: string; siteUrl?: string }

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }
const container = { maxWidth: 560, margin: '0 auto', padding: '28px 24px' }
const h1 = { fontSize: 22, lineHeight: '30px', margin: '8px 0 6px', color: '#B00020' }
const body = { fontSize: 14, color: '#1a1a1a', lineHeight: 1.6 }
const ctaBtn = {
  display: 'inline-block', padding: '12px 22px', borderRadius: 8,
  background: '#C9A84C', color: '#0D0C0A', fontWeight: 700, textDecoration: 'none', marginTop: 14,
}

const Email = ({ sessionId = '', siteUrl = 'https://www.bazukifragrance.com' }: Props) => {
  const link = `${siteUrl}/shop/quiz/results?session=${encodeURIComponent(sessionId)}&utm_source=email&utm_medium=retargeting&utm_campaign=quiz_followup&utm_content=day25`
  return (
    <Html lang="en">
      <Head />
      <Preview>Last chance — 5 days left for your Bazuki formula</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Last chance — 5 days left</Heading>
          <Text style={body}>After 30 days, your personalised AI formula will be lost forever.</Text>
          <Text style={body}>This is your final reminder. Claim your formula now.</Text>
          <Link href={link} style={ctaBtn}>Claim Before It Expires →</Link>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: 'Last chance — 5 days left for your Bazuki formula',
  displayName: 'Quiz Followup — Day 25',
  previewData: { sessionId: 'demo' },
} satisfies TemplateEntry
