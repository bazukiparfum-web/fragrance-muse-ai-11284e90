import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Search, Save, X, Beaker } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IngredientMapping {
  id: string;
  note_name: string;
  ingredient_code: string;
  pump_id: string | null;
  ml_per_second: number | null;
  density: number | null;
  is_active: boolean | null;
  stock_level: number | null;
  created_at: string | null;
  updated_at: string | null;
}

const AdminIngredients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [ingredients, setIngredients] = useState<IngredientMapping[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [pumpFilter, setPumpFilter] = useState<string>('all');
  
  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<IngredientMapping>>({});
  
  // Sorting
  const [sortColumn, setSortColumn] = useState<string>('note_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setIsAdmin(true);
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ingredient_mappings')
      .select('*')
      .order('note_name');

    if (error) {
      toast({
        title: 'Error loading ingredients',
        description: error.message,
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }

    setIngredients(data || []);
    setLoading(false);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const startEditing = (ingredient: IngredientMapping) => {
    setEditingId(ingredient.id);
    setEditValues({
      ingredient_code: ingredient.ingredient_code,
      pump_id: ingredient.pump_id,
      ml_per_second: ingredient.ml_per_second,
      density: ingredient.density,
      stock_level: ingredient.stock_level,
      is_active: ingredient.is_active
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEditing = async () => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from('ingredient_mappings')
        .update({
          ingredient_code: editValues.ingredient_code,
          pump_id: editValues.pump_id,
          ml_per_second: editValues.ml_per_second,
          density: editValues.density,
          stock_level: editValues.stock_level,
          is_active: editValues.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId);

      if (error) throw error;

      setIngredients(ingredients.map(ing => 
        ing.id === editingId 
          ? { ...ing, ...editValues, updated_at: new Date().toISOString() }
          : ing
      ));

      toast({
        title: 'Ingredient updated',
        description: 'Changes saved successfully'
      });

      cancelEditing();
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (id: string, currentState: boolean | null) => {
    try {
      const newState = !currentState;
      const { error } = await supabase
        .from('ingredient_mappings')
        .update({ is_active: newState, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setIngredients(ingredients.map(ing => 
        ing.id === id ? { ...ing, is_active: newState } : ing
      ));

      toast({
        title: newState ? 'Ingredient activated' : 'Ingredient deactivated',
        description: `Status updated successfully`
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Get unique pump IDs for filter
  const uniquePumps = Array.from(new Set(ingredients.map(i => i.pump_id).filter(Boolean))) as string[];

  // Filter and sort
  const filteredIngredients = ingredients
    .filter(ing => {
      const matchesSearch = 
        ing.note_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ing.ingredient_code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesActive = !activeOnly || ing.is_active;
      const matchesPump = pumpFilter === 'all' || ing.pump_id === pumpFilter;
      return matchesSearch && matchesActive && matchesPump;
    })
    .sort((a, b) => {
      const aVal = a[sortColumn as keyof IngredientMapping];
      const bVal = b[sortColumn as keyof IngredientMapping];
      if (aVal === bVal) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

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
          <p className="text-muted-foreground mb-6">You need admin access to view this page.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Beaker className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-bold heading-luxury">Ingredient Mappings</h1>
              <p className="text-muted-foreground">
                Configure ingredient codes, pump assignments, and dispensing rates for the filling machine
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by note name or ingredient code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={pumpFilter} onValueChange={setPumpFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by pump" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pumps</SelectItem>
                  {uniquePumps.map(pump => (
                    <SelectItem key={pump} value={pump}>{pump}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Switch
                  checked={activeOnly}
                  onCheckedChange={setActiveOnly}
                  id="active-only"
                />
                <label htmlFor="active-only" className="text-sm">Active only</label>
              </div>

              <Badge variant="secondary">
                {filteredIngredients.length} ingredients
              </Badge>
            </div>
          </Card>

          {/* Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('note_name')}
                    >
                      Note Name {sortColumn === 'note_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('ingredient_code')}
                    >
                      Ingredient Code {sortColumn === 'ingredient_code' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('pump_id')}
                    >
                      Pump ID {sortColumn === 'pump_id' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="text-right">ml/sec</TableHead>
                    <TableHead className="text-right">Density</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading ingredients...
                      </TableCell>
                    </TableRow>
                  ) : filteredIngredients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No ingredients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIngredients.map((ingredient) => (
                      <TableRow key={ingredient.id}>
                        <TableCell className="font-medium">
                          {ingredient.note_name}
                        </TableCell>
                        <TableCell>
                          {editingId === ingredient.id ? (
                            <Input
                              value={editValues.ingredient_code || ''}
                              onChange={(e) => setEditValues({ ...editValues, ingredient_code: e.target.value })}
                              className="w-28"
                            />
                          ) : (
                            <Badge variant="outline" className="font-mono">
                              {ingredient.ingredient_code}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === ingredient.id ? (
                            <Input
                              value={editValues.pump_id || ''}
                              onChange={(e) => setEditValues({ ...editValues, pump_id: e.target.value })}
                              className="w-28"
                            />
                          ) : (
                            <Badge variant="secondary" className="font-mono">
                              {ingredient.pump_id || 'N/A'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === ingredient.id ? (
                            <Input
                              type="number"
                              step="0.1"
                              value={editValues.ml_per_second ?? ''}
                              onChange={(e) => setEditValues({ ...editValues, ml_per_second: parseFloat(e.target.value) || 0 })}
                              className="w-20 text-right"
                            />
                          ) : (
                            ingredient.ml_per_second?.toFixed(1) || '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === ingredient.id ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={editValues.density ?? ''}
                              onChange={(e) => setEditValues({ ...editValues, density: parseFloat(e.target.value) || 0 })}
                              className="w-20 text-right"
                            />
                          ) : (
                            ingredient.density?.toFixed(2) || '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === ingredient.id ? (
                            <Input
                              type="number"
                              value={editValues.stock_level ?? ''}
                              onChange={(e) => setEditValues({ ...editValues, stock_level: parseInt(e.target.value) || 0 })}
                              className="w-20 text-right"
                            />
                          ) : (
                            <span className={ingredient.stock_level !== null && ingredient.stock_level < 20 ? 'text-destructive font-medium' : ''}>
                              {ingredient.stock_level ?? '-'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={ingredient.is_active ?? false}
                            onCheckedChange={() => toggleActive(ingredient.id, ingredient.is_active)}
                            disabled={editingId === ingredient.id}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === ingredient.id ? (
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" onClick={saveEditing}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={cancelEditing}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => startEditing(ingredient)}
                            >
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Legend */}
          <Card className="p-4 mt-6 bg-muted/30">
            <h3 className="font-semibold mb-2">Field Descriptions</h3>
            <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div><strong>Ingredient Code:</strong> Machine-readable code (e.g., ING-001)</div>
              <div><strong>Pump ID:</strong> Physical pump assignment (e.g., PUMP-A1)</div>
              <div><strong>ml/sec:</strong> Dispensing rate in milliliters per second</div>
              <div><strong>Density:</strong> Ingredient density for volume calculations</div>
              <div><strong>Stock:</strong> Current stock level (low stock &lt;20 highlighted)</div>
              <div><strong>Active:</strong> Whether this ingredient is available for production</div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AdminIngredients;
