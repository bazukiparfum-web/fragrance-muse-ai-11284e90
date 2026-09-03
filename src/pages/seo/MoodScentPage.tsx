import { useParams, Link } from "react-router-dom";
import SeoLandingPage, { type SeoLandingSection } from "./SeoLandingPage";
import NotFound from "@/pages/NotFound";
import { getMoodPage, MOOD_PAGES } from "@/data/moodPages";
import { SENSE_JOURNEYS } from "@/data/senseJourneys";
import { getScentCategory } from "@/data/scentCategories";

const MoodScentPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const copy = getMoodPage(slug);
  const journey = SENSE_JOURNEYS.find((j) => j.slug === slug);

  if (!copy || !journey) return <NotFound />;

  const category = getScentCategory(copy.category);
  const siblings = MOOD_PAGES.filter(
    (m) => m.category === copy.category && m.slug !== copy.slug,
  );

  const sections: SeoLandingSection[] = [
    {
      heading: "The note sketch",
      body: (
        <div className="grid sm:grid-cols-3 gap-6">
          {(
            [
              ["Top", journey.notes.top],
              ["Heart", journey.notes.heart],
              ["Base", journey.notes.base],
            ] as const
          ).map(([label, list]) => (
            <div key={label}>
              <p className="text-luxury-gold text-[11px] uppercase tracking-[0.25em] mb-2">
                {label}
              </p>
              <ul className="space-y-1 text-base">
                {list.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ),
    },
    {
      heading: "Wear it when",
      body: (
        <ul className="list-disc pl-5 space-y-2">
          {copy.wearWhen.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ),
    },
    ...copy.sections.map((s) => ({
      heading: s.heading,
      body: (
        <>
          {s.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </>
      ),
    })),
    {
      heading: "Where to go next",
      body: (
        <>
          <p>
            <Link
              to={`/collection?journey=${journey.slug}`}
              className="text-luxury-gold underline-offset-4 hover:underline"
            >
              See fragrances matched to {journey.title} →
            </Link>
          </p>
          {category && (
            <p>
              This direction sits in the{" "}
              <Link
                to={`/perfume/${category.slug}`}
                className="text-luxury-gold underline-offset-4 hover:underline"
              >
                {category.label.toLowerCase()} family
              </Link>
              .
            </p>
          )}
          {siblings.length > 0 && (
            <p className="text-sm">
              Similar directions:{" "}
              {siblings.map((s, i) => (
                <span key={s.slug}>
                  {i > 0 && " · "}
                  <Link
                    to={`/scent/${s.slug}`}
                    className="text-luxury-gold underline-offset-4 hover:underline"
                  >
                    {SENSE_JOURNEYS.find((j) => j.slug === s.slug)?.title ?? s.slug}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </>
      ),
    },
  ];

  return (
    <SeoLandingPage
      path={`/scent/${journey.slug}`}
      idPrefix={`scent-${journey.slug}`}
      breadcrumbName={journey.title}
      title={`${journey.title} | ${copy.keyword} | Bazuki`}
      description={copy.metaDescription}
      eyebrow={`Scent Direction · ${journey.title}`}
      h1={copy.h1}
      intro={copy.intro}
      sections={sections}
      faqs={copy.faqs}
      image={journey.image}
    />
  );
};

export default MoodScentPage;
