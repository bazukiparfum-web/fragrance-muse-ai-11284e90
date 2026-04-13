import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FragranceVisualizer } from "@/components/FragranceVisualizer";
import { Loader2, Star, Crown, Users } from "lucide-react";
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
  user_id: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

function ScentCard({ scent, creatorName }: { scent: PublicScent; creatorName: string }) {
  const navigate = useNavigate();

  return (
    <Card
      className="overflow-hidden hover-lift cursor-pointer transition-all duration-300 hover:shadow-lg"
      onClick={() => navigate(`/collection/${scent.id}`)}
    >
      <div className="p-6">
        <div className="flex items-center justify-center mb-4">
          {scent.visual_data && (
            <FragranceVisualizer visualData={scent.visual_data} size="medium" />
          )}
        </div>

        <div className="text-center mb-3">
          <h3 className="font-serif text-xl font-bold">{scent.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">by {creatorName}</p>
        </div>

        {scent.formulation_notes && (
          <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2 italic">
            {scent.formulation_notes}
          </p>
        )}

        <div className="flex justify-center gap-3">
          {scent.match_score && (
            <Badge variant="secondary">{scent.match_score}% Match</Badge>
          )}
          {scent.fragrance_code && (
            <Badge variant="outline">{scent.fragrance_code}</Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Icon className="h-6 w-6 text-accent" />
        <h2 className="font-serif text-3xl font-bold">{title}</h2>
      </div>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export default function Collection() {
  const [scents, setScents] = useState<PublicScent[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicScents();
  }, []);

  const fetchPublicScents = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_scents")
        .select("id, name, formulation_notes, match_score, intensity, longevity, visual_data, fragrance_code, creator_tag, created_at, user_id")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const scentData = (data || []) as PublicScent[];
      setScents(scentData);

      // Fetch creator profiles
      const userIds = [...new Set(scentData.map((s) => s.user_id))];
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        const profileMap: Record<string, Profile> = {};
        (profileData || []).forEach((p: Profile) => {
          profileMap[p.id] = p;
        });
        setProfiles(profileMap);
      }
    } catch (err) {
      console.error("Error fetching public scents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCreatorName = (userId: string) => {
    const profile = profiles[userId];
    if (profile?.full_name) return profile.full_name;
    if (profile?.email) return profile.email.split("@")[0];
    return "Anonymous";
  };

  const influencerScents = scents.filter((s) => s.creator_tag === "influencer");
  const celebrityScents = scents.filter((s) => s.creator_tag === "celebrity");
  const communityScents = scents.filter((s) => !s.creator_tag);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading collection…</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Explore the Collection
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover unique fragrances created and published by our community, influencers, and celebrities.
          </p>
        </div>

        {/* Fragrance of the Week */}
        {scents.length > 0 && (() => {
          const weekMs = 7 * 24 * 60 * 60 * 1000;
          const featured = scents[Math.floor(Date.now() / weekMs) % scents.length];
          return (
            <section className="mb-16">
              <SectionHeader icon={Star} title="Fragrance of the Week" subtitle="This week's spotlight pick from the collection" />
              <Card
                className="max-w-2xl mx-auto overflow-hidden hover-lift cursor-pointer transition-all duration-300 hover:shadow-xl"
                onClick={() => navigate(`/collection/${featured.id}`)}
              >
                <div className="flex flex-col md:flex-row items-center p-8 gap-8">
                  <div className="flex-shrink-0">
                    {featured.visual_data && (
                      <FragranceVisualizer visualData={featured.visual_data} size="large" />
                    )}
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="font-serif text-3xl font-bold mb-2">{featured.name}</h3>
                    {featured.formulation_notes && (
                      <p className="text-muted-foreground italic mb-4">{featured.formulation_notes}</p>
                    )}
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {featured.match_score && (
                        <Badge variant="secondary">{featured.match_score}% Match</Badge>
                      )}
                      {featured.fragrance_code && (
                        <Badge variant="outline">{featured.fragrance_code}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          );
        })()}

        {/* Influencer Picks */}
        {influencerScents.length > 0 && (
          <section className="mb-16">
            <SectionHeader
              icon={Star}
              title="Influencer Picks"
              subtitle="Curated fragrances from top creators and tastemakers"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {influencerScents.map((scent) => (
                <ScentCard key={scent.id} scent={scent} creatorName={getCreatorName(scent.user_id)} />
              ))}
            </div>
          </section>
        )}

        {/* Celebrity Scents */}
        {celebrityScents.length > 0 && (
          <section className="mb-16">
            <SectionHeader
              icon={Crown}
              title="Celebrity Scents"
              subtitle="Signature fragrances from renowned personalities"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {celebrityScents.map((scent) => (
                <ScentCard key={scent.id} scent={scent} creatorName={getCreatorName(scent.user_id)} />
              ))}
            </div>
          </section>
        )}

        {/* Community Collection */}
        <section className="mb-16">
          <SectionHeader
            icon={Users}
            title="Community Collection"
            subtitle="Fragrances published by our creative community"
          />
          {communityScents.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {communityScents.map((scent) => (
                <ScentCard key={scent.id} scent={scent} creatorName={getCreatorName(scent.user_id)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No fragrances published yet. Be the first to share yours!</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
