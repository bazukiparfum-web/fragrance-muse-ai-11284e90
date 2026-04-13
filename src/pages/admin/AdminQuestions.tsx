import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  question_key: string;
  options?: any;
  min_value?: number;
  max_value?: number;
  order_index: number;
  is_required: boolean;
  is_active: boolean;
  helper_text?: string;
}

const AdminQuestions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'radio',
    question_key: '',
    options: '',
    min_value: 1,
    max_value: 10,
    helper_text: '',
    is_required: true,
    is_active: true
  });

  useEffect(() => {
    setIsAdmin(true);
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setQuestions(data || []);
    } catch (directQueryError) {
      console.error('Direct question load failed, falling back to edge functions:', directQueryError);

      try {
        const [myselfResponse, giftResponse] = await Promise.all([
          supabase.functions.invoke('get-quiz-questions', {
            body: { quizType: 'myself' },
            method: 'POST'
          }),
          supabase.functions.invoke('get-quiz-questions', {
            body: { quizType: 'gift' },
            method: 'POST'
          })
        ]);

        if (myselfResponse.error) throw myselfResponse.error;
        if (giftResponse.error) throw giftResponse.error;

        const mergedQuestions = [...(myselfResponse.data?.questions || []), ...(giftResponse.data?.questions || [])];
        const uniqueQuestions = Array.from(
          new Map(mergedQuestions.map((question: Question) => [question.id, question])).values()
        ).sort((a, b) => a.order_index - b.order_index);

        setQuestions(uniqueQuestions);
      } catch (fallbackError) {
        console.error('Error loading questions:', fallbackError);
        toast({
          title: 'Error',
          description: 'Failed to load questions',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const questionData = {
        question_text: formData.question_text,
        question_type: formData.question_type,
        question_key: formData.question_key,
        options: formData.options ? JSON.parse(formData.options) : null,
        min_value: formData.question_type === 'slider' ? formData.min_value : null,
        max_value: formData.question_type === 'slider' ? formData.max_value : null,
        order_index: editingQuestion ? editingQuestion.order_index : questions.length,
        is_required: formData.is_required,
        is_active: formData.is_active,
        helper_text: formData.helper_text || null
      };

      const { error } = await supabase.functions.invoke('admin-manage-questions', {
        body: {
          operation: editingQuestion ? 'update' : 'create',
          question: editingQuestion ? { id: editingQuestion.id, ...questionData } : questionData
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Question ${editingQuestion ? 'updated' : 'created'} successfully`
      });

      setDialogOpen(false);
      resetForm();
      loadQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: 'Error',
        description: 'Failed to save question',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('admin-manage-questions', {
        body: {
          operation: 'delete',
          question: { id }
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Question deleted successfully'
      });

      loadQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive'
      });
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) return;

    const newQuestions = [...questions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Update order_index for both questions
      await Promise.all([
        supabase.functions.invoke('admin-manage-questions', {
          body: {
            operation: 'update',
            question: { id: newQuestions[index].id, order_index: index }
          }
        }),
        supabase.functions.invoke('admin-manage-questions', {
          body: {
            operation: 'update',
            question: { id: newQuestions[swapIndex].id, order_index: swapIndex }
          }
        })
      ]);

      loadQuestions();
    } catch (error) {
      console.error('Error reordering questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder questions',
        variant: 'destructive'
      });
    }
  };

  const handleToggleActive = async (question: Question) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('admin-manage-questions', {
        body: {
          operation: 'update',
          question: { id: question.id, is_active: !question.is_active }
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Question ${!question.is_active ? 'activated' : 'deactivated'}`
      });

      loadQuestions();
    } catch (error) {
      console.error('Error toggling question:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle question',
        variant: 'destructive'
      });
    }
  };

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      question_key: question.question_key,
      options: question.options ? JSON.stringify(question.options, null, 2) : '',
      min_value: question.min_value || 1,
      max_value: question.max_value || 10,
      helper_text: question.helper_text || '',
      is_required: question.is_required,
      is_active: question.is_active
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setFormData({
      question_text: '',
      question_type: 'radio',
      question_key: '',
      options: '',
      min_value: 1,
      max_value: 10,
      helper_text: '',
      is_required: true,
      is_active: true
    });
  };

  if (isAdmin === null || loading) {
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="flex items-center justify-between mb-8">
            <h1 className="font-serif text-4xl font-bold heading-luxury">Quiz Questions</h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingQuestion ? 'Edit' : 'Add'} Question</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Question Text</Label>
                    <Textarea
                      value={formData.question_text}
                      onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Question Type</Label>
                    <Select
                      value={formData.question_type}
                      onValueChange={(value) => setFormData({ ...formData, question_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="radio">Radio</SelectItem>
                        <SelectItem value="slider">Slider</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="color_picker">Color Picker</SelectItem>
                        <SelectItem value="city_search">City Search</SelectItem>
                        <SelectItem value="personality_sliders">Personality Sliders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Question Key (for data storage)</Label>
                    <Input
                      value={formData.question_key}
                      onChange={(e) => setFormData({ ...formData, question_key: e.target.value })}
                      placeholder="e.g., ageRange, personality"
                      required
                    />
                  </div>

                  {(formData.question_type === 'radio' || formData.question_type === 'personality_sliders') && (
                    <div>
                      <Label>Options (JSON array)</Label>
                      <Textarea
                        value={formData.options}
                        onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                        placeholder='["Option 1", "Option 2"] or [{"value": "opt1", "desc": "Description"}]'
                        rows={4}
                      />
                    </div>
                  )}

                  {formData.question_type === 'slider' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Min Value</Label>
                        <Input
                          type="number"
                          value={formData.min_value}
                          onChange={(e) => setFormData({ ...formData, min_value: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Max Value</Label>
                        <Input
                          type="number"
                          value={formData.max_value}
                          onChange={(e) => setFormData({ ...formData, max_value: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Helper Text (optional)</Label>
                    <Input
                      value={formData.helper_text}
                      onChange={(e) => setFormData({ ...formData, helper_text: e.target.value })}
                      placeholder="Additional context for the question"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_required}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
                      />
                      <Label>Required</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingQuestion ? 'Update' : 'Create'} Question
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead className="w-20">Active</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question, index) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReorder(question.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReorder(question.id, 'down')}
                          disabled={index === questions.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md truncate">{question.question_text}</TableCell>
                    <TableCell className="capitalize">{question.question_type.replace('_', ' ')}</TableCell>
                    <TableCell className="font-mono text-sm">{question.question_key}</TableCell>
                    <TableCell>
                      <Switch
                        checked={question.is_active}
                        onCheckedChange={() => handleToggleActive(question)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {questions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No questions yet. Click "Add Question" to create one.
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AdminQuestions;