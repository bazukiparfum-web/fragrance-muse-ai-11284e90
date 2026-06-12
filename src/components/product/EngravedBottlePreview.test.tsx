import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EngravedBottlePreview from './EngravedBottlePreview';

vi.mock('./ProductImageStage', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

describe('EngravedBottlePreview', () => {
  it('does not render the engraving overlay when disabled', () => {
    render(<EngravedBottlePreview alt="bottle" enabled={false} text="Priya" style="Classic" />);
    expect(screen.queryByTestId('engraving-overlay')).toBeNull();
  });

  it('does not render the overlay when enabled but text is empty', () => {
    render(<EngravedBottlePreview alt="bottle" enabled text="" style="Classic" />);
    expect(screen.queryByTestId('engraving-overlay')).toBeNull();
  });

  it('renders each character when enabled with text', () => {
    render(<EngravedBottlePreview alt="bottle" enabled text="ABC" style="Classic" />);
    const inner = screen.getByTestId('engraving-preview-text');
    // 3 characters + spark span (sparkKey starts at 0, increments via effect → 1)
    expect(inner.textContent?.replace('✦', '')).toBe('ABC');
  });

  it('shrinks font size as text length grows', () => {
    const sizeFor = (t: string) => {
      const { unmount, getByTestId } = render(
        <EngravedBottlePreview alt="b" enabled text={t} style="Classic" />,
      );
      const px = parseInt((getByTestId('engraving-preview-text') as HTMLElement).style.fontSize, 10);
      unmount();
      return px;
    };
    expect(sizeFor('ABC')).toBe(22);
    expect(sizeFor('ABCDEFGHI')).toBe(18);
    expect(sizeFor('ABCDEFGHIJKLMNO')).toBe(14);
    expect(sizeFor('ABCDEFGHIJKLMNOPQRST')).toBe(11);
  });
});
