import { useParams, Link } from "react-router-dom";
import SeoLandingPage, { type SeoLandingSection } from "./SeoLandingPage";
import NotFound from "@/pages/NotFound";
import { SCENT_CATEGORIES, getScentCategory } from "@/data/scentCategories";
import { SENSE_JOURNEYS } from "@/data/senseJourneys";

const ScentCategoryPage = () => {
  const { family } = useParams<{ family: string }>();
  const category = getScentCategory(family);

  if (!category) return <NotFound />;

  const moods = category.moodSlugs
    .map((slug) => SENSE_JOURNEYS.find((j) => j.slug === slug))
    .filter(Boolean);

  const related = category.related
    .map((slug) => SCENT_CATEGORIES.find((c) => c.slug === slug))
    .filter(Boolean);

  const sections: SeoLandingSection[] = [
    {
      heading: `Who ${category.label.toLowerCase()} perfumes suit`,
      body: (
        <ul className="list-disc pl-5 space-y-2">
          {category.suits.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ),
    },
    {
      heading: "Typical notes in this family",
      body: (
        <div className="grid sm:grid-cols-3 gap-6">
          {(
            [
              ["Top", category.notes.top],
              ["Heart", category.notes.heart],
              ["Base", category.notes.base],
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
    ...category.sections.map((s) => ({
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
      heading: `Explore ${category.label.toLowerCase()} scent directions`,
      body: (
        <>
          <ul className="space-y-2">
            {moods.map((m) => (
              <li key={m!.slug}>
                <Link
                  to={`/scent/${m!.slug}`}
                  className="text-luxury-gold underline-offset-4 hover:underline"
                >
                  {m!.title}
                </Link>{" "}
                — {m!.blurb}
              </li>
            ))}
          </ul>
          <p>
            <Link
              to={`/collection?mood=${category.mood}`}
              className="text-luxury-gold underline-offset-4 hover:underline"
            >
              Browse {category.label.toLowerCase()} fragrances in the collection →
            </Link>
          </p>
          <p className="text-sm">
            Related families:{" "}
            {related.map((r, i) => (
              <span key={r!.slug}>
                {i > 0 && " · "}
                <Link
                  to={`/perfume/${r!.slug}`}
                  className="text-luxury-gold underline-offset-4 hover:underline"
                >
                  {r!.label}
                </Link>
              </span>
            ))}
          </p>
        </>
      ),
    },
  ];

  return (
    <SeoLandingPage
      path={`/perfume/${category.slug}`}
      idPrefix={`perfume-${category.slug}`}
      breadcrumbName={`${category.label} Perfumes`}
      title={category.title}
      description={category.description}
      eyebrow={category.eyebrow}
      h1={category.h1}
      intro={category.intro}
      sections={sections}
      faqs={category.faqs}
    />
  );
};

export default ScentCategoryPage;
