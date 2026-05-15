import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CreationCard } from './CreationCard';
import { SavedScentCard } from './SavedScentCard';
import { QuizResultsPanel } from './QuizResultsPanel';
import { ReorderModal } from './ReorderModal';
import { TweakSlidersDrawer } from './TweakSlidersDrawer';

const BOOKMARK_KEY = 'bazuki:bookmarks';

interface Props {
  savedScents: any[];
  lastQuiz: any | null;
  onScentCreated?: (scent: any) => void;
}

export function MyScentsTabs({ savedScents, lastQuiz, onScentCreated }: Props) {
  const navigate = useNavigate();
  const [reorderScent, setReorderScent] = useState<any | null>(null);
  const [tweakScent, setTweakScent] = useState<any | null>(null);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [bookmarkedScents, setBookmarkedScents] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BOOKMARK_KEY);
      if (raw) setBookmarkIds(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  // Fetch bookmarked scents
  useEffect(() => {
    if (bookmarkIds.length === 0) {
      setBookmarkedScents([]);
      return;
    }
    supabase
      .from('saved_scents')
      .select('*')
      .in('id', bookmarkIds)
      .eq('is_public', true)
      .then(({ data }) => setBookmarkedScents(data || []));
  }, [bookmarkIds]);

  // Quiz recommendations: scents created at-or-after last quiz response
  useEffect(() => {
    if (!lastQuiz) {
      setRecommendations([]);
      return;
    }
    const recs = [...savedScents]
      .filter((s) => new Date(s.created_at).getTime() >= new Date(lastQuiz.created_at).getTime() - 60_000)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(0, 3);
    setRecommendations(recs.length ? recs : savedScents.slice(0, 3));
  }, [lastQuiz, savedScents]);

  const removeBookmark = (scent: any) => {
    const next = bookmarkIds.filter((id) => id !== scent.id);
    setBookmarkIds(next);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
  };

  return (
    <>
      <Tabs defaultValue="creations" className="space-y-6">
        <TabsList className="bg-card/60 border border-border">
          <TabsTrigger value="creations" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
            My Creations
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
            Saved Scents
          </TabsTrigger>
          <TabsTrigger value="quiz" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
            My Quiz Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="creations">
          {savedScents.length === 0 ? (
            <Card className="bg-card/60 border-border p-10 text-center">
              <h3 className="font-serif text-2xl text-foreground mb-2">No creations yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Take the quiz and Bazuki AI will craft your first signature.
              </p>
              <Button onClick={() => navigate('/shop/quiz')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Create your first fragrance
              </Button>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedScents.map((s) => (
                <CreationCard
                  key={s.id}
                  scent={s}
                  onReorder={setReorderScent}
                  onTweak={setTweakScent}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved">
          {bookmarkedScents.length === 0 ? (
            <Card className="bg-card/60 border-border p-10 text-center">
              <Heart className="h-10 w-10 text-primary/60 mx-auto mb-4" />
              <h3 className="font-serif text-2xl text-foreground mb-2">No saved scents yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Bookmark fragrances from the library to keep them here.
              </p>
              <Button onClick={() => navigate('/collection')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Browse the Scent Library
              </Button>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarkedScents.map((s) => (
                <SavedScentCard
                  key={s.id}
                  scent={s}
                  onView={(scent) => navigate(`/shop/account/scents/${scent.id}`)}
                  onRemove={removeBookmark}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quiz">
          <QuizResultsPanel
            lastQuiz={lastQuiz}
            recommendations={recommendations}
            onReorder={setReorderScent}
          />
        </TabsContent>
      </Tabs>

      <ReorderModal
        open={!!reorderScent}
        onOpenChange={(o) => !o && setReorderScent(null)}
        scent={reorderScent}
      />
      <TweakSlidersDrawer
        open={!!tweakScent}
        onOpenChange={(o) => !o && setTweakScent(null)}
        scent={tweakScent}
        onSaved={onScentCreated}
      />
    </>
  );
}
