import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  fullName?: string
  setPasswordUrl?: string
  siteName?: string
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }
const container = { maxWidth: 560, margin: '0 auto', padding: '28px 24px' }
const brandMark = { fontSize: 11, letterSpacing: '0.2em', color: '#C9A84C', margin: 0 }
const h1 = { fontSize: 24, lineHeight: '32px', margin: '12px 0 6px', color: '#0D0C0A' }
const text = { fontSize: 15, lineHeight: '24px', color: '#1a1a1a', margin: '10px 0' }
const muted = { fontSize: 13, color: '#6b6258', margin: '4px 0' }
const button = {
  display: 'inline-block',
  backgroundColor: '#0D0C0A',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: 6,
  fontSize: 15,
  fontWeight: 600,
  textDecoration: 'none',
  marginTop: 12,
}
const fallbackUrl = { fontSize: 12, color: '#6b6258', wordBreak: 'break-all' as const, margin: '8px 0 0' }

const Email = ({
  fullName,
  setPasswordUrl = '#',
  siteName = 'Bazuki',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {siteName} — set your password to get started</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brandMark}>✦ {siteName.toUpperCase()}</Text>
        <Heading style={h1}>Welcome aboard{fullName ? `, ${fullName}` : ''} 🎉</Heading>
        <Text style={text}>
          An admin has created an account for you on {siteName}. To get started,
          choose a password using the secure link below.
        </Text>

        <Button href={setPasswordUrl} style={button}>
          Set your password
        </Button>

        <Text style={fallbackUrl}>
          Or paste this link into your browser:<br />
          {setPasswordUrl}
        </Text>

        <Hr style={{ borderColor: '#ece5d8', margin: '24px 0' }} />
        <Text style={muted}>
          This link is single-use and expires soon for your security. If you
          weren't expecting this email, you can safely ignore it.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Welcome to Bazuki — set your password',
  displayName: 'Admin User Invite',
  previewData: {
    fullName: 'Priya',
    setPasswordUrl: 'https://bazukifragrance.com/reset-password?token=example',
    siteName: 'Bazuki',
  },
} satisfies TemplateEntry
