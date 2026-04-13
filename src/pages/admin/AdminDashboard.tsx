import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Layers, HelpCircle, Beaker, Tag } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-serif text-4xl font-bold mb-8 heading-luxury">Admin Dashboard</h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover-lift cursor-pointer" onClick={() => navigate('/admin/notes')}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Layers className="h-6 w-6 text-accent" />
                </div>
                <h2 className="font-serif text-xl font-bold">Fragrance Notes</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Manage ingredients and notes used in scent creation
              </p>
              <Button className="mt-4 w-full">Manage Notes</Button>
            </Card>

            <Card className="p-6 hover-lift cursor-pointer" onClick={() => navigate('/admin/ingredients')}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Beaker className="h-6 w-6 text-accent" />
                </div>
                <h2 className="font-serif text-xl font-bold">Ingredient Mappings</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Configure pump IDs, codes, and dispensing rates
              </p>
              <Button className="mt-4 w-full">Manage Mappings</Button>
            </Card>

            <Card className="p-6 hover-lift cursor-pointer" onClick={() => navigate('/admin/rules')}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Database className="h-6 w-6 text-accent" />
                </div>
                <h2 className="font-serif text-xl font-bold">Formulation Rules</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Define rules for creating custom scent formulas
              </p>
              <Button className="mt-4 w-full">Manage Rules</Button>
            </Card>

            <Card className="p-6 hover-lift cursor-pointer" onClick={() => navigate('/admin/questions')}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <HelpCircle className="h-6 w-6 text-accent" />
                </div>
                <h2 className="font-serif text-xl font-bold">Quiz Questions</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Customize quiz questions and options
              </p>
              <Button className="mt-4 w-full">Manage Questions</Button>
            </Card>
            <Card className="p-6 hover-lift cursor-pointer" onClick={() => navigate('/admin/scents')}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Tag className="h-6 w-6 text-accent" />
                </div>
                <h2 className="font-serif text-xl font-bold">Scent Tags</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Tag scents as influencer or celebrity picks
              </p>
              <Button className="mt-4 w-full">Manage Tags</Button>
            </Card>
          </div>

          <Card className="p-6 mt-8 bg-accent/5">
            <h3 className="font-serif text-xl font-bold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-accent">0</p>
                <p className="text-sm text-muted-foreground">Active Notes</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent">0</p>
                <p className="text-sm text-muted-foreground">Ingredients</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent">0</p>
                <p className="text-sm text-muted-foreground">Active Rules</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent">0</p>
                <p className="text-sm text-muted-foreground">Quiz Questions</p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
