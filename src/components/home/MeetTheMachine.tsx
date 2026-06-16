import { Link } from "react-router-dom";
import { useInView } from "@/hooks/useInView";
import machineImage from "@/assets/technology-hero.jpg";

const STATS = [
  { number: "52", label: "Ingredients" },
  { number: "±0.01ml", label: "Precision" },
  { number: "1:1", label: "Your Formula" },
];

const MeetTheMachine = () => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  const imageStyle = {
    opacity: inView ? 1 : 0,
    transform: inView ? "translateX(0)" : "translateX(-40px)",
    transition: "opacity 500ms ease-out, transform 500ms ease-out",
    willChange: inView ? undefined : "opacity, transform",
  } as const;

  const contentStyle = {
    opacity: inView ? 1 : 0,
    transform: inView ? "translateX(0)" : "translateX(40px)",
    transition: "opacity 500ms ease-out 100ms, transform 500ms ease-out 100ms",
    willChange: inView ? undefined : "opacity, transform",
  } as const;

  return (
    <section
      aria-labelledby="meet-the-machine-heading"
      className="w-full"
      style={{ backgroundColor: "#0A0805", padding: "80px 0" }}
    >
      <div className="container mx-auto px-6" ref={ref}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* LEFT — Image */}
          <div style={imageStyle} className="w-full">
            <div
              className="md:[transform:perspective(1000px)_rotateY(3deg)]"
              style={{
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 0 60px rgba(201,168,76,0.08)",
              }}
            >
              <img
                src={machineImage}
                alt="Bazuki's AI-powered fragrance filling machine with 52 raw ingredient dispensers"
                loading="lazy"
                className="block w-full h-auto"
              />
            </div>
          </div>

          {/* RIGHT — Content */}
          <div style={contentStyle} className="flex flex-col">
            <div
              className="font-display"
              style={{
                fontSize: "10px",
                color: "#C9A84C",
                letterSpacing: "4px",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              The Bazuki Machine
            </div>

            <h2
              id="meet-the-machine-heading"
              className="font-cormorant"
              style={{
                color: "#F5F0E8",
                fontWeight: 300,
                lineHeight: 1.15,
                fontSize: "clamp(28px, 4vw, 36px)",
                margin: 0,
              }}
            >
              India's First AI Fragrance Filling Machine
            </h2>

            <p
              className="font-body"
              style={{
                fontSize: "15px",
                color: "#C8C0B0",
                lineHeight: 1.8,
                marginTop: "20px",
              }}
            >
              Our proprietary algorithmic machine houses 52 raw fragrance
              ingredients — dispensed in precise concentrations based entirely
              on your quiz answers. No perfumer's intuition. No guesswork.
              Pure algorithmic precision.
            </p>

            <ul
              role="list"
              aria-label="Machine specifications"
              className="flex flex-wrap gap-3 list-none p-0"
              style={{ marginTop: "28px" }}
            >
              {STATS.map((s) => (
                <li
                  key={s.label}
                  className="inline-flex items-baseline gap-2"
                  style={{
                    background: "rgba(201,168,76,0.06)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    borderRadius: "6px",
                    padding: "8px 16px",
                  }}
                >
                  <span
                    className="font-cormorant"
                    style={{ fontSize: "16px", color: "#C9A84C", lineHeight: 1 }}
                  >
                    {s.number}
                  </span>
                  <span
                    className="font-body uppercase"
                    style={{
                      fontSize: "10px",
                      color: "#8B6914",
                      letterSpacing: "0.15em",
                    }}
                  >
                    {s.label}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              to="/guide/ai-perfume-vs-traditional"
              aria-label="Learn how the Bazuki AI filling machine works"
              className="font-body inline-flex items-center gap-1.5 self-start hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--bz-gold))] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0805] rounded-sm"
              style={{
                fontSize: "14px",
                color: "#C9A84C",
                marginTop: "24px",
              }}
            >
              See how it works <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetTheMachine;
