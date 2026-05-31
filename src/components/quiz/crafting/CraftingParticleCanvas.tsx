import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export interface ParticleCanvasHandle {
  burstAt: (clientX: number, clientY: number, count?: number) => void;
  finaleBurst: (clientX: number, clientY: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  spin: number;
  angle: number;
  radius: number;
  cx: number;
  cy: number;
  kind: 'ambient' | 'burst' | 'mist';
  opacity: number;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const CraftingParticleCanvas = forwardRef<ParticleCanvasHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    burstAt: (clientX: number, clientY: number, count = 8) => {
      if (prefersReducedMotion()) return;
      const cvs = canvasRef.current;
      if (!cvs) return;
      const rect = cvs.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -1 - Math.random() * 1.5,
          life: 0,
          maxLife: 60 + Math.random() * 40,
          size: 1.5 + Math.random() * 1.5,
          color: Math.random() > 0.4 ? '#F0C040' : '#F5F0E8',
          spin: 0,
          angle: 0,
          radius: 0,
          cx: 0,
          cy: 0,
          kind: 'burst',
          opacity: 0.8,
        });
      }
    },
    finaleBurst: (clientX: number, clientY: number) => {
      if (prefersReducedMotion()) return;
      const cvs = canvasRef.current;
      if (!cvs) return;
      const rect = cvs.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2 + Math.random() * 0.3;
        const speed = 2 + Math.random() * 4;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 80 + Math.random() * 60,
          size: 3 + Math.random() * 5,
          color: i % 3 === 0 ? '#F5F0E8' : '#F0C040',
          spin: (Math.random() - 0.5) * 0.05,
          angle,
          radius: 0,
          cx: 0,
          cy: 0,
          kind: 'burst',
          opacity: 0.9,
        });
      }
    },
  }));

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = cvs.clientWidth;
      const h = cvs.clientHeight;
      cvs.width = w * dpr;
      cvs.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // seed ambient particles
    const W = () => cvs.clientWidth;
    const H = () => cvs.clientHeight;
    const center = () => ({ x: W() / 2, y: H() / 2 });

    for (let i = 0; i < 60; i++) {
      const c = center();
      const radius = 80 + Math.random() * Math.min(W(), H()) * 0.45;
      const angle = Math.random() * Math.PI * 2;
      particlesRef.current.push({
        x: c.x + Math.cos(angle) * radius,
        y: c.y + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: Infinity,
        size: 1 + Math.random() * 2,
        color: Math.random() > 0.5 ? '#C9A84C' : '#F5F0E8',
        spin: 0.0008 + Math.random() * 0.0012,
        angle,
        radius,
        cx: c.x,
        cy: c.y,
        kind: 'ambient',
        opacity: 0.15 + Math.random() * 0.35,
      });
    }
    // mist puffs
    for (let i = 0; i < 4; i++) {
      particlesRef.current.push({
        x: Math.random() * W(),
        y: Math.random() * H(),
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.05 - Math.random() * 0.08,
        life: 0,
        maxLife: Infinity,
        size: 18 + Math.random() * 12,
        color: '#C9A84C',
        spin: 0,
        angle: 0,
        radius: 0,
        cx: 0,
        cy: 0,
        kind: 'mist',
        opacity: 0.08 + Math.random() * 0.04,
      });
    }

    const tick = () => {
      ctx.clearRect(0, 0, W(), H());
      const c = center();
      const arr = particlesRef.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        if (p.kind === 'ambient') {
          p.angle += p.spin;
          p.x = c.x + Math.cos(p.angle) * p.radius;
          p.y = c.y + Math.sin(p.angle) * p.radius * 0.7;
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'mist') {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -50) p.y = H() + 30;
          if (p.x < -50) p.x = W() + 30;
          if (p.x > W() + 50) p.x = -30;
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `rgba(201,168,76,${p.opacity})`);
          grad.addColorStop(1, 'rgba(201,168,76,0)');
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // burst
          p.vy += 0.02;
          p.x += p.vx;
          p.y += p.vy;
          p.life += 1;
          const t = p.life / p.maxLife;
          if (t >= 1) {
            arr.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = p.opacity * (1 - t);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - t * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
    };
  }, []);

  return <canvas ref={canvasRef} className="crafting-particle-canvas" aria-hidden="true" />;
});

CraftingParticleCanvas.displayName = 'CraftingParticleCanvas';
