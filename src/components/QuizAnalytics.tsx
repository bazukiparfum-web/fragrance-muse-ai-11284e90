import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, Palette, MapPin } from 'lucide-react';

interface AnalyticsData {
  personalityTraits: Array<{ trait: string; average: number; yourValue: number }>;
  colorDistribution: Array<{ hue: string; count: number; percentage: number }>;
  demographics: {
    ageRanges: Array<{ range: string; count: number }>;
    genders: Array<{ gender: string; count: number }>;
    settings: Array<{ setting: string; count: number }>;
  };
  totalResponses: number;
}

interface QuizAnalyticsProps {
  userAnswers: any;
}

export const QuizAnalytics = ({ userAnswers }: QuizAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-quiz-analytics', {
        body: { userAnswers }
      });

      if (error) throw error;
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="font-serif text-2xl font-bold">How You Compare</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          See how your preferences compare to {analytics.totalResponses.toLocaleString()} other fragrance lovers
        </p>
      </Card>

      <Tabs defaultValue="personality" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="personality" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-serif text-xl font-bold mb-4">Personality Traits Comparison</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Your personality profile compared to the average user
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={analytics.personalityTraits}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="trait" 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 10]} />
                <Radar 
                  name="Average User" 
                  dataKey="average" 
                  stroke="hsl(var(--muted-foreground))" 
                  fill="hsl(var(--muted))" 
                  fillOpacity={0.3} 
                />
                <Radar 
                  name="You" 
                  dataKey="yourValue" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.6} 
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 text-primary" />
              <h3 className="font-serif text-xl font-bold">Color Preferences</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Popular color choices among our community
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.colorDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ hue, percentage }) => `${hue}: ${percentage}%`}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="count"
                  >
                    {analytics.colorDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col justify-center space-y-3">
                {analytics.colorDistribution.map((color, index) => (
                  <div key={color.hue} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{color.hue}</span>
                    </div>
                    <span className="text-muted-foreground">{color.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-serif text-xl font-bold">Age Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.demographics.ageRanges}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" tick={{ fill: 'hsl(var(--foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-serif text-xl font-bold mb-4">Gender Identity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.demographics.genders} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--foreground))' }} />
                  <YAxis dataKey="gender" type="category" tick={{ fill: 'hsl(var(--foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-serif text-xl font-bold">Growing Up Settings</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.demographics.settings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="setting" tick={{ fill: 'hsl(var(--foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};