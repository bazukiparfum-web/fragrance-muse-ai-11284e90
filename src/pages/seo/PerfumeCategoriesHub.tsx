import SeoIndexHub from "./SeoIndexHub";
import { SCENT_CATEGORIES } from "@/data/scentCategories";

const PerfumeCategoriesHub = () => (
  <SeoIndexHub
    path="/perfume"
    idPrefix="perfume-hub"
    breadcrumbName="Perfume Categories"
    title="Perfume Scent Families Explained | Woody, Floral, Amber | Bazuki"
    description="Explore every perfume scent family — woody, floral, citrus, amber, fresh, spicy, gourmand and musk — and find which one suits you. AI-composed fragrances made in India."
    eyebrow="Scent Families"
    h1="Perfume Scent Families"
    intro="Eight families, one starting point. Learn how each family smells, who it suits and how it behaves in Indian weather — then have yours composed to order."
    items={SCENT_CATEGORIES.map((c) => ({
      to: `/perfume/${c.slug}`,
      title: `${c.label} Perfumes`,
      blurb: c.intro,
    }))}
  />
);

export default PerfumeCategoriesHub;
