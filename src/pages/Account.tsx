import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Package, Heart, Settings, LogOut, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total: number;
}

interface SavedScent {
  id: string;
  name: string;
  formula: any;
  created_at: string;
}

interface Subscription {
  id: string;
  product_name: string;
  frequency: string;
  next_delivery: string;
  status: string;
  price: number;
}

const Account = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'dashboard';
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedScents, setSavedScents] = useState<SavedScent[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      const [ordersData, scentsData, subsData] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('saved_scents').select('*').eq('user_id', user.id),
        supabase.from('subscriptions').select('*').eq('user_id', user.id),
      ]);

      if (ordersData.data) setOrders(ordersData.data);
      if (scentsData.data) setSavedScents(scentsData.data);
      if (subsData.data) setSubscriptions(subsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out successfully" });
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <Card className="p-6 h-fit sticky top-24">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/shop/account?tab=dashboard')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/shop/account?tab=scents')}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  My Scents
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/shop/account?tab=orders')}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Orders
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/shop/account?tab=subscriptions')}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Subscriptions
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/shop/account?tab=settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </Card>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs value={defaultTab} className="space-y-6">
                <TabsList className="hidden">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="scents">My Scents</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-6">
                  <Card className="p-6">
                    <h1 className="font-serif text-3xl mb-4">Welcome Back!</h1>
                    <p className="text-muted-foreground">
                      Manage your orders, scents, and subscriptions from your dashboard.
                    </p>
                  </Card>

                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-6">
                      <div className="text-3xl font-bold mb-2">{orders.length}</div>
                      <div className="text-sm text-muted-foreground">Total Orders</div>
                    </Card>
                    <Card className="p-6">
                      <div className="text-3xl font-bold mb-2">{savedScents.length}</div>
                      <div className="text-sm text-muted-foreground">Saved Scents</div>
                    </Card>
                    <Card className="p-6">
                      <div className="text-3xl font-bold mb-2">{subscriptions.length}</div>
                      <div className="text-sm text-muted-foreground">Active Subscriptions</div>
                    </Card>
                  </div>

                  {orders.length > 0 && (
                    <Card className="p-6">
                      <h2 className="font-serif text-2xl mb-4">Recent Orders</h2>
                      <div className="space-y-4">
                        {orders.slice(0, 3).map((order) => (
                          <div key={order.id} className="flex justify-between items-center pb-4 border-b last:border-0">
                            <div>
                              <div className="font-semibold">{order.order_number}</div>
                              <div className="text-sm text-muted-foreground">{formatDate(order.created_at)}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">₹{order.total.toFixed(2)}</div>
                              <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </TabsContent>

                {/* My Scents Tab */}
                <TabsContent value="scents" className="space-y-6">
                  <Card className="p-6">
                    <h1 className="font-serif text-3xl mb-6">My Scents</h1>
                    {savedScents.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No saved scents yet. Create your custom fragrance to save it here.
                      </p>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {savedScents.map((scent) => (
                          <Card key={scent.id} className="p-6">
                            <h3 className="font-semibold text-lg mb-2">{scent.name}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Created {formatDate(scent.created_at)}
                            </p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Reorder</Button>
                              <Button size="sm" variant="outline">Tweak</Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Card>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="space-y-6">
                  <Card className="p-6">
                    <h1 className="font-serif text-3xl mb-6">Order History</h1>
                    {orders.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No orders yet. Start shopping to see your orders here.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.order_number}</TableCell>
                              <TableCell>{formatDate(order.created_at)}</TableCell>
                              <TableCell>
                                <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>₹{order.total.toFixed(2)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">Track</Button>
                                  <Button size="sm" variant="outline">Reorder</Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </Card>
                </TabsContent>

                {/* Subscriptions Tab */}
                <TabsContent value="subscriptions" className="space-y-6">
                  <Card className="p-6">
                    <h1 className="font-serif text-3xl mb-6">Subscriptions</h1>
                    {subscriptions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No active subscriptions. Subscribe to your favorite scents for regular deliveries.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {subscriptions.map((sub) => (
                          <Card key={sub.id} className="p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">{sub.product_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {sub.frequency} • ₹{sub.price.toFixed(2)}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Next delivery: {formatDate(sub.next_delivery)}
                                </p>
                              </div>
                              <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                                {sub.status}
                              </Badge>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button size="sm" variant="outline">Pause</Button>
                              <Button size="sm" variant="outline">Change Frequency</Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <Card className="p-6">
                    <h1 className="font-serif text-3xl mb-6">Settings</h1>
                    <p className="text-muted-foreground">
                      Account settings coming soon...
                    </p>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;
