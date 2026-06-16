import { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import { Sparkles, X, Minus, Send, ArrowLeft } from "lucide-react";
import { classifyInput, fallbackMessage } from "./safety";


type Role = "user" | "assistant";
type Msg = { role: Role; content: string; ts: number };

const STORAGE_KEY = "bazuki_chat_history";
const STORAGE_TTL_MS = 24 * 60 * 60 * 1000;
const WHATSAPP_NUMBER = "917990097922";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi! I need help with my Bazuki order.",
)}`;
const ESCALATION_KEYWORDS = [
  "order", "delivery", "tracking", "return", "refund",
  "wrong", "complaint", "damaged", "delay",
];
const NOTIF_MESSAGES = [
  "Need help finding your scent? ✨",
  "Ask Zuki anything! 🌸",
  "Not sure which size? I can help!",
  "Your formula is waiting... 💛",
];

function loadHistory(): Msg[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { savedAt: number; messages: Msg[] };
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > STORAGE_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return Array.isArray(parsed.messages) ? parsed.messages.slice(-20) : [];
  } catch {
    return [];
  }
}
function saveHistory(messages: Msg[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ savedAt: Date.now(), messages: messages.slice(-20) }),
    );
  } catch {
    /* ignore */
  }
}

function getPageGreeting(pathname: string): string {
  if (pathname.startsWith("/quiz")) {
    return "Ooh you're taking the quiz! Need help with any of the questions? I've got you 🙌";
  }
  if (pathname.startsWith("/results") || pathname.startsWith("/quiz-results")) {
    return "Your formula is looking incredible btw! Want me to explain why these matched you so well? ✦";
  }
  if (pathname.startsWith("/product") || pathname.startsWith("/scent")) {
    return "Great choice looking at this one! Want to know what it smells like or which size is better for you?";
  }
  if (pathname.startsWith("/collection") || pathname.startsWith("/shop")) {
    return "So many gorgeous options right? Tell me a bit about you and I'll point you straight to your match 🌸";
  }
  return "What brings you here today? Searching for something for yourself or as a gift? 🎁";
}

function getQuickReplies(pathname: string): string[] {
  if (pathname.startsWith("/quiz")) {
    return ["Explain this question", "What is sillage?", "Help me choose", "Skip this one?"];
  }
  if (pathname.startsWith("/results") || pathname.startsWith("/quiz-results")) {
    return ["Why this match?", "Which size should I get?", "Save my formula", "Tell me more"];
  }
  if (pathname.startsWith("/product") || pathname.startsWith("/scent")) {
    return ["What does this smell like?", "Which size is better?", "Add engraving ideas", "Is this a good gift?"];
  }
  if (pathname.startsWith("/collection") || pathname.startsWith("/shop")) {
    return ["Help me choose", "Best for gifting?", "Most popular?", "Under ₹1000?"];
  }
  return ["Find my scent ✨", "Buy as a gift 🎁", "What makes Bazuki different?", "See fragrances"];
}

function buildContextMessage(userMessage: string): string {
  const ctx = {
    page: window.location.pathname,
    title: document.title,
    has_quiz_results: (() => {
      try {
        return !!localStorage.getItem("formula_results") || !!localStorage.getItem("quiz_results");
      } catch { return false; }
    })(),
  };
  return `[Context: page=${ctx.page}, title="${ctx.title}", has_quiz_results=${ctx.has_quiz_results}]\n\nUser: ${userMessage}`;
}

function shouldEscalate(text: string): boolean {
  const lower = text.toLowerCase();
  return ESCALATION_KEYWORDS.some((k) => lower.includes(k));
}

const ZukiPanel = ({ onClose, onMinimize, isMobile }: {
  onClose: () => void;
  onMinimize: () => void;
  isMobile: boolean;
}) => {
  const [messages, setMessages] = useState<Msg[]>(() => loadHistory());
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const lastSentAt = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pathname = window.location.pathname;
  const quickReplies = useMemo(() => getQuickReplies(pathname), [pathname]);

  // welcome on first open
  useEffect(() => {
    if (messages.length === 0) {
      const isReturning = !!loadHistory().length;
      const intro: Msg = {
        role: "assistant",
        ts: Date.now(),
        content: isReturning
          ? "Welcome back! 🌸 Your formula is still saved. Want to pick up where you left off or have a different question?"
          : "Hey! I'm Zuki ✨ Bazuki's AI scent advisor.\n\nI can help you find your perfect fragrance, explain your quiz results, or just answer any questions!",
      };
      setMessages([intro]);
      const t = setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: getPageGreeting(pathname), ts: Date.now() },
        ]);
      }, 800);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { saveHistory(messages); }, [messages]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    const now = Date.now();
    if (now - lastSentAt.current < 2000) return;
    lastSentAt.current = now;

    if (shouldEscalate(trimmed)) setShowEscalation(true);

    const userMsg: Msg = { role: "user", content: trimmed, ts: now };
    const nextMessages = [...messages, userMsg].slice(-20);
    setMessages(nextMessages);
    setInput("");

    // Client-side safety guardrail — block & show friendly fallback without hitting Claude
    const verdict = classifyInput(trimmed);
    if (verdict.blocked && verdict.reason) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fallbackMessage(verdict.reason!), ts: Date.now() },
      ]);
      setShowEscalation(true);
      return;
    }

    setIsStreaming(true);

    // Build API payload — wrap last user message w/ context
    const apiMessages = nextMessages.map((m, i) => {
      if (i === nextMessages.length - 1 && m.role === "user") {
        return { role: "user", content: buildContextMessage(m.content) };
      }
      return { role: m.role, content: m.content };
    });

    const placeholder: Msg = { role: "assistant", content: "", ts: Date.now() };
    setMessages((prev) => [...prev, placeholder]);

    const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
    const anonKey = (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY
      || (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
    const url = `${supabaseUrl}/functions/v1/zuki-chat`;

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(anonKey ? { Authorization: `Bearer ${anonKey}`, apikey: anonKey } : {}),
        },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
              acc += evt.delta.text || "";
              setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last?.role === "assistant") copy[copy.length - 1] = { ...last, content: acc };
                return copy;
              });
            }
          } catch { /* ignore parse errors on heartbeat lines */ }
        }
      }

      if (!acc) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: "Oops, I got a bit lost there! Try again? 🙈",
            ts: Date.now(),
          };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Oops, I got a bit lost there! Try again? 🙈",
          ts: Date.now(),
        };
        return copy;
      });
      setShowEscalation(true);
    } finally {
      clearTimeout(timeout);
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  const reducedMotion = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const panelWidth = isMobile ? "100vw" : (typeof window !== "undefined" && window.innerWidth < 1024 ? 320 : 360);
  return (
    <div
      role="dialog"
      aria-label="Chat with Zuki"
      className="fixed z-[9999] flex flex-col overflow-hidden"
      style={{
        bottom: isMobile ? 0 : 88,
        right: isMobile ? 0 : 24,
        width: panelWidth,
        height: isMobile ? "100dvh" : 520,
        background: "#0D0C0A",
        border: "1px solid rgba(201,168,76,0.3)",
        borderRadius: isMobile ? 0 : "16px 16px 0 16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.1)",
        animation: reducedMotion ? undefined : "zuki-pop 350ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        transformOrigin: "bottom right",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4"
        style={{
          height: 60,
          background: "#141210",
          borderBottom: "1px solid rgba(201,168,76,0.15)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 36, height: 36,
              background: "#1A1408",
              border: "1.5px solid #C9A84C",
              color: "#C9A84C",
              fontFamily: "Georgia, serif",
              fontSize: 16,
            }}
          >Z</div>
          <div className="flex flex-col leading-tight">
            <span style={{ color: "#F5F0E8", fontSize: 14, fontWeight: 500 }}>Zuki</span>
            <span className="flex items-center gap-1" style={{ color: "#8B6914", fontSize: 11 }}>
              <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: "#22c55e" }} />
              Online — here to help!
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isMobile && (
            <button onClick={onMinimize} aria-label="Minimize" className="transition-colors"
              style={{ color: "#8B6914" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F5F0E8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8B6914")}
            >
              <Minus size={18} />
            </button>
          )}
          <button onClick={onClose} aria-label={isMobile ? "Back" : "Close"} className="transition-colors"
            style={{ color: "#8B6914" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8B6914")}
          >
            {isMobile ? <ArrowLeft size={20} /> : <X size={18} />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto zuki-scroll"
        style={{ padding: "16px 14px", background: "#0D0C0A" }}
      >
        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <MessageBubble key={i} msg={m} reduceMotion={reducedMotion} />
          ))}
          {isStreaming && messages[messages.length - 1]?.content === "" && (
            <TypingDots />
          )}
          {showEscalation && <WhatsAppCard />}
        </div>
      </div>

      {/* Quick replies */}
      {!isStreaming && (
        <div
          className="relative"
          style={{ background: "#141210", borderTop: "1px solid rgba(201,168,76,0.08)" }}
        >
          <div
            className="zuki-quick-replies flex gap-2 overflow-x-auto px-3 pt-2 pb-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollBehavior: "smooth" }}
          >
            {quickReplies.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="shrink-0 transition-colors"
                style={{
                  background: "rgba(201,168,76,0.08)",
                  border: "1px solid rgba(201,168,76,0.25)",
                  borderRadius: 20,
                  padding: "6px 14px",
                  color: "#C9A84C",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.16)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.08)")}
              >
                {q}
              </button>
            ))}
          </div>
          <div
            aria-hidden
            style={{
              position: "absolute", right: 0, top: 0, bottom: 0, width: 32,
              background: "linear-gradient(to right, transparent, #141210)",
              pointerEvents: "none",
            }}
          />
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
        className="flex items-center gap-2"
        style={{
          height: 70,
          padding: "12px 14px",
          background: "#141210",
          borderTop: "1px solid rgba(201,168,76,0.15)",
        }}
      >
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Zuki anything... ✨"
            disabled={isStreaming}
            className="w-full focus:outline-none transition-colors"
            style={{
              background: "#1A1408",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: 24,
              padding: "10px 44px 10px 16px",
              color: "#F5F0E8",
              fontSize: 13,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#C9A84C")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)")}
          />
          {input.trim() && (
            <button
              type="submit"
              aria-label="Send"
              disabled={isStreaming}
              className="absolute flex items-center justify-center rounded-full transition-transform"
              style={{
                right: 4, top: "50%", transform: "translateY(-50%)",
                width: 32, height: 32, background: "#C9A84C", color: "#0D0C0A",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1)")}
            >
              <Send size={14} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

const URL_REGEX = /(https?:\/\/[^\s]+|bazukiperfumes\.com\/[^\s*]+|bazukifragrance\.com\/[^\s*]+)/gi;
const QUIZ_CTA_PHRASES = [
  "take the quiz",
  "jump to the quiz",
  "go to the quiz",
  "start the quiz",
  "bazukiperfumes.com/quiz",
];

function parseMessageContent(text: string) {
  const cleaned = text.replace(/\*\*/g, "");
  const parts = cleaned.split(URL_REGEX);
  return parts.map((part, i) => {
    if (!part) return null;
    if (URL_REGEX.test(part)) {
      URL_REGEX.lastIndex = 0;
      const href = part.startsWith("http") ? part : `https://${part}`;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="zuki-link"
        >
          {part}
        </a>
      );
    }
    URL_REGEX.lastIndex = 0;
    return <span key={i}>{part}</span>;
  });
}

const QuizLinkButton = () => (
  <a
    href="https://bazukiperfumes.com/quiz"
    target="_blank"
    rel="noopener noreferrer"
    className="zuki-quiz-btn"
  >
    ✦ Take the Quiz →
  </a>
);

const MessageBubble = ({ msg, reduceMotion }: { msg: Msg; reduceMotion: boolean }) => {
  const isUser = msg.role === "user";
  const lower = msg.content.toLowerCase();
  const showQuizCta = !isUser && QUIZ_CTA_PHRASES.some((p) => lower.includes(p));
  return (
    <div
      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
      style={{
        animation: reduceMotion ? undefined : "zuki-msg-in 200ms ease-out",
      }}
    >
      <div
        className="zuki-bubble"
        style={{
          maxWidth: "80%",
          padding: "10px 14px",
          fontSize: 13,
          lineHeight: 1.6,
          color: "#F5F0E8",
          whiteSpace: "pre-wrap",
          background: isUser ? "rgba(201,168,76,0.15)" : "#1A1408",
          border: isUser
            ? "1px solid rgba(201,168,76,0.3)"
            : "1px solid rgba(201,168,76,0.15)",
          borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
        }}
      >
        {msg.content ? parseMessageContent(msg.content) : <span style={{ opacity: 0.5 }}>…</span>}
      </div>
      {showQuizCta && <QuizLinkButton />}
    </div>
  );
};

const TypingDots = () => (
  <div className="flex justify-start">
    <div
      style={{
        padding: "12px 16px",
        background: "#1A1408",
        border: "1px solid rgba(201,168,76,0.15)",
        borderRadius: "4px 16px 16px 16px",
        display: "flex",
        gap: 4,
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#C9A84C",
            animation: `zuki-bounce 1.2s ${i * 0.15}s infinite ease-in-out`,
            display: "inline-block",
          }}
        />
      ))}
    </div>
  </div>
);

const WhatsAppCard = () => (
  <div
    style={{
      background: "rgba(37,211,102,0.08)",
      border: "1px solid rgba(37,211,102,0.3)",
      borderRadius: 12,
      padding: "14px 16px",
    }}
    className="flex flex-col gap-2"
  >
    <div className="flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
        <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
      </svg>
      <div className="flex flex-col">
        <span style={{ fontSize: 14, fontWeight: 500, color: "#F5F0E8" }}>Chat with our team</span>
        <span style={{ fontSize: 11, color: "#8B6914" }}>Usually replies in under 30 minutes</span>
      </div>
    </div>
    <a
      href={WHATSAPP_LINK}
      target="_blank" rel="noopener noreferrer"
      className="text-center transition-opacity hover:opacity-90"
      style={{
        background: "#25D366",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        textDecoration: "none",
      }}
    >
      Open WhatsApp →
    </a>
  </div>
);

const LazyPanel = ZukiPanel; // already a normal component; "lazy" requirement just means we don't mount it until open

const NOTIF_DISMISSED_KEY = "bazuki_zuki_notif_dismissed";

export default function ZukiChat() {
  const [open, setOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifIdx, setNotifIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Notification bubble: show after 15s, hide after 8s more, once per session
  useEffect(() => {
    if (open) { setShowNotif(false); return; }
    let dismissed = false;
    try { dismissed = sessionStorage.getItem(NOTIF_DISMISSED_KEY) === "1"; } catch { /* ignore */ }
    if (dismissed) return;

    const showTimer = setTimeout(() => setShowNotif(true), 15000);
    const hideTimer = setTimeout(() => {
      setShowNotif(false);
      try { sessionStorage.setItem(NOTIF_DISMISSED_KEY, "1"); } catch { /* ignore */ }
    }, 23000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [open]);

  // Rotate notification messages every 4s
  useEffect(() => {
    if (!showNotif) return;
    const t = setInterval(() => setNotifIdx((i) => (i + 1) % NOTIF_MESSAGES.length), 4000);
    return () => clearInterval(t);
  }, [showNotif]);

  const dismissNotif = () => {
    setShowNotif(false);
    try { sessionStorage.setItem(NOTIF_DISMISSED_KEY, "1"); } catch { /* ignore */ }
  };

  const size = isMobile ? 52 : 56;

  return (
    <>
      <style>{`
        @keyframes zuki-breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 20px rgba(201,168,76,0.4); }
          50% { transform: scale(1.06); box-shadow: 0 6px 28px rgba(201,168,76,0.6); }
        }
        @keyframes zuki-pop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes zuki-msg-in {
          0% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes zuki-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes zuki-notif-in {
          0% { transform: translateX(20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes zuki-fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .zuki-scroll::-webkit-scrollbar { width: 3px; }
        .zuki-scroll::-webkit-scrollbar-track { background: transparent; }
        .zuki-scroll::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.4); border-radius: 2px; }
        .zuki-quick-replies::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .zuki-btn, .zuki-notif { animation: none !important; }
        }
      `}</style>

      {/* Mobile backdrop */}
      {open && isMobile && (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0"
          style={{
            background: "rgba(13,12,10,0.85)",
            zIndex: 9998,
            animation: "zuki-fade-in 200ms ease-out",
          }}
        />
      )}

      {open && (
        <Suspense fallback={null}>
          <LazyPanel
            isMobile={isMobile}
            onClose={() => setOpen(false)}
            onMinimize={() => setOpen(false)}
          />
        </Suspense>
      )}

      {/* Notification bubble */}
      {!open && showNotif && (
        <div
          className="zuki-notif fixed z-[9998]"
          style={{
            bottom: 24 + size + 12,
            right: 24,
            background: "#1A1408",
            border: "1px solid #C9A84C",
            borderRadius: "12px 12px 0 12px",
            padding: "8px 14px",
            color: "#F5F0E8",
            fontSize: 12,
            maxWidth: 220,
            animation: "zuki-notif-in 300ms ease-out",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            cursor: "pointer",
          }}
          onClick={() => { dismissNotif(); setOpen(true); }}
        >
          {NOTIF_MESSAGES[notifIdx]}
        </div>
      )}

      {/* Floating button */}
      <button
        aria-label={open ? "Close chat" : "Chat with Zuki"}
        title="Chat with Zuki ✦"
        onClick={() => setOpen((o) => !o)}
        className="zuki-btn fixed flex items-center justify-center"
        style={{
          bottom: 24,
          right: 24,
          width: size,
          height: size,
          borderRadius: "50%",
          background: open ? "#1A1408" : "#C9A84C",
          color: open ? "#C9A84C" : "#0D0C0A",
          zIndex: 9999,
          border: open ? "1.5px solid #C9A84C" : "none",
          cursor: "pointer",
          boxShadow: open
            ? "0 4px 20px rgba(0,0,0,0.5)"
            : "0 4px 20px rgba(201,168,76,0.4)",
          animation: open ? undefined : "zuki-breathe 2.5s ease-in-out infinite",
          transition: "transform 200ms ease, background 200ms ease, color 200ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? <X size={24} /> : <Sparkles size={24} />}
      </button>
    </>
  );
}
