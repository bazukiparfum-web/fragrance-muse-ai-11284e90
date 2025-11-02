import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const AdminNotes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [activeOnly, setActiveOnly] = useState(true);
  
  // Sorting State
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // UI State
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

  // Filtering & Sorting Logic
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'top': return 'default';
      case 'heart': return 'secondary';
      case 'base': return 'outline';
      default: return 'outline';
    }
  };

  const filteredAndSortedNotes = notes
    .filter(note => {
      const matchesSearch = note.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || note.category === categoryFilter;
      const matchesFamily = familyFilter === 'all' || note.family === familyFilter;
      const matchesActive = !activeOnly || note.is_active;
      return matchesSearch && matchesCategory && matchesFamily && matchesActive;
    })
    .sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal === bVal) return 0;
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const totalPages = Math.ceil(filteredAndSortedNotes.length / itemsPerPage);
  const paginatedNotes = filteredAndSortedNotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueCategories = Array.from(new Set(notes.map(n => n.category)));
  const uniqueFamilies = Array.from(new Set(notes.map(n => n.family)));

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

          {/* Filters & Search */}
          <Card className="p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={familyFilter} onValueChange={setFamilyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Families</SelectItem>
                  {uniqueFamilies.map(fam => (
                    <SelectItem key={fam} value={fam}>{fam}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="active-only" 
                  checked={activeOnly}
                  onCheckedChange={(checked) => setActiveOnly(checked as boolean)}
                />
                <label htmlFor="active-only" className="text-sm font-medium cursor-pointer">
                  Active Only
                </label>
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card className="p-6">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="font-serif text-2xl font-bold">
                Fragrance Notes ({filteredAndSortedNotes.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Showing {paginatedNotes.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                {Math.min(currentPage * itemsPerPage, filteredAndSortedNotes.length)} of {filteredAndSortedNotes.length}
              </p>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-2">
                        Name
                        {sortColumn === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>
                      <div className="flex items-center gap-2">
                        Category
                        {sortColumn === 'category' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Family</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('intensity')}>
                      <div className="flex items-center gap-2">
                        Intensity
                        {sortColumn === 'intensity' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('longevity')}>
                      <div className="flex items-center gap-2">
                        Longevity
                        {sortColumn === 'longevity' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Personality</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedNotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No notes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedNotes.map((note) => (
                      <>
                        <TableRow 
                          key={note.id}
                          className="cursor-pointer"
                          onClick={() => setExpandedRow(expandedRow === note.id ? null : note.id)}
                        >
                          <TableCell className="font-medium">{note.name}</TableCell>
                          <TableCell>
                            <Badge variant={getCategoryColor(note.category)}>
                              {note.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">{note.family}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={note.intensity * 10} className="w-16 h-2" />
                              <span className="text-xs text-muted-foreground min-w-[2rem]">{note.intensity}/10</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={note.longevity * 10} className="w-16 h-2" />
                              <span className="text-xs text-muted-foreground min-w-[2rem]">{note.longevity}/10</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {note.personality_matches?.slice(0, 2).map((p: string) => (
                                <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                              ))}
                              {note.personality_matches?.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{note.personality_matches.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={note.is_active ? 'default' : 'secondary'}>
                              {note.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedRow(expandedRow === note.id ? null : note.id);
                              }}
                            >
                              {expandedRow === note.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                        
                        {expandedRow === note.id && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/50 p-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Description</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {note.description || 'No description available'}
                                  </p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Occasions</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {note.occasions?.map((o: string) => (
                                        <Badge key={o} variant="outline">{o}</Badge>
                                      )) || <span className="text-sm text-muted-foreground">None specified</span>}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold mb-2">Climates</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {note.climates?.map((c: string) => (
                                        <Badge key={c} variant="outline">{c}</Badge>
                                      )) || <span className="text-sm text-muted-foreground">None specified</span>}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold mb-2">Age Ranges</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {note.age_ranges?.map((a: string) => (
                                        <Badge key={a} variant="outline">{a}</Badge>
                                      )) || <span className="text-sm text-muted-foreground">None specified</span>}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold mb-2">All Personalities</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {note.personality_matches?.map((p: string) => (
                                        <Badge key={p} variant="outline">{p}</Badge>
                                      )) || <span className="text-sm text-muted-foreground">None specified</span>}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-xs text-muted-foreground pt-2 border-t">
                                  Created: {new Date(note.created_at).toLocaleString()} • 
                                  Updated: {new Date(note.updated_at).toLocaleString()}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AdminNotes;
