import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Save, Trash2, Settings, Sliders } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormulationRule {
  id: string;
  rule_name: string;
  rule_type: string;
  description: string;
  conditions: any;
  actions: any;
  priority: number;
  is_active: boolean;
}

interface ScoringWeights {
  personality: number;
  scentFamily: number;
  intensity: number;
  occasion: number;
  climate: number;
  ageRange: number;
}

const AdminRules = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rules, setRules] = useState<FormulationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRule, setEditingRule] = useState<FormulationRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Scoring weights state (these would ideally be stored in DB too)
  const [weights, setWeights] = useState<ScoringWeights>({
    personality: 25,
    scentFamily: 30,
    intensity: 20,
    occasion: 15,
    climate: 10,
    ageRange: 5
  });

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
    loadRules();
  };

  const loadRules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('formulation_rules')
      .select('*')
      .order('priority', { ascending: false });

    if (error) {
      toast({
        title: 'Error loading rules',
        description: error.message,
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }

    setRules(data || []);
    setLoading(false);
  };

  const handleSaveRule = async () => {
    if (!editingRule) return;

    setLoading(true);
    try {
      const operation = editingRule.id.startsWith('new-') ? 'create' : 'update';
      
      const { data, error } = await supabase.functions.invoke('admin-manage-rules', {
        body: {
          operation,
          rule: {
            ...(operation === 'update' && { id: editingRule.id }),
            rule_name: editingRule.rule_name,
            rule_type: editingRule.rule_type,
            description: editingRule.description,
            conditions: editingRule.conditions,
            actions: editingRule.actions,
            priority: editingRule.priority,
            is_active: editingRule.is_active
          }
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Rule ${operation === 'create' ? 'created' : 'updated'} successfully`
      });

      setIsDialogOpen(false);
      setEditingRule(null);
      loadRules();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-manage-rules', {
        body: { operation: 'delete', rule: { id: ruleId } }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Rule deleted successfully'
      });

      loadRules();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (rule: FormulationRule) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-manage-rules', {
        body: {
          operation: 'update',
          rule: {
            id: rule.id,
            is_active: !rule.is_active
          }
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Rule ${!rule.is_active ? 'activated' : 'deactivated'}`
      });

      loadRules();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const openNewRuleDialog = () => {
    setEditingRule({
      id: `new-${Date.now()}`,
      rule_name: '',
      rule_type: 'proportion',
      description: '',
      conditions: {},
      actions: { proportions: { top: 25, heart: 35, base: 40 } },
      priority: 0,
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const openEditRuleDialog = (rule: FormulationRule) => {
    setEditingRule({ ...rule });
    setIsDialogOpen(true);
  };

  const updateRuleField = (field: keyof FormulationRule, value: any) => {
    if (!editingRule) return;
    setEditingRule({ ...editingRule, [field]: value });
  };

  const updateCondition = (key: string, value: any) => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      conditions: { ...editingRule.conditions, [key]: value }
    });
  };

  const updateAction = (key: string, value: any) => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      actions: { ...editingRule.actions, [key]: value }
    });
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/admin')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="font-serif text-4xl font-bold heading-luxury">Recommendation Engine</h1>
            </div>
            <Button onClick={openNewRuleDialog}>
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </div>

          <Tabs defaultValue="rules" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="rules">Formulation Rules</TabsTrigger>
              <TabsTrigger value="weights">Scoring Weights</TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-serif font-bold">Rules Library</h2>
                  <Badge variant="outline">{rules.length} total</Badge>
                </div>
                
                {loading && <p className="text-center py-8 text-muted-foreground">Loading...</p>}
                
                {!loading && rules.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">
                    No rules defined yet. Create your first rule to customize recommendations.
                  </p>
                )}

                {!loading && rules.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Conditions</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.rule_name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{rule.rule_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{rule.priority}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {JSON.stringify(rule.conditions)}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={rule.is_active}
                              onCheckedChange={() => handleToggleActive(rule)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditRuleDialog(rule)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteRule(rule.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="weights" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Sliders className="h-6 w-6 text-accent" />
                  <h2 className="text-2xl font-serif font-bold">Scoring Weights</h2>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  Adjust how much each factor influences the recommendation score. Total should equal 100%.
                </p>

                <div className="space-y-6">
                  {Object.entries(weights).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-base capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <span className="font-bold text-lg text-accent">{value}%</span>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={(vals) => setWeights({ ...weights, [key]: vals[0] })}
                        max={50}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold">Total Weight:</span>
                      <span className={`text-2xl font-bold ${
                        Object.values(weights).reduce((a, b) => a + b, 0) === 100
                          ? 'text-accent'
                          : 'text-destructive'
                      }`}>
                        {Object.values(weights).reduce((a, b) => a + b, 0)}%
                      </span>
                    </div>
                    {Object.values(weights).reduce((a, b) => a + b, 0) !== 100 && (
                      <p className="text-sm text-destructive">
                        Warning: Total weight should equal 100% for optimal results
                      </p>
                    )}
                  </div>

                  <Button className="w-full" disabled>
                    <Save className="h-4 w-4 mr-2" />
                    Save Weights (Coming Soon)
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Weight persistence will be added in a future update
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRule?.id.startsWith('new-') ? 'Create New Rule' : 'Edit Rule'}
            </DialogTitle>
          </DialogHeader>

          {editingRule && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Rule Name *</Label>
                <Input
                  value={editingRule.rule_name}
                  onChange={(e) => updateRuleField('rule_name', e.target.value)}
                  placeholder="e.g., Summer Evening Proportions"
                />
              </div>

              <div className="space-y-2">
                <Label>Rule Type *</Label>
                <Select
                  value={editingRule.rule_type}
                  onValueChange={(val) => updateRuleField('rule_type', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proportion">Proportion Adjustment</SelectItem>
                    <SelectItem value="requirement">Note Requirement</SelectItem>
                    <SelectItem value="exclusion">Note Exclusion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingRule.description}
                  onChange={(e) => updateRuleField('description', e.target.value)}
                  placeholder="Describe when this rule should apply..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority (0-100) *</Label>
                <Input
                  type="number"
                  value={editingRule.priority}
                  onChange={(e) => updateRuleField('priority', parseInt(e.target.value) || 0)}
                  min={0}
                  max={100}
                />
                <p className="text-xs text-muted-foreground">Higher priority rules are applied first</p>
              </div>

              <div className="space-y-2">
                <Label>Conditions (JSON) *</Label>
                <Textarea
                  value={JSON.stringify(editingRule.conditions, null, 2)}
                  onChange={(e) => {
                    try {
                      updateRuleField('conditions', JSON.parse(e.target.value));
                    } catch {}
                  }}
                  placeholder='{"personality": "Adventurous", "climate": "Hot"}'
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Define when this rule applies using quiz answer keys
                </p>
              </div>

              <div className="space-y-2">
                <Label>Actions (JSON) *</Label>
                <Textarea
                  value={JSON.stringify(editingRule.actions, null, 2)}
                  onChange={(e) => {
                    try {
                      updateRuleField('actions', JSON.parse(e.target.value));
                    } catch {}
                  }}
                  placeholder='{"proportions": {"top": 30, "heart": 40, "base": 30}}'
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Define what changes to make: proportions, requireNotes, or avoidNotes
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingRule.is_active}
                  onCheckedChange={(checked) => updateRuleField('is_active', checked)}
                />
                <Label>Active</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveRule} className="flex-1" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Rule
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingRule(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRules;
