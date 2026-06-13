import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Link } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { sessionId?: string; siteUrl?: string }

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }
const container = { maxWidth: 560, margin: '0 auto', padding: '28px 24px' }
const h1 = { fontSize: 22, lineHeight: '30px', margin: '8px 0 6px', color: '#0D0C0A' }
const body = { fontSize: 14, color: '#1a1a1a', lineHeight: 1.6 }
const ctaBtn = {
  display: 'inline-block', padding: '12px 22px', borderRadius: 8,
  background: '#C9A84C', color: '#0D0C0A', fontWeight: 700, textDecoration: 'none', marginTop: 14,
}

const Email = ({ sessionId = '', siteUrl = 'https://www.bazukifragrance.com' }: Props) => {
  const link = `${siteUrl}/shop/quiz/results?session=${encodeURIComponent(sessionId)}&utm_source=email&utm_medium=retargeting&utm_campaign=quiz_followup&utm_content=day7`
  return (
    <Html lang="en">
      <Head />
      <Preview>Your formula expires in 23 days</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your formula expires in 23 days</Heading>
          <Text style={body}>Don't let your personalised AI formula slip away.</Text>
          <Text style={body}>Order before it expires — we'll precision-fill it for you in 3–5 days.</Text>
          <Link href={link} style={ctaBtn}>Claim My Formula →</Link>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: 'Your formula expires in 23 days',
  displayName: 'Quiz Followup — Day 7',
  previewData: { sessionId: 'demo' },
} satisfies TemplateEntry
