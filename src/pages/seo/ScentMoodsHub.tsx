import SeoIndexHub from "./SeoIndexHub";
import { MOOD_PAGES } from "@/data/moodPages";
import { SENSE_JOURNEYS } from "@/data/senseJourneys";

const ScentMoodsHub = () => (
  <SeoIndexHub
    path="/scent"
    idPrefix="scent-hub"
    breadcrumbName="Scent Directions"
    title="Fragrance Moods & Scent Directions | Bazuki Perfumes India"
    description="Twelve scent directions — monsoon rain, oud, vetiver, sea salt, vanilla and more. Find the mood you want to wear and have it composed to order in India."
    eyebrow="Moods"
    h1="Scent Directions by Mood"
    intro="Fragrance is easier to choose by feeling than by note list. Pick the mood you want to wear and we'll compose a formula around it."
    items={MOOD_PAGES.map((m) => {
      const journey = SENSE_JOURNEYS.find((j) => j.slug === m.slug);
      return {
        to: `/scent/${m.slug}`,
        title: journey?.title ?? m.slug,
        blurb: journey?.blurb ?? m.keyword,
        image: journey?.image,
      };
    })}
  />
);

export default ScentMoodsHub;
