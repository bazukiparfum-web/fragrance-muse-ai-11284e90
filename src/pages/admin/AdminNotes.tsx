import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, ChevronDown, ChevronUp, Search, Download, Copy, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  
  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ noteId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  
  // Bulk operations state
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());

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

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV must have headers and at least one data row');
    
    // Parse CSV considering quoted values with commas
    const parseCSVLine = (line: string) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    const notes = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const note: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        
        switch(header) {
          case 'name':
            note.name = value;
            break;
          case 'category':
            note.category = value.toLowerCase();
            break;
          case 'family':
            note.family = value;
            break;
          case 'intensity':
            note.intensity = parseInt(value) || 5;
            break;
          case 'longevity':
            note.longevity = parseInt(value) || 5;
            break;
          case 'personality_matches':
            note.personality_matches = value ? value.split(',').map(s => s.trim()) : [];
            break;
          case 'occasions':
            note.occasions = value ? value.split(',').map(s => s.trim()) : [];
            break;
          case 'climates':
            note.climates = value ? value.split(',').map(s => s.trim()) : [];
            break;
          case 'age_ranges':
            note.age_ranges = value ? value.split(',').map(s => s.trim()) : [];
            break;
          case 'description':
            note.description = value;
            break;
          case 'status':
          case 'is_active':
            note.is_active = value.toLowerCase() === 'active' || value === 'true';
            break;
        }
      });
      
      note.intensity = note.intensity || 5;
      note.longevity = note.longevity || 5;
      note.personality_matches = note.personality_matches || [];
      note.occasions = note.occasions || [];
      note.climates = note.climates || [];
      note.age_ranges = note.age_ranges || [];
      note.is_active = note.is_active !== false;
      
      notes.push(note);
    }
    
    return notes;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        let notesData;
        
        if (file.name.endsWith('.json')) {
          notesData = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          notesData = parseCSV(content);
        } else {
          throw new Error('Unsupported file format. Please upload JSON or CSV.');
        }

        if (!Array.isArray(notesData)) {
          throw new Error('Invalid file format. Expected an array of notes.');
        }

        // Refresh session to get latest token
        const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
        
        if (sessionError || !session?.access_token) {
          console.error('Session refresh error:', sessionError);
          // Try getting existing session as fallback
          const { data: fallbackData } = await supabase.auth.getSession();
          if (!fallbackData?.session?.access_token) {
            throw new Error('No active session. Please log out and log back in.');
          }
        }

        const validSession = session || (await supabase.auth.getSession()).data.session;
        if (!validSession) {
          throw new Error('Unable to verify session');
        }

        console.log('Invoking function with', notesData.length, 'notes');

        // Call the edge function with explicit headers
        const { data, error } = await supabase.functions.invoke('admin-upload-notes', {
          body: { notes: notesData },
          headers: {
            Authorization: `Bearer ${validSession.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          }
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
        event.target.value = '';
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

  // Export functions
  const exportAsJSON = () => {
    const dataToExport = filteredAndSortedNotes.map(note => ({
      name: note.name,
      category: note.category,
      family: note.family,
      intensity: note.intensity,
      longevity: note.longevity,
      personality_matches: note.personality_matches,
      occasions: note.occasions,
      climates: note.climates,
      age_ranges: note.age_ranges,
      description: note.description,
      is_active: note.is_active
    }));

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fragrance-notes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export successful',
      description: `Exported ${dataToExport.length} notes as JSON`
    });
  };

  const exportAsCSV = () => {
    const headers = [
      'Name', 'Category', 'Family', 'Intensity', 'Longevity',
      'Personality Matches', 'Occasions', 'Climates', 'Age Ranges',
      'Description', 'Status'
    ];

    const rows = filteredAndSortedNotes.map(note => [
      note.name,
      note.category,
      note.family,
      note.intensity,
      note.longevity,
      note.personality_matches?.join('; ') || '',
      note.occasions?.join('; ') || '',
      note.climates?.join('; ') || '',
      note.age_ranges?.join('; ') || '',
      `"${note.description?.replace(/"/g, '""') || ''}"`,
      note.is_active ? 'Active' : 'Inactive'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fragrance-notes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export successful',
      description: `Exported ${rows.length} notes as CSV`
    });
  };

  // Inline editing
  const handleCellEdit = async (noteId: string, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('fragrance_notes')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.map(n => n.id === noteId ? { ...n, [field]: value } : n));

      toast({
        title: 'Updated successfully',
        description: `${field} has been updated`
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setEditingCell(null);
      setEditValue(null);
    }
  };

  // Clone note
  const handleCloneNote = async (note: any) => {
    try {
      const clonedNote = {
        name: `${note.name} (Copy)`,
        category: note.category,
        family: note.family,
        intensity: note.intensity,
        longevity: note.longevity,
        personality_matches: note.personality_matches,
        occasions: note.occasions,
        climates: note.climates,
        age_ranges: note.age_ranges,
        description: note.description,
        is_active: false
      };

      const { data, error } = await supabase
        .from('fragrance_notes')
        .insert([clonedNote])
        .select()
        .single();

      if (error) throw error;

      setNotes([...notes, data]);
      setExpandedRow(data.id);

      toast({
        title: 'Note cloned successfully',
        description: `Created "${data.name}". You can edit it now.`
      });
    } catch (error: any) {
      toast({
        title: 'Clone failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const { error } = await supabase
        .from('fragrance_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.filter(n => n.id !== noteId));
      if (selectedNotes.has(noteId)) {
        const newSelection = new Set(selectedNotes);
        newSelection.delete(noteId);
        setSelectedNotes(newSelection);
      }

      toast({
        title: 'Note deleted',
        description: 'Note has been removed successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedNotes.size === paginatedNotes.length && paginatedNotes.length > 0) {
      setSelectedNotes(new Set());
    } else {
      setSelectedNotes(new Set(paginatedNotes.map(n => n.id)));
    }
  };

  const toggleNoteSelection = (noteId: string) => {
    const newSelection = new Set(selectedNotes);
    if (newSelection.has(noteId)) {
      newSelection.delete(noteId);
    } else {
      newSelection.add(noteId);
    }
    setSelectedNotes(newSelection);
  };

  const handleBulkCategoryChange = async (newCategory: string) => {
    try {
      const noteIds = Array.from(selectedNotes);

      const { error } = await supabase
        .from('fragrance_notes')
        .update({ category: newCategory, updated_at: new Date().toISOString() })
        .in('id', noteIds);

      if (error) throw error;

      setNotes(notes.map(n => selectedNotes.has(n.id) ? { ...n, category: newCategory } : n));

      toast({
        title: 'Bulk update successful',
        description: `Updated ${selectedNotes.size} note(s) to ${newCategory}`
      });

      setSelectedNotes(new Set());
    } catch (error: any) {
      toast({
        title: 'Bulk update failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleBulkFamilyChange = async (newFamily: string) => {
    try {
      const noteIds = Array.from(selectedNotes);

      const { error } = await supabase
        .from('fragrance_notes')
        .update({ family: newFamily, updated_at: new Date().toISOString() })
        .in('id', noteIds);

      if (error) throw error;

      setNotes(notes.map(n => selectedNotes.has(n.id) ? { ...n, family: newFamily } : n));

      toast({
        title: 'Bulk update successful',
        description: `Updated ${selectedNotes.size} note(s) to ${newFamily} family`
      });

      setSelectedNotes(new Set());
    } catch (error: any) {
      toast({
        title: 'Bulk update failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleBulkStatusToggle = async () => {
    try {
      const noteIds = Array.from(selectedNotes);
      const anyActive = notes.some(n => selectedNotes.has(n.id) && n.is_active);
      const newStatus = !anyActive;

      const { error } = await supabase
        .from('fragrance_notes')
        .update({ is_active: newStatus, updated_at: new Date().toISOString() })
        .in('id', noteIds);

      if (error) throw error;

      setNotes(notes.map(n => selectedNotes.has(n.id) ? { ...n, is_active: newStatus } : n));

      toast({
        title: 'Bulk update successful',
        description: `${newStatus ? 'Activated' : 'Deactivated'} ${selectedNotes.size} note(s)`
      });

      setSelectedNotes(new Set());
    } catch (error: any) {
      toast({
        title: 'Bulk update failed',
        description: error.message,
        variant: 'destructive'
      });
    }
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
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportAsJSON}>
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAsCSV}>
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button disabled={loading} asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {loading ? 'Uploading...' : 'Upload JSON/CSV'}
                  </span>
                </Button>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <Card className="p-6 mb-6 bg-accent/5">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full mb-4">
                <h3 className="font-semibold">Upload Format Examples</h3>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Tabs defaultValue="json">
                  <TabsList className="mb-4">
                    <TabsTrigger value="json">JSON Format</TabsTrigger>
                    <TabsTrigger value="csv">CSV Format</TabsTrigger>
                  </TabsList>
                  <TabsContent value="json">
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
    "description": "Classic floral note",
    "is_active": true
  }
]`}
                    </pre>
                  </TabsContent>
                  <TabsContent value="csv">
                    <pre className="text-xs bg-background p-4 rounded overflow-x-auto">
{`Name,Category,Family,Intensity,Longevity,Personality Matches,Occasions,Climates,Age Ranges,Description,Status
Rose Absolute,heart,floral,8,7,Elegant;Calm,Evening;Office,Moderate;Cool,26-35;36-45,Classic floral note,active
Sandalwood,base,woody,9,9,Bold,Evening,Warm,36-45,Warm woody base note,active`}
                    </pre>
                    <p className="text-xs text-muted-foreground mt-2">
                      Note: Use semicolons (;) to separate multiple values in array fields
                    </p>
                  </TabsContent>
                </Tabs>
              </CollapsibleContent>
            </Collapsible>
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

          {/* Bulk Actions Toolbar */}
          {selectedNotes.size > 0 && (
            <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-semibold">
                  {selectedNotes.size} note(s) selected
                </span>

                <Select onValueChange={handleBulkCategoryChange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Change Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="heart">Heart</SelectItem>
                    <SelectItem value="base">Base</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={handleBulkFamilyChange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Change Family" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueFamilies.map(family => (
                      <SelectItem key={family} value={family}>{family}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkStatusToggle}
                >
                  Toggle Active/Inactive
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNotes(new Set())}
                  className="ml-auto"
                >
                  Clear Selection
                </Button>
              </div>
            </Card>
          )}

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
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedNotes.size === paginatedNotes.length && paginatedNotes.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
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
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedNotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No notes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedNotes.map((note) => (
                      <>
                         <TableRow 
                          key={note.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setExpandedRow(expandedRow === note.id ? null : note.id)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedNotes.has(note.id)}
                              onCheckedChange={() => toggleNoteSelection(note.id)}
                            />
                          </TableCell>
                          <TableCell 
                            className="font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCell({ noteId: note.id, field: 'name' });
                              setEditValue(note.name);
                            }}
                          >
                            {editingCell?.noteId === note.id && editingCell?.field === 'name' ? (
                              <Input
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleCellEdit(note.id, 'name', editValue)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCellEdit(note.id, 'name', editValue);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className="h-8"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="hover:bg-accent/50 px-2 py-1 rounded inline-block">
                                {note.name}
                              </span>
                            )}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            {editingCell?.noteId === note.id && editingCell?.field === 'category' ? (
                              <Select 
                                value={editValue} 
                                onValueChange={(value) => handleCellEdit(note.id, 'category', value)}
                              >
                                <SelectTrigger className="h-8 w-[100px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="top">Top</SelectItem>
                                  <SelectItem value="heart">Heart</SelectItem>
                                  <SelectItem value="base">Base</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge 
                                variant={getCategoryColor(note.category)}
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCell({ noteId: note.id, field: 'category' });
                                  setEditValue(note.category);
                                }}
                              >
                                {note.category}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell 
                            className="capitalize"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCell({ noteId: note.id, field: 'family' });
                              setEditValue(note.family);
                            }}
                          >
                            {editingCell?.noteId === note.id && editingCell?.field === 'family' ? (
                              <Input
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleCellEdit(note.id, 'family', editValue)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCellEdit(note.id, 'family', editValue);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className="h-8"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="hover:bg-accent/50 px-2 py-1 rounded inline-block">
                                {note.family}
                              </span>
                            )}
                          </TableCell>
                          <TableCell 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCell({ noteId: note.id, field: 'intensity' });
                              setEditValue(note.intensity);
                            }}
                          >
                            {editingCell?.noteId === note.id && editingCell?.field === 'intensity' ? (
                              <Input
                                autoFocus
                                type="number"
                                min="1"
                                max="10"
                                value={editValue}
                                onChange={(e) => setEditValue(parseInt(e.target.value))}
                                onBlur={() => handleCellEdit(note.id, 'intensity', editValue)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCellEdit(note.id, 'intensity', editValue);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className="h-8 w-20"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <div className="flex items-center gap-2 hover:bg-accent/50 px-2 py-1 rounded">
                                <Progress value={note.intensity * 10} className="w-16 h-2" />
                                <span className="text-xs text-muted-foreground min-w-[2rem]">{note.intensity}/10</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCell({ noteId: note.id, field: 'longevity' });
                              setEditValue(note.longevity);
                            }}
                          >
                            {editingCell?.noteId === note.id && editingCell?.field === 'longevity' ? (
                              <Input
                                autoFocus
                                type="number"
                                min="1"
                                max="10"
                                value={editValue}
                                onChange={(e) => setEditValue(parseInt(e.target.value))}
                                onBlur={() => handleCellEdit(note.id, 'longevity', editValue)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCellEdit(note.id, 'longevity', editValue);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className="h-8 w-20"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <div className="flex items-center gap-2 hover:bg-accent/50 px-2 py-1 rounded">
                                <Progress value={note.longevity * 10} className="w-16 h-2" />
                                <span className="text-xs text-muted-foreground min-w-[2rem]">{note.longevity}/10</span>
                              </div>
                            )}
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
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCloneNote(note)}
                                title="Clone note"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id)}
                                title="Delete note"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedRow(expandedRow === note.id ? null : note.id)}
                                title="Toggle details"
                              >
                                {expandedRow === note.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {expandedRow === note.id && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-muted/50 p-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Description</h4>
                                  {editingCell?.noteId === note.id && editingCell?.field === 'description' ? (
                                    <Textarea
                                      autoFocus
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onBlur={() => handleCellEdit(note.id, 'description', editValue)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Escape') setEditingCell(null);
                                      }}
                                      className="min-h-[100px]"
                                    />
                                  ) : (
                                    <p 
                                      className="text-sm text-muted-foreground cursor-pointer hover:bg-accent/50 p-2 rounded"
                                      onClick={() => {
                                        setEditingCell({ noteId: note.id, field: 'description' });
                                        setEditValue(note.description);
                                      }}
                                    >
                                      {note.description || 'No description available (click to edit)'}
                                    </p>
                                  )}
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
