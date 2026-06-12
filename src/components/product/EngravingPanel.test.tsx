import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { EngravingPanel, EngravingPanelHandle } from './EngravingPanel';


function setup(initial: { enabled?: boolean; text?: string; style?: 'Classic' | 'Elegant' | 'Bold' } = {}) {
  const onEnabledChange = vi.fn();
  const onTextChange = vi.fn();
  const onStyleChange = vi.fn();
  const ref = createRef<EngravingPanelHandle>();
  const utils = render(
    <EngravingPanel
      ref={ref}
      enabled={initial.enabled ?? false}
      onEnabledChange={onEnabledChange}
      text={initial.text ?? ''}
      onTextChange={onTextChange}
      style={initial.style ?? 'Classic'}
      onStyleChange={onStyleChange}
    />,
  );
  return { ...utils, onEnabledChange, onTextChange, onStyleChange, ref };
}

describe('EngravingPanel a11y', () => {
  it('switch carries accessible label and aria-expanded reflects state', () => {
    const { rerender } = setup({ enabled: false });
    const toggle = screen.getByRole('switch', { name: /toggle laser engraving/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    rerender(
      <EngravingPanel
        enabled
        onEnabledChange={() => {}}
        text=""
        onTextChange={() => {}}
        style="Classic"
        onStyleChange={() => {}}
      />,
    );
    expect(screen.getByRole('switch')).toHaveAttribute('aria-expanded', 'true');
  });

  it('font cards form a radiogroup with proper aria-checked and roving tabindex', () => {
    setup({ enabled: true, style: 'Elegant' });
    const group = screen.getByRole('radiogroup', { name: /engraving font style/i });
    expect(group).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    const elegant = radios.find((r) => r.getAttribute('aria-checked') === 'true');
    expect(elegant).toBeDefined();
    expect(elegant).toHaveAttribute('tabindex', '0');
    radios
      .filter((r) => r !== elegant)
      .forEach((r) => expect(r).toHaveAttribute('tabindex', '-1'));
  });

  it('arrow keys move selection between font cards', () => {
    const { onStyleChange } = setup({ enabled: true, style: 'Classic' });
    const radios = screen.getAllByRole('radio');
    const selected = radios.find((r) => r.getAttribute('aria-checked') === 'true')!;
    fireEvent.keyDown(selected, { key: 'ArrowRight' });
    expect(onStyleChange).toHaveBeenCalledWith('Elegant');
  });

  it('input is described by the counter', () => {
    setup({ enabled: true });
    const input = screen.getByLabelText(/your engraving text/i);
    expect(input.getAttribute('aria-describedby') || '').toContain('engraving-counter');
  });

  it('pulseInvalid() marks input invalid and shows alert', () => {
    const { ref } = setup({ enabled: true, text: '' });
    act(() => {
      ref.current?.pulseInvalid();
    });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/please enter your engraving text/i);
    const input = screen.getByLabelText(/your engraving text/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

});
