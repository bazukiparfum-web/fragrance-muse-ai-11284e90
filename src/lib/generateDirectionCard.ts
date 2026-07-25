// Client-side branded share card for the /coming-soon scent direction reveal.
// Renders a 1080x1350 PNG (4:5) via Canvas — safe for WhatsApp preview,
// Instagram feed and Story crops. No network calls; fonts fall back gracefully.

import type { ScentDirection } from "@/lib/scentDirections";

const W = 1080;
const H = 1350;

const INK = "#0A0A0A";
const GOLD = "#C9A84C";
const GOLD_DIM = "rgba(201,168,76,0.55)";
const CREAM = "#F5EFE6";
const CREAM_DIM = "rgba(245,239,230,0.6)";

async function ensureFonts(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  try {
    await Promise.race([
      Promise.all([
        (document as any).fonts.load("italic 96px 'Cormorant Garamond'"),
        (document as any).fonts.load("400 22px 'Inter'"),
        (document as any).fonts.load("500 13px 'JetBrains Mono'"),
      ]),
      new Promise((r) => setTimeout(r, 800)),
    ]);
  } catch {
    /* fall through to system fonts */
  }
}

function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  trackPx: number,
  align: "left" | "center" = "center",
) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total =
    widths.reduce((a, b) => a + b, 0) + trackPx * Math.max(0, chars.length - 1);
  let cursor = align === "center" ? x - total / 2 : x;
  const prev = ctx.textAlign;
  ctx.textAlign = "left";
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], cursor, y);
    cursor += widths[i] + trackPx;
  }
  ctx.textAlign = prev;
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontTemplate: (size: number) => string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
): number {
  let size = maxSize;
  while (size > minSize) {
    ctx.font = fontTemplate(size);
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }
  ctx.font = fontTemplate(minSize);
  return minSize;
}

function parseDirectionName(name: string): { lead: string; noun: string; trail: string } {
  // Expected shape: "The <Noun...> direction". Be defensive.
  const m = /^(The\s+)(.+?)(\s+direction)$/i.exec(name.trim());
  if (m) return { lead: m[1], noun: m[2], trail: m[3] };
  return { lead: "", noun: name, trail: "" };
}

export async function generateDirectionCard(
  direction: ScentDirection,
  _firstName?: string,
): Promise<Blob> {
  await ensureFonts();

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unsupported");

  // --- Background: ink + top-center gold vignette ---
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  const grad = ctx.createRadialGradient(W / 2, 0, 40, W / 2, 0, 900);
  grad.addColorStop(0, "rgba(201,168,76,0.14)");
  grad.addColorStop(1, "rgba(10,10,10,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // --- Hairline frame ---
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 1;
  ctx.strokeRect(40.5, 40.5, W - 81, H - 81);

  // --- Top: wordmark + eyebrow ---
  ctx.fillStyle = GOLD;
  ctx.font = "500 20px 'JetBrains Mono', ui-monospace, monospace";
  ctx.textBaseline = "alphabetic";
  drawTracked(ctx, "BAZUKI", W / 2, 130, 6.5, "center");

  // small divider dot
  ctx.beginPath();
  ctx.arc(W / 2, 168, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = CREAM_DIM;
  ctx.font = "500 15px 'JetBrains Mono', ui-monospace, monospace";
  drawTracked(ctx, "YOUR DIRECTION", W / 2, 210, 4.2, "center");

  // --- Center: direction name ---
  const { lead, noun, trail } = parseDirectionName(direction.name);
  const maxNameWidth = W - 200;

  // Fit noun size (largest, italic gold)
  const nounSize = fitFontSize(
    ctx,
    noun,
    (s) => `italic 700 ${s}px 'Cormorant Garamond', 'Cormorant', Georgia, serif`,
    maxNameWidth,
    120,
    64,
  );

  const trailSize = Math.round(nounSize * 0.55);

  // Lead "The" line (small, cream)
  if (lead.trim()) {
    ctx.fillStyle = CREAM;
    ctx.font = `italic 400 ${trailSize}px 'Cormorant Garamond', Georgia, serif`;
    ctx.textAlign = "center";
    ctx.fillText(lead.trim(), W / 2, 380);
  }

  // Noun (gold italic, big)
  ctx.fillStyle = GOLD;
  ctx.font = `italic 700 ${nounSize}px 'Cormorant Garamond', Georgia, serif`;
  ctx.textAlign = "center";
  const nounY = 380 + nounSize + 20;
  ctx.fillText(noun, W / 2, nounY);

  // Trail "direction"
  if (trail.trim()) {
    ctx.fillStyle = CREAM;
    ctx.font = `italic 400 ${trailSize}px 'Cormorant Garamond', Georgia, serif`;
    ctx.textAlign = "center";
    ctx.fillText(trail.trim(), W / 2, nounY + trailSize + 24);
  }

  // Ornament: short gold rule under the name
  const ruleY = nounY + trailSize + 70;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 40, ruleY);
  ctx.lineTo(W / 2 + 40, ruleY);
  ctx.stroke();

  // --- Note sketch ---
  const rows: Array<[string, string[]]> = [
    ["TOP", direction.top],
    ["HEART", direction.heart],
    ["BASE", direction.base],
  ];

  const notesStartY = ruleY + 90;
  const rowGap = 92;
  const labelX = 180;
  const valueX = 380;

  rows.forEach(([label, values], i) => {
    const y = notesStartY + i * rowGap;

    ctx.fillStyle = GOLD;
    ctx.font = "500 22px 'JetBrains Mono', ui-monospace, monospace";
    ctx.textAlign = "left";
    drawTracked(ctx, label, labelX, y, 3.2, "left");

    ctx.fillStyle = CREAM;
    ctx.font = "400 34px 'Inter', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(values.join("  ·  "), valueX, y);
  });

  // --- Footer ---
  ctx.fillStyle = GOLD;
  ctx.font = "italic 400 34px 'Cormorant Garamond', Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("Unlocks 29 August", W / 2, H - 160);

  ctx.fillStyle = CREAM_DIM;
  ctx.font = "500 16px 'JetBrains Mono', ui-monospace, monospace";
  drawTracked(ctx, "BAZUKIFRAGRANCE.COM", W / 2, H - 108, 3.8, "center");

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/png",
      0.95,
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
