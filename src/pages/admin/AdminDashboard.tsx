import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Layers, Beaker, Database, HelpCircle, Star, Factory, MessageSquare, ShoppingBag,
} from 'lucide-react';

interface StatCard {
  label: string;
  icon: any;
  fetcher: () => Promise<number>;
  to: string;
}

const cards: StatCard[] = [
  {
    label: 'Active Notes',
    icon: Layers,
    to: '/admin/notes',
    fetcher: async () => {
      const { count } = await supabase
        .from('fragrance_notes')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      return count ?? 0;
    },
  },
  {
    label: 'Ingredients',
    icon: Beaker,
    to: '/admin/ingredients',
    fetcher: async () => {
      const { count } = await supabase
        .from('ingredient_mappings')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      return count ?? 0;
    },
  },
  {
    label: 'Active Rules',
    icon: Database,
    to: '/admin/rules',
    fetcher: async () => {
      const { count } = await supabase
        .from('formulation_rules')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      return count ?? 0;
    },
  },
  {
    label: 'Quiz Questions',
    icon: HelpCircle,
    to: '/admin/questions',
    fetcher: async () => {
      const { count } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      return count ?? 0;
    },
  },
  {
    label: 'Pending Reviews',
    icon: Star,
    to: '/admin/reviews',
    fetcher: async () => {
      const { count } = await supabase
        .from('product_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      return count ?? 0;
    },
  },
  {
    label: 'Queue: Pending',
    icon: Factory,
    to: '/admin/production-queue',
    fetcher: async () => {
      const { count } = await supabase
        .from('production_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      return count ?? 0;
    },
  },
  {
    label: 'Consultations',
    icon: MessageSquare,
    to: '/admin/consultations',
    fetcher: async () => {
      const { count } = await supabase
        .from('consultation_requests')
        .select('*', { count: 'exact', head: true });
      return count ?? 0;
    },
  },
  {
    label: 'Recent Orders',
    icon: ShoppingBag,
    to: '/admin/orders',
    fetcher: async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since);
      return count ?? 0;
    },
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<(number | null)[]>(cards.map(() => null));

  useEffect(() => {
    Promise.allSettled(cards.map((c) => c.fetcher())).then((results) => {
      setStats(results.map((r) => (r.status === 'fulfilled' ? r.value : 0)));
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="font-serif text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Overview of your platform at a glance.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card
              key={c.label}
              className="p-5 cursor-pointer hover:bg-accent/5 transition"
              onClick={() => navigate(c.to)}
            >
              <div className="flex items-start justify-between mb-3">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              {stats[i] === null ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <p className="text-3xl font-bold">{stats[i]}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">{c.label}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
