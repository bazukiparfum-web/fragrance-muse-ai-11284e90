import { describe, it, expect } from 'vitest';
import { isDiffuserFamily } from './shopify';
describe('isDiffuserFamily', () => {
  it('includes diffusers', () => expect(isDiffuserFamily({ title: '3-in-One Aroma Diffuser', tags: ['diffuser'] })).toBe(true));
  it('includes fragrance oils', () => expect(isDiffuserFamily({ title: 'Oud Diffuser Fragrance Oil', tags: [] })).toBe(true));
  it('excludes perfumes', () => expect(isDiffuserFamily({ title: 'Midnight Velvet', tags: ['perfume'] })).toBe(false));
});
