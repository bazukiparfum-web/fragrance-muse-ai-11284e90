import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FragranceVisualizer } from "@/components/FragranceVisualizer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Star, Crown, Users, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PublicScent {
  id: string;
  name: string;
  formulation_notes: string | null;
  match_score: number | null;
  intensity: number | null;
  longevity: number | null;
  visual_data: any;
  fragrance_code: string | null;
  creator_tag: string | null;
  created_at: string | null;
}

function getWeeklyIndex(length: number): number {
  if (length === 0) return 0;
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return Math.floor(Date.now() / weekMs) % length;
}

function ScentCard({ scent, onClick }: { scent: PublicScent; onClick: () => void }) {
  return (
    <Card
      className="overflow-hidden hover-lift cursor-pointer transition-all duration-300 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-center justify-center mb-3">
          {scent.visual_data && (
            <FragranceVisualizer visualData={scent.visual_data} size="small" />
          )}
        </div>
        <h3 className="font-serif text-lg font-bold text-center">{scent.name}</h3>
        {scent.formulation_notes && (
          <p className="text-xs text-muted-foreground text-center mt-1 line-clamp-2 italic">
            {scent.formulation_notes}
          </p>
        )}
        <div className="flex justify-center gap-2 mt-3">
          {scent.match_score && (
            <Badge variant="secondary" className="text-xs">{scent.match_score}% Match</Badge>
          )}
          {scent.creator_tag && (
            <Badge variant="outline" className="text-xs capitalize">{scent.creator_tag}</Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

const ProductShowcase = () => {
  const [scents, setScents] = useState<PublicScent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("saved_scents")
          .select("id, name, formulation_notes, match_score, intensity, longevity, visual_data, fragrance_code, creator_tag, created_at")
          .eq("is_public", true)
          .order("match_score", { ascending: false });

        if (error) throw error;
        setScents((data || []) as PublicScent[]);
      } catch (err) {
        console.error("Failed to load showcase:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-secondary">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (scents.length === 0) return null;

  const featuredScent = scents[getWeeklyIndex(scents.length)];
  const trendingPicks = scents.filter(s => s.creator_tag === 'influencer' || s.creator_tag === 'celebrity').slice(0, 4);
  const communityFavs = scents.filter(s => !s.creator_tag).slice(0, 4);

  return (
    <section className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Signature Collection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each fragrance tells a story. Discover yours.
          </p>
        </div>

        {/* Fragrance of the Week */}
        {featuredScent && (
          <div className="mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-2xl font-bold">Fragrance of the Week</h3>
            </div>
            <Card
              className="max-w-2xl mx-auto overflow-hidden hover-lift cursor-pointer transition-all duration-300 hover:shadow-xl"
              onClick={() => navigate(`/collection/${featuredScent.id}`)}
            >
              <div className="flex flex-col md:flex-row items-center p-8 gap-8">
                <div className="flex-shrink-0">
                  {featuredScent.visual_data && (
                    <FragranceVisualizer visualData={featuredScent.visual_data} size="large" />
                  )}
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-serif text-3xl font-bold mb-2">{featuredScent.name}</h3>
                  {featuredScent.formulation_notes && (
                    <p className="text-muted-foreground italic mb-4">{featuredScent.formulation_notes}</p>
                  )}
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {featuredScent.match_score && (
                      <Badge variant="secondary">{featuredScent.match_score}% Match</Badge>
                    )}
                    {featuredScent.fragrance_code && (
                      <Badge variant="outline">{featuredScent.fragrance_code}</Badge>
                    )}
                    {featuredScent.creator_tag && (
                      <Badge className="capitalize">{featuredScent.creator_tag}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Trending Picks (Influencer + Celebrity) */}
        {trendingPicks.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-2xl font-bold">Trending Picks</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trendingPicks.map(scent => (
                <ScentCard
                  key={scent.id}
                  scent={scent}
                  onClick={() => navigate(`/collection/${scent.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Community Favorites */}
        {communityFavs.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Users className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-2xl font-bold">Community Favorites</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {communityFavs.map(scent => (
                <ScentCard
                  key={scent.id}
                  scent={scent}
                  onClick={() => navigate(`/collection/${scent.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Button size="lg" onClick={() => navigate("/collection")}>
            View Full Collection
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
