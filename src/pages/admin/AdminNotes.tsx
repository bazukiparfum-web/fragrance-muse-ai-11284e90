import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload } from 'lucide-react';

const AdminNotes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      setIsAdmin(false);
      return;
    }

    setIsAdmin(true);
    loadNotes();
  };

  const loadNotes = async () => {
    const { data, error } = await supabase
      .from('fragrance_notes')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: 'Error loading notes',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    setNotes(data || []);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const notesData = JSON.parse(content);

        const { data, error } = await supabase.functions.invoke('admin-upload-notes', {
          body: { notes: notesData }
        });

        if (error) throw error;

        toast({
          title: 'Upload successful',
          description: `Inserted: ${data.inserted}, Updated: ${data.updated}, Failed: ${data.failed}`
        });

        loadNotes();
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-4xl font-bold mb-4">Access Denied</h1>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/admin')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="font-serif text-4xl font-bold heading-luxury">Fragrance Notes</h1>
            </div>
            <div>
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button disabled={loading} asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {loading ? 'Uploading...' : 'Upload JSON'}
                  </span>
                </Button>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <Card className="p-6 mb-6 bg-accent/5">
            <h3 className="font-semibold mb-2">JSON Format Example</h3>
            <pre className="text-xs bg-background p-4 rounded overflow-x-auto">
{`[
  {
    "name": "Rose Absolute",
    "category": "heart",
    "family": "floral",
    "intensity": 8,
    "longevity": 7,
    "personality_matches": ["Elegant", "Calm"],
    "occasions": ["Evening", "Office"],
    "climates": ["Moderate", "Cool"],
    "age_ranges": ["26-35", "36-45"],
    "description": "Classic floral note"
  }
]`}
            </pre>
          </Card>

          <Card className="p-6">
            <h2 className="font-serif text-2xl font-bold mb-4">
              Active Notes ({notes.length})
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notes.map((note) => (
                <div key={note.id} className="flex justify-between items-center p-3 bg-secondary/20 rounded">
                  <div className="flex-1">
                    <p className="font-semibold">{note.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {note.category} • {note.family} • Intensity: {note.intensity}/10
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AdminNotes;
