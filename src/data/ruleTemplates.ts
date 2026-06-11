export interface RuleTemplate {
  rule_name: string;
  rule_type: string;
  description: string;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  priority: number;
  is_active: boolean;
}

export const RULE_TEMPLATES: RuleTemplate[] = [
  {
    rule_name: 'Summer Fresh Boost',
    rule_type: 'proportion',
    description: 'In hot or warm climates with fresh/citrus preference, lift top notes for an airier opening.',
    conditions: { climate: ['Hot/Humid', 'Warm'], scentFamily: ['fresh', 'citrus'] },
    actions: { proportions: { top: 35, heart: 30, base: 35 } },
    priority: 80,
    is_active: true,
  },
  {
    rule_name: 'Evening Elegance Anchor',
    rule_type: 'enhancement',
    description: 'Evening or special occasions with elegant/romantic personalities require warm base anchors.',
    conditions: { occasion: ['Evening', 'Special'], personality: ['Elegant', 'Romantic'] },
    actions: { requireNotes: { base: ['Amber', 'Musk', 'Vanilla'] } },
    priority: 70,
    is_active: true,
  },
  {
    rule_name: 'Sport Clean Slate',
    rule_type: 'restriction',
    description: 'Sport occasions should avoid heavy, sweet, or smoky base notes.',
    conditions: { occasion: ['Sport'] },
    actions: { avoidNotes: { base: ['Oud', 'Patchouli', 'Incense'] } },
    priority: 60,
    is_active: true,
  },
  {
    rule_name: 'Winter Warm Base',
    rule_type: 'proportion',
    description: 'Cool or cold climates benefit from a heavier base for longer projection in cold air.',
    conditions: { climate: ['Cool', 'Cold'] },
    actions: { proportions: { top: 20, heart: 30, base: 50 } },
    priority: 75,
    is_active: true,
  },
  {
    rule_name: 'Office Subtle Intensity',
    rule_type: 'proportion',
    description: 'Office settings call for a softer top and balanced heart so the scent stays close to skin.',
    conditions: { occasion: ['Office'] },
    actions: { proportions: { top: 20, heart: 40, base: 40 } },
    priority: 55,
    is_active: true,
  },
  {
    rule_name: 'Romantic Floral Heart',
    rule_type: 'enhancement',
    description: 'Romantic personalities with floral preference get Rose and Jasmine in the heart layer.',
    conditions: { personality: ['Romantic'], scentFamily: ['floral'] },
    actions: { requireNotes: { heart: ['Rose', 'Jasmine'] } },
    priority: 65,
    is_active: true,
  },
];
