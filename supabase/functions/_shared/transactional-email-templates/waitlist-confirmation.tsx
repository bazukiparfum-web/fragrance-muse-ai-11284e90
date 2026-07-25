import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  email?: string
  ctaUrl?: string
  variant?: 'A' | 'B'
  trackingBase?: string
  messageId?: string
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
  fontSize: 30,
  lineHeight: '38px',
  margin: '0 0 14px',
  color: '#0A0908',
}
const body = { fontSize: 15, lineHeight: '24px', color: '#3a342d', margin: '10px 0' }
const cta = {
  display: 'inline-block',
  background: '#0A0908',
  color: '#EDE7D9',
  padding: '14px 22px',
  borderRadius: 2,
  fontSize: 13,
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  textDecoration: 'none',
  fontWeight: 600 as const,
}
const brand = {
  fontFamily: 'Georgia, "Cormorant Garamond", serif',
  fontSize: 14,
  letterSpacing: '0.28em',
  color: '#8E7845',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
  margin: '0 0 6px',
}
const footer = { fontSize: 12, color: '#8a8378', margin: '18px 0 0', textAlign: 'center' as const }

const TEMPLATE_NAME = 'waitlist-confirmation'

const buildTracked = (
  trackingBase: string | undefined,
  messageId: string | undefined,
  variant: string | undefined,
  target: string,
) => {
  if (!trackingBase || !messageId) return target
  const qs = new URLSearchParams({
    a: 'click',
    t: TEMPLATE_NAME,
    mid: messageId,
    v: variant ?? '',
    u: target,
  })
  return `${trackingBase}?${qs.toString()}`
}

const buildPixel = (
  trackingBase: string | undefined,
  messageId: string | undefined,
  variant: string | undefined,
) => {
  if (!trackingBase || !messageId) return ''
  const qs = new URLSearchParams({
    a: 'open',
    t: TEMPLATE_NAME,
    mid: messageId,
    v: variant ?? '',
  })
  return `${trackingBase}?${qs.toString()}`
}

const Email = ({ ctaUrl, variant, trackingBase, messageId }: Props) => {
  const discoverBase = ctaUrl || 'https://www.bazukifragrance.com/home'
  const discoverWithUtm = (() => {
    try {
      const u = new URL(discoverBase)
      u.searchParams.set('utm_source', 'welcome_email')
      if (variant) u.searchParams.set('utm_content', `variant_${variant}`)
      if (messageId) u.searchParams.set('emid', messageId)
      if (variant) u.searchParams.set('ev', variant)
      return u.toString()
    } catch { return discoverBase }
  })()

  const trackedCta = buildTracked(trackingBase, messageId, variant, discoverWithUtm)
  const pixel = buildPixel(trackingBase, messageId, variant)

  const previewText = variant === 'B'
    ? "You're in first. Here's 50% off your purchase."
    : "You're in first. Half-price on your first formula."

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>— Early access confirmed —</Text>
          <Heading style={h1}>You're one of the first.</Heading>

          <Text style={body}>
            Before Bazuki opens to the world, our machine blends for a select few — and you're on
            that list.
          </Text>
          <Text style={body}>
            As an early-access member, your first personalized formula is crafted at{' '}
            <strong>50% off</strong>. Take the quiz, let the machine blend from 50+ ingredients,
            and receive a fragrance that exists for no one else.
          </Text>

          <Section style={{ textAlign: 'center', margin: '26px 0 8px' }}>
            <Button href={trackedCta} style={cta}>
              Discover your formula — 50% off →
            </Button>
          </Section>

          <Text style={{ ...body, marginTop: 24 }}>
            No two bottles we make are ever the same. Neither is this offer.
          </Text>

          <Text style={{ ...body, marginTop: 20 }}>
            Welcome to the first blend,
            <br />
            Vishvam &amp; the Bazuki team
          </Text>

          <Hr style={{ borderColor: '#ece5d8', margin: '28px 0 16px' }} />

          <Text style={brand}>Bazuki</Text>
          <Text style={footer}>
            Launching 29 August 2026 · 12:00 AM IST
            <br />
            discover your formula — @bazukiperfumes
          </Text>

          {pixel ? (
            <Img src={pixel} alt="" width="1" height="1" style={{ display: 'block', width: 1, height: 1, opacity: 0 }} />
          ) : null}
        </Container>
      </Body>
    </Html>
  )
}

const SUBJECT_A = 'Your early access is open — at half price.'
const SUBJECT_B = "You're in first. Here's 50% off on your purchase."

export const template = {
  component: Email,
  subject: (data: Record<string, unknown>) =>
    (data?.variant === 'B' ? SUBJECT_B : SUBJECT_A),
  displayName: 'Waitlist Confirmation',
  previewData: {
    email: 'jane@example.com',
    ctaUrl: 'https://www.bazukifragrance.com/home',
    variant: 'A',
  },
} satisfies TemplateEntry
