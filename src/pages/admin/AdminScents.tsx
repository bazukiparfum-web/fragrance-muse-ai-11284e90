import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScentRow {
  id: string;
  name: string;
  creator_tag: string | null;
  user_id: string;
  created_at: string | null;
  fragrance_code: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

export default function AdminScents() {
  const [scents, setScents] = useState<ScentRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchScents();
  }, []);

  const fetchScents = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-scents', {
        body: { operation: 'list' }
      });
      if (error) throw error;

      setScents((data.scents || []) as ScentRow[]);
      setProfiles(data.profiles || {});
    } catch (err) {
      console.error('Error fetching scents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTag = async (scentId: string, tag: string) => {
    const newTag = tag === 'community' ? null : tag;
    const { error } = await supabase.functions.invoke('admin-manage-scents', {
      body: { operation: 'update_tag', scent: { id: scentId, creator_tag: newTag } }
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to update tag', variant: 'destructive' });
      return;
    }

    setScents((prev) => prev.map((s) => s.id === scentId ? { ...s, creator_tag: newTag } : s));
    toast({ title: 'Updated', description: `Tag set to ${tag}` });
  };

  const getCreatorName = (userId: string) => {
    const p = profiles[userId];
    if (p?.full_name) return p.full_name;
    if (p?.email) return p.email.split('@')[0];
    return 'Anonymous';
  };

  const filtered = scents.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const tagBadge = (tag: string | null) => {
    if (tag === 'influencer') return <Badge className="bg-accent text-accent-foreground">Influencer</Badge>;
    if (tag === 'celebrity') return <Badge variant="secondary">Celebrity</Badge>;
    return <Badge variant="outline">Community</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Tag className="h-8 w-8 text-accent" />
            <h1 className="font-serif text-4xl font-bold heading-luxury">Scent Tag Manager</h1>
          </div>

          <Card className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scents by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">No public scents found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Current Tag</TableHead>
                    <TableHead>Set Tag</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((scent) => (
                    <TableRow key={scent.id}>
                      <TableCell className="font-medium">{scent.name}</TableCell>
                      <TableCell className="text-muted-foreground">{scent.fragrance_code || '—'}</TableCell>
                      <TableCell>{getCreatorName(scent.user_id)}</TableCell>
                      <TableCell>{tagBadge(scent.creator_tag)}</TableCell>
                      <TableCell>
                        <Select
                          value={scent.creator_tag || 'community'}
                          onValueChange={(val) => updateTag(scent.id, val)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="community">Community</SelectItem>
                            <SelectItem value="influencer">Influencer</SelectItem>
                            <SelectItem value="celebrity">Celebrity</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
