import { trackCta } from "@/lib/trackCta";

const WHATSAPP_URL =
  "https://wa.me/917990097922?text=" +
  encodeURIComponent(
    "Hi Bazuki, I'd like to ask about your scents before taking the quiz."
  );

const WhatsAppFab = () => {
  const handleClick = () => {
    trackCta("whatsapp_mobile");
  };

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label="Chat with Bazuki on WhatsApp"
      className="whatsapp-fab md:hidden"
    >
      <style>{`
        .whatsapp-fab {
          position: fixed;
          left: 16px;
          bottom: calc(20px + env(safe-area-inset-bottom, 0px));
          width: 56px;
          height: 56px;
          border-radius: 9999px;
          background: #25D366;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.25);
          z-index: 60;
          transition: transform 200ms ease, box-shadow 200ms ease;
        }
        .whatsapp-fab:hover, .whatsapp-fab:focus-visible {
          transform: scale(1.05);
          box-shadow: 0 10px 28px rgba(0,0,0,0.4);
          outline: none;
        }
        .whatsapp-fab:active { transform: scale(0.97); }
        @media (prefers-reduced-motion: reduce) {
          .whatsapp-fab { transition: none; }
        }
      `}</style>
      <svg
        viewBox="0 0 32 32"
        width="28"
        height="28"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.604 3.045 4.55 3.93.515.214 2.494 1.046 3.052 1.046.745 0 2.193-.602 2.452-1.32.087-.272.158-.572.158-.86 0-.21-.115-.296-.273-.43-.273-.215-2.466-1.39-2.652-1.39zM16.225 28.083h-.014A11.78 11.78 0 0 1 10.6 26.57l-.4-.243-4.165 1.087 1.114-4.057-.256-.4A11.74 11.74 0 0 1 4.85 16.55c.014-6.52 5.314-11.82 11.825-11.82 3.157 0 6.123 1.227 8.36 3.46a11.747 11.747 0 0 1 3.46 8.363c-.001 6.52-5.302 11.83-11.27 11.83zm10.069-21.873A14.064 14.064 0 0 0 16.226 2C8.46 2 2.135 8.325 2.13 16.097 2.13 18.58 2.78 21 4.012 23.137L2 30.5l7.553-1.98a14.04 14.04 0 0 0 6.665 1.7h.005c7.764 0 14.09-6.325 14.092-14.097 0-3.77-1.464-7.31-4.13-9.973z" />
      </svg>
    </a>
  );
};

export default WhatsAppFab;
