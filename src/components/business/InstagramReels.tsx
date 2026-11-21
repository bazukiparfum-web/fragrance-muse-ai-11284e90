import { useEffect, useRef, useState } from "react";
import { Instagram } from "lucide-react";
import { BUSINESS_REELS, INSTAGRAM_HANDLE } from "@/data/businessReels";

declare global {
  interface Window { instgrm?: { Embeds: { process: () => void } } }
}

const loadEmbedScript = () => {
  if (window.instgrm) { window.instgrm.Embeds.process(); return; }
  if (document.getElementById("ig-embed")) return;
  const s = document.createElement("script");
  s.id = "ig-embed";
  s.async = true;
  s.src = "https://www.instagram.com/embed.js";
  document.body.appendChild(s);
};

const InstagramReels = () => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!BUSINESS_REELS.length || !ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { rootMargin: "400px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => { if (visible) loadEmbedScript(); }, [visible]);

  if (!BUSINESS_REELS.length) return null;
  const profile = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

  return (
    <section ref={ref} aria-labelledby="reels-title" className="bg-bz-primary py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">@{INSTAGRAM_HANDLE}</p>
          <h2 id="reels-title" className="mt-4 font-serif font-light leading-[1.15] text-cream text-[34px] md:text-[44px]">See it in real spaces</h2>
        </div>
        <div className="mt-12 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
          {BUSINESS_REELS.map((url) => (
            <div key={url} className="min-w-[280px] snap-center md:min-w-0">
              {visible ? (
                <blockquote className="instagram-media" data-instgrm-permalink={url} data-instgrm-version="14" style={{ margin: 0, width: "100%", minWidth: 0 }} />
              ) : (
                <div className="aspect-[9/16] w-full animate-pulse rounded-xl bg-bz-card" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a href={profile} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-pill border border-gold-strong/40 px-6 py-3 text-[12px] uppercase tracking-[0.18em] text-gold hover:bg-gold/10">
            <Instagram className="h-4 w-4" aria-hidden /> Follow @{INSTAGRAM_HANDLE}
          </a>
        </div>
      </div>
    </section>
  );
};
export default InstagramReels;
