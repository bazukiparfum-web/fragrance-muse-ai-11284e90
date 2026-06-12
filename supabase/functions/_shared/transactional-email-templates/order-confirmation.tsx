import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface EngravingMeta {
  text: string
  style: string
  fee?: string
}

interface Item {
  name: string
  qty: number
  price: string
  size?: string
  engraving?: EngravingMeta | null
}

interface Props {
  orderNumber?: string
  customerName?: string
  items?: Item[]
  total?: string
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }
const container = { maxWidth: 560, margin: '0 auto', padding: '28px 24px' }
const h1 = { fontSize: 24, lineHeight: '32px', margin: '12px 0 6px', color: '#0D0C0A' }
const muted = { fontSize: 13, color: '#6b6258', margin: '4px 0' }
const itemRow = { padding: '14px 0', borderBottom: '1px solid #ece5d8' }
const itemName = { fontSize: 15, fontWeight: 600, color: '#0D0C0A', margin: 0 }
const itemMeta = { fontSize: 12, color: '#6b6258', margin: '2px 0 0' }
const engravingBox = {
  marginTop: 8,
  padding: '10px 12px',
  border: '1px solid #C9A84C',
  borderRadius: 6,
  background: '#fdf8ec',
}
const engravingLabel = { fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#8B6914', margin: 0 }
const engravingText = { fontSize: 18, color: '#8B6914', margin: '4px 0 2px', fontStyle: 'italic' as const }
const totalRow = { fontSize: 16, fontWeight: 700, padding: '14px 0', color: '#0D0C0A' }

const Email = ({
  orderNumber = '0000',
  customerName,
  items = [],
  total,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Bazuki order #{orderNumber} is confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={{ fontSize: 11, letterSpacing: '0.2em', color: '#C9A84C', margin: 0 }}>
          ✦ BAZUKI
        </Text>
        <Heading style={h1}>Your scent is being crafted</Heading>
        <Text style={muted}>
          {customerName ? `Hi ${customerName}, ` : ''}order #{orderNumber} is confirmed.
          We'll send a WhatsApp update once it ships.
        </Text>

        <Section style={{ marginTop: 20 }}>
          {items.map((it, i) => (
            <Row key={i} style={itemRow}>
              <Column>
                <Text style={itemName}>
                  {it.name} {it.qty > 1 ? `× ${it.qty}` : ''}
                </Text>
                <Text style={itemMeta}>
                  {it.size ? `${it.size} · ` : ''}{it.price}
                </Text>
                {it.engraving && (
                  <Section style={engravingBox}>
                    <Text style={engravingLabel}>✦ Laser Engraving</Text>
                    <Text style={engravingText}>"{it.engraving.text}"</Text>
                    <Text style={{ ...itemMeta, color: '#8B6914' }}>
                      Style: {it.engraving.style}
                      {it.engraving.fee ? ` · ${it.engraving.fee}` : ''}
                    </Text>
                  </Section>
                )}
              </Column>
            </Row>
          ))}
        </Section>

        {total && (
          <Row>
            <Column align="right">
              <Text style={totalRow}>Total {total}</Text>
            </Column>
          </Row>
        )}

        <Hr style={{ borderColor: '#ece5d8', margin: '20px 0' }} />
        <Text style={muted}>
          Need to reach us? Reply to this email — we read every message.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: ((data: Record<string, unknown>) =>
    `Your Bazuki order #${(data?.orderNumber as string) || ''} is confirmed`) as TemplateEntry['subject'],
  displayName: 'Order Confirmation',
  previewData: {
    orderNumber: '1042',
    customerName: 'Priya',
    items: [
      {
        name: 'Cool Wave Bespoke Perfume',
        qty: 1,
        price: '₹2,499',
        size: '50ml',
        engraving: { text: 'PRIYA', style: 'Elegant', fee: '+₹199' },
      },
    ],
    total: '₹2,698',
  },
} satisfies TemplateEntry
