import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Package, Heart, Settings, LogOut, ShoppingBag, Gift, Share2, Copy, Check, ExternalLink, Loader2, Star, MapPin, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useCartStore } from '@/stores/cartStore';
import { FragranceVisualizer } from '@/components/FragranceVisualizer';
import { CartMigrationBanner } from '@/components/CartMigrationBanner';
import Header from '@/components/Header';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total: number;
  shopify_order_number?: string;
  shopify_checkout_url?: string;
  delivery_type: string;
  estimated_delivery?: string;
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
  formulation_notes?: string;
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
  const { addItem } = useCartStore();
  const [showMigrationAlert, setShowMigrationAlert] = useState(false);
  const [oldCartItems, setOldCartItems] = useState<any[]>([]);
  const [migratingCart, setMigratingCart] = useState(false);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedScents, setSavedScents] = useState<SavedScent[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralRewards, setReferralRewards] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  
  // Profile states
  const [profile, setProfile] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [specialOffers, setSpecialOffers] = useState(false);

  // Shipping form
  const [shipping, setShipping] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [savingShipping, setSavingShipping] = useState(false);

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

      const [ordersData, scentsData, subsData, referralsData, rewardsData, profileData, reviewsData] = await Promise.allSettled([
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('saved_scents').select('*').eq('user_id', user.id),
        supabase.from('subscriptions').select('*').eq('user_id', user.id),
        supabase.from('referrals').select('*, saved_scents(name)').eq('referrer_id', user.id).order('created_at', { ascending: false }),
        supabase.from('referral_rewards').select('*, referrals(referral_code)').or(`referrer_id.eq.${user.id},referee_id.eq.${user.id}`).order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('product_reviews').select('*, saved_scents(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      const pick = (r: any) => (r.status === 'fulfilled' ? r.value.data : null);
      if (pick(ordersData)) setOrders(pick(ordersData));
      if (pick(scentsData)) setSavedScents(pick(scentsData));
      if (pick(subsData)) setSubscriptions(pick(subsData));
      if (pick(referralsData)) setReferrals(pick(referralsData));
      if (pick(rewardsData)) setReferralRewards(pick(rewardsData));
      if (pick(reviewsData)) setReviews(pick(reviewsData));
      const p = pick(profileData);
      if (p) {
        setProfile(p);
        setEditName(p.full_name || '');
        setEditPhone(p.phone || '');
        setShipping({
          full_name: p.full_name || '',
          phone: p.phone || '',
          address_line1: p.address_line1 || '',
          address_line2: p.address_line2 || '',
          city: p.city || '',
          state: p.state || '',
          pincode: p.pincode || '',
          country: p.country || 'India',
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
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
    toast.success('Link copied! Share with friends to earn rewards');
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

  const handleReorder = async (scent: SavedScent) => {
    if (!scent.prices) {
      toast.error('Unable to reorder - pricing information not available');
      return;
    }
    
    try {
      console.log('Creating Shopify product for scent:', scent.id);

      const { data, error } = await supabase.functions.invoke('create-shopify-product-from-scent', {
        body: { scentId: scent.id },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Shopify product created:', data);

      const defaultSize = '30ml';
      const variant = data.variantIds.find((v: any) => v.size === defaultSize);
      if (!variant) {
        throw new Error('Variant not found');
      }

      // Add to Shopify cart
      addItem({
        product: {
          node: {
            id: data.productId,
            title: scent.name,
            description: scent.formulation_notes || '',
            handle: `custom-scent-${scent.fragrance_code || scent.id}`,
            priceRange: {
              minVariantPrice: {
                amount: variant.price,
                currencyCode: 'INR',
              },
            },
            images: {
              edges: [{
                node: {
                  url: '/custom-scent-default.jpg',
                  altText: scent.name
                }
              }],
            },
            variants: {
              edges: data.variantIds.map((v: any) => ({
                node: {
                  id: v.id,
                  title: v.size,
                  price: {
                    amount: v.price,
                    currencyCode: 'INR',
                  },
                  availableForSale: true,
                  selectedOptions: [{ name: 'Size', value: v.size }],
                },
              })),
            },
            options: [{ name: 'Size', values: data.variantIds.map((v: any) => v.size) }],
          },
        },
        variantId: variant.id,
        variantTitle: variant.size,
        price: {
          amount: variant.price,
          currencyCode: 'INR',
        },
        quantity: 1,
        selectedOptions: [{ name: 'Size', value: variant.size }],
      });

      toast.success(`Added ${scent.name} (${defaultSize}) to cart!`);
    } catch (error: any) {
      console.error('Error reordering:', error);
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  const handleEditDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editName,
          phone: editPhone,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, full_name: editName, phone: editPhone });
      setShowEditDialog(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setShowPasswordDialog(false);
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };

  const handleSavePreferences = () => {
    toast.success('Preferences saved successfully');
  };

  const handleSaveShipping = async () => {
    setSavingShipping(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: shipping.full_name,
          phone: shipping.phone,
          address_line1: shipping.address_line1,
          address_line2: shipping.address_line2,
          city: shipping.city,
          state: shipping.state,
          pincode: shipping.pincode,
          country: shipping.country,
        })
        .eq('id', user.id);
      if (error) throw error;
      setProfile({ ...profile, ...shipping });
      toast.success('Shipping details saved');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save shipping details');
    } finally {
      setSavingShipping(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <CartMigrationBanner />
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <Card className="p-6 h-fit sticky top-24">
              <div className="space-y-1">
                <Button variant={defaultTab === 'dashboard' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => navigate('/shop/account?tab=dashboard')}>
                  <User className="mr-2 h-4 w-4" /> Dashboard
                </Button>
                <Button variant={defaultTab === 'orders' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => navigate('/shop/account?tab=orders')}>
                  <Package className="mr-2 h-4 w-4" /> Order History
                </Button>
                <Button variant={defaultTab === 'scents' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => navigate('/shop/account?tab=scents')}>
                  <Heart className="mr-2 h-4 w-4" /> My Scents
                </Button>
                <Button variant={defaultTab === 'reviews' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => navigate('/shop/account?tab=reviews')}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Reviews
                </Button>
                <Button variant={defaultTab === 'shipping' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => navigate('/shop/account?tab=shipping')}>
                  <MapPin className="mr-2 h-4 w-4" /> Shipping Details
                </Button>
                <Button variant={defaultTab === 'settings' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => navigate('/shop/account?tab=settings')}>
                  <Settings className="mr-2 h-4 w-4" /> Account Settings
                </Button>

                <Collapsible open={moreOpen} onOpenChange={setMoreOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between">
                      <span className="flex items-center"><ChevronRight className={`mr-2 h-4 w-4 transition-transform ${moreOpen ? 'rotate-90' : ''}`} /> More</span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-4">
                    <Button variant={defaultTab === 'subscriptions' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => navigate('/shop/account?tab=subscriptions')}>
                      <ShoppingBag className="mr-2 h-4 w-4" /> Subscriptions
                    </Button>
                    <Button variant={defaultTab === 'referrals' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => navigate('/shop/account?tab=referrals')}>
                      <Gift className="mr-2 h-4 w-4" /> Referrals
                    </Button>
                  </CollapsibleContent>
                </Collapsible>

                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
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
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                  <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                  <TabsTrigger value="referrals">Referrals</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-6">
                  <Card className="p-6">
                    <h1 className="font-serif text-3xl mb-4">Welcome Back, {profile?.full_name || profile?.email || ''}!</h1>
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

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="space-y-6">
                  <Card className="p-6">
                    <h1 className="font-serif text-3xl mb-6">My Reviews</h1>
                    {reviews.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">You haven't written any reviews yet.</p>
                        <Button onClick={() => navigate('/shop/collection')}>Browse Fragrances</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((rev) => (
                          <Card key={rev.id} className="p-4">
                            <div className="flex justify-between items-start mb-2 gap-3">
                              <div>
                                <h3 className="font-semibold">{rev.saved_scents?.name || rev.product_handle}</h3>
                                <div className="flex items-center gap-1 mt-1">
                                  {[1,2,3,4,5].map((n) => (
                                    <Star key={n} className={`h-4 w-4 ${n <= rev.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                                  ))}
                                </div>
                              </div>
                              <Badge variant={rev.status === 'approved' ? 'default' : rev.status === 'pending' ? 'secondary' : 'outline'}>
                                {rev.status}
                              </Badge>
                            </div>
                            {rev.title && <p className="font-medium mb-1">{rev.title}</p>}
                            <p className="text-sm text-muted-foreground mb-2">{rev.body}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(rev.created_at)}</p>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Card>
                </TabsContent>

                {/* Shipping Details Tab */}
                <TabsContent value="shipping" className="space-y-6">
                  <Card className="p-6">
                    <h1 className="font-serif text-3xl mb-6">Shipping Details</h1>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ship-name">Full Name</Label>
                        <Input id="ship-name" value={shipping.full_name} onChange={(e) => setShipping({ ...shipping, full_name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ship-phone">Phone</Label>
                        <Input id="ship-phone" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="ship-addr1">Address Line 1</Label>
                        <Input id="ship-addr1" value={shipping.address_line1} onChange={(e) => setShipping({ ...shipping, address_line1: e.target.value })} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="ship-addr2">Address Line 2 (optional)</Label>
                        <Input id="ship-addr2" value={shipping.address_line2} onChange={(e) => setShipping({ ...shipping, address_line2: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ship-city">City</Label>
                        <Input id="ship-city" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ship-state">State</Label>
                        <Input id="ship-state" value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ship-pin">Pincode</Label>
                        <Input id="ship-pin" value={shipping.pincode} onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ship-country">Country</Label>
                        <Input id="ship-country" value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex justify-end pt-6">
                      <Button onClick={handleSaveShipping} disabled={savingShipping}>
                        {savingShipping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Shipping Details
                      </Button>
                    </div>
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
                  {/* Profile Details */}
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Profile details</h2>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Name</Label>
                        <p className="text-foreground">{profile?.full_name || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Email</Label>
                        <p className="text-foreground">{profile?.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Phone number</Label>
                        <p className="text-foreground">{profile?.phone || 'Not set'}</p>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowPasswordDialog(true)}
                        >
                          Change password
                        </Button>
                        <Button 
                          onClick={() => setShowEditDialog(true)}
                        >
                          Edit details
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Remaining Tokens */}
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Your remaining tokens:</h2>
                    <div className="space-y-3">
                      <div className="text-4xl font-bold">0 <span className="text-lg font-normal text-muted-foreground">tokens</span></div>
                      <p className="text-sm text-muted-foreground">
                        tokens <span className="text-destructive">0</span> Review tokens: <span className="text-destructive">0</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        These can be spend on 5ml scents. Your remaining tokens will be deducted <span className="text-destructive">automatically</span> in the basket during check out.
                      </p>
                    </div>
                  </Card>

                  {/* Email Subscriptions */}
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Your email subscription(s):</h2>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground mb-4">I'd like to receive:</p>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="newsletter"
                          checked={newsletter}
                          onCheckedChange={(checked) => setNewsletter(checked as boolean)}
                        />
                        <Label htmlFor="newsletter" className="text-sm font-normal cursor-pointer">
                          Newsletter
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="offers"
                          checked={specialOffers}
                          onCheckedChange={(checked) => setSpecialOffers(checked as boolean)}
                        />
                        <Label htmlFor="offers" className="text-sm font-normal cursor-pointer">
                          Special offers
                        </Label>
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button onClick={handleSavePreferences}>
                          Save
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Delete Account */}
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Delete your account:</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your scents will be gone from our data for eternity. You can request to delete your account by{' '}
                      <a href="#" className="text-primary hover:underline">contacting us</a>.
                    </p>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Details Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile Details</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Your phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDetails}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your new password below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Account;
