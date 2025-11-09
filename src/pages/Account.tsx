import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Package, Heart, Settings, LogOut, ShoppingBag, Gift, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { FragranceVisualizer } from '@/components/FragranceVisualizer';
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
  fragrance_code?: string;
  visual_data?: any;
  match_score?: number;
  intensity?: number;
  longevity?: number;
  prices?: any;
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
  const { addToCart } = useCart();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedScents, setSavedScents] = useState<SavedScent[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralRewards, setReferralRewards] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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

      setCurrentUserId(user.id);

      const [ordersData, scentsData, subsData, referralsData, rewardsData] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('saved_scents').select('*').eq('user_id', user.id),
        supabase.from('subscriptions').select('*').eq('user_id', user.id),
        supabase.from('referrals').select('*, saved_scents(name)').eq('referrer_id', user.id).order('created_at', { ascending: false }),
        supabase.from('referral_rewards').select('*, referrals(referral_code)').or(`referrer_id.eq.${user.id},referee_id.eq.${user.id}`).order('created_at', { ascending: false }),
      ]);

      if (ordersData.data) setOrders(ordersData.data);
      if (scentsData.data) setSavedScents(scentsData.data);
      if (subsData.data) setSubscriptions(subsData.data);
      if (referralsData.data) setReferrals(referralsData.data);
      if (rewardsData.data) setReferralRewards(rewardsData.data);
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

  const copyReferralLink = (code: string) => {
    const link = `${window.location.origin}/auth?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    toast({ title: "Link copied!", description: "Share with friends to earn rewards" });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getReferralStats = () => {
    if (!currentUserId) return { totalInvited: 0, friendsOrdered: 0, totalEarned: 0, availableBalance: 0 };
    
    const totalInvited = referralRewards.filter(r => r.referrer_id === currentUserId).length;
    const friendsOrdered = referralRewards.filter(r => r.status === 'completed' && r.referrer_id === currentUserId).length;
    const totalEarned = referralRewards
      .filter(r => r.referrer_id === currentUserId && r.status === 'completed')
      .reduce((sum, r) => sum + (r.referrer_discount_amount || 0), 0);
    const availableBalance = referralRewards
      .filter(r => r.referrer_id === currentUserId && r.status === 'completed' && !r.referrer_discount_used)
      .reduce((sum, r) => sum + (r.referrer_discount_amount || 0), 0);

    return { totalInvited, friendsOrdered, totalEarned, availableBalance };
  };

  const handleReorder = (scent: SavedScent) => {
    if (!scent.prices) {
      toast({ title: "Unable to reorder", description: "Pricing information not available" });
      return;
    }
    
    const defaultSize = '30ml';
    const price = scent.prices[defaultSize] || 0;
    
    addToCart({
      product_name: scent.name,
      product_image: '/placeholder.svg',
      size: defaultSize,
      quantity: 1,
      price: price / 100,
    });
    
    toast({
      title: "Added to cart",
      description: `${scent.name} (${defaultSize}) added to your cart`
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
                  onClick={() => navigate('/shop/account?tab=referrals')}
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Referrals
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
                  <TabsTrigger value="referrals">Referrals</TabsTrigger>
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
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="font-serif text-3xl">My Scents</h1>
                      <Button onClick={() => navigate('/shop/quiz')}>
                        Create New Fragrance
                      </Button>
                    </div>
                    {savedScents.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">
                          No saved scents yet. Create your custom fragrance to save it here.
                        </p>
                        <Button onClick={() => navigate('/shop/quiz')}>
                          Take the Quiz
                        </Button>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6">
                        {savedScents.map((scent) => (
                          <Card 
                            key={scent.id} 
                            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => navigate(`/shop/account/scents/${scent.id}`)}
                          >
                            <div className="flex gap-4 mb-4">
                              {scent.visual_data && (
                                <FragranceVisualizer
                                  visualData={scent.visual_data}
                                  size="small"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-lg">{scent.name}</h3>
                                  {scent.fragrance_code && (
                                    <Badge variant="secondary" className="text-xs">
                                      {scent.fragrance_code}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Created {formatDate(scent.created_at)}
                                </p>
                              </div>
                            </div>
                            
                            {(scent.match_score || scent.intensity || scent.longevity) && (
                              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                                {scent.match_score && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Match</p>
                                    <p className="text-sm font-semibold">{scent.match_score}%</p>
                                  </div>
                                )}
                                {scent.intensity && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Intensity</p>
                                    <p className="text-sm font-semibold">{scent.intensity}/10</p>
                                  </div>
                                )}
                                {scent.longevity && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Longevity</p>
                                    <p className="text-sm font-semibold">{scent.longevity}/10</p>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => handleReorder(scent)}
                              >
                                Reorder
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => navigate(`/shop/account/scents/${scent.id}`)}
                              >
                                View Details
                              </Button>
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

                {/* Referrals Tab */}
                <TabsContent value="referrals" className="space-y-6">
                  <Card className="p-6">
                    <h1 className="font-serif text-3xl mb-6">Referrals & Rewards</h1>

                    {/* Stats Cards */}
                    <div className="grid md:grid-cols-4 gap-4 mb-8">
                      <Card className="p-4 bg-accent/5">
                        <div className="text-2xl font-bold mb-1">{getReferralStats().totalInvited}</div>
                        <div className="text-sm text-muted-foreground">Friends Invited</div>
                      </Card>
                      <Card className="p-4 bg-accent/5">
                        <div className="text-2xl font-bold mb-1">{getReferralStats().friendsOrdered}</div>
                        <div className="text-sm text-muted-foreground">Friends Ordered</div>
                      </Card>
                      <Card className="p-4 bg-accent/5">
                        <div className="text-2xl font-bold mb-1">₹{getReferralStats().totalEarned}</div>
                        <div className="text-sm text-muted-foreground">Total Earned</div>
                      </Card>
                      <Card className="p-4 bg-accent/10 border-accent">
                        <div className="text-2xl font-bold mb-1 text-accent">₹{getReferralStats().availableBalance}</div>
                        <div className="text-sm text-muted-foreground">Available Balance</div>
                      </Card>
                    </div>

                    {/* How It Works */}
                    <Card className="p-6 mb-8 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Gift className="h-5 w-5 text-accent" />
                        How Referrals Work
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 font-bold text-accent">1</div>
                          <div>
                            <p className="font-semibold mb-1">Share Your Fragrance</p>
                            <p className="text-muted-foreground">Create and share your custom fragrance with friends</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 font-bold text-accent">2</div>
                          <div>
                            <p className="font-semibold mb-1">Friend Orders</p>
                            <p className="text-muted-foreground">Your friend signs up and places their first order</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 font-bold text-accent">3</div>
                          <div>
                            <p className="font-semibold mb-1">Both Get ₹100</p>
                            <p className="text-muted-foreground">You and your friend each receive ₹100 off</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Active Referral Links */}
                    {referrals.length > 0 && (
                      <div className="mb-8">
                        <h3 className="font-semibold text-lg mb-4">Your Referral Links</h3>
                        <div className="space-y-3">
                          {referrals.map((ref) => (
                            <Card key={ref.id} className="p-4">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold">{ref.referral_code}</span>
                                    {ref.saved_scents?.name && (
                                      <span className="text-sm text-muted-foreground">
                                        • {ref.saved_scents.name}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {ref.uses_count} / {ref.max_uses} uses • 
                                    Expires {formatDate(ref.expires_at)}
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyReferralLink(ref.referral_code)}
                                  className="gap-2"
                                >
                                  {copiedCode === ref.referral_code ? (
                                    <>
                                      <Check className="h-4 w-4" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-4 w-4" />
                                      Copy Link
                                    </>
                                  )}
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Discount History */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Discount History</h3>
                      {referralRewards.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          No referral rewards yet. Share your fragrances to earn rewards!
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Code</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {referralRewards.map((reward) => {
                              const isReferrer = reward.referrer_id === currentUserId;
                              const amount = isReferrer ? reward.referrer_discount_amount : reward.referee_discount_amount;
                              const isUsed = isReferrer ? reward.referrer_discount_used : reward.referee_discount_used;
                              
                              return (
                                <TableRow key={reward.id}>
                                  <TableCell>{formatDate(reward.created_at)}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {isReferrer ? 'Referrer Reward' : 'Referee Reward'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="font-mono text-sm">
                                    {reward.referrals?.referral_code || '-'}
                                  </TableCell>
                                  <TableCell className="font-semibold">₹{amount}</TableCell>
                                  <TableCell>
                                    {reward.status === 'completed' ? (
                                      isUsed ? (
                                        <Badge variant="secondary">Used</Badge>
                                      ) : (
                                        <Badge className="bg-accent">Available</Badge>
                                      )
                                    ) : (
                                      <Badge variant="outline">{reward.status}</Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </div>
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
