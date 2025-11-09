import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Tag, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { z } from 'zod';

const shippingSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  fullName: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  address: z.string().trim().min(1, 'Address is required').max(500, 'Address must be less than 500 characters'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().regex(/^\d{6}$/, 'Postal code must be exactly 6 digits'),
  deliveryType: z.enum(['standard', 'express']),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    amount: number;
    code: string;
    rewardId: string;
  } | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [availableRewards, setAvailableRewards] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    deliveryType: 'standard',
  });

  const subtotal: number = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const discount: number = appliedDiscount?.amount || 0;
  const deliveryFee: number = formData.deliveryType === 'express' ? 199 : 0;
  const total: number = Math.max(0, subtotal - discount + deliveryFee);

  useEffect(() => {
    fetchAvailableRewards();
  }, []);

  const fetchAvailableRewards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rewards } = await supabase
        .from('referral_rewards')
        .select('*, referrals(referral_code)')
        .or(`referrer_id.eq.${user.id},referee_id.eq.${user.id}`)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (rewards) {
        // Filter to get unused discounts
        const available = rewards.filter(r => {
          if (r.referrer_id === user.id && !r.referrer_discount_used && r.referrer_discount_amount > 0) {
            return true;
          }
          if (r.referee_id === user.id && !r.referee_discount_used && r.referee_discount_amount > 0) {
            return true;
          }
          return false;
        });
        setAvailableRewards(available);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const validateReferralCode = async (code: string) => {
    if (!code.trim()) return;
    
    setValidatingCode(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to use a referral code",
          variant: "destructive",
        });
        return;
      }

      // Find the referral
      const { data: referral } = await supabase
        .from('referrals')
        .select('id, referrer_id')
        .eq('referral_code', code.toUpperCase())
        .single();

      if (!referral) {
        toast({
          title: "Invalid code",
          description: "This referral code doesn't exist",
          variant: "destructive",
        });
        return;
      }

      // Check if user is trying to use their own code
      if (referral.referrer_id === user.id) {
        toast({
          title: "Invalid code",
          description: "You cannot use your own referral code",
          variant: "destructive",
        });
        return;
      }

      // Find the reward
      const { data: reward } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('referral_id', referral.id)
        .eq('referee_id', user.id)
        .eq('status', 'completed')
        .eq('referee_discount_used', false)
        .single();

      if (reward) {
        setAppliedDiscount({
          amount: reward.referee_discount_amount,
          code: code.toUpperCase(),
          rewardId: reward.id,
        });
        toast({
          title: "Discount applied!",
          description: `₹${reward.referee_discount_amount} off your order`,
        });
      } else {
        toast({
          title: "Code not valid",
          description: "This code has already been used or is not available for your account",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error validating code:', error);
      toast({
        title: "Error",
        description: "Failed to validate code",
        variant: "destructive",
      });
    } finally {
      setValidatingCode(false);
    }
  };

  const applyAvailableReward = async (reward: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const isReferrer = reward.referrer_id === user.id;
    const amount = isReferrer ? reward.referrer_discount_amount : reward.referee_discount_amount;
    
    setAppliedDiscount({
      amount,
      code: reward.referrals?.referral_code || 'REWARD',
      rewardId: reward.id,
    });
    
    toast({
      title: "Discount applied!",
      description: `₹${amount} referral reward applied`,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprehensive validation using Zod
    const validation = shippingSchema.safeParse(formData);
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }
    
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to log in to place an order",
          variant: "destructive",
        });
        return;
      }

      const orderNumber = `BZK${Date.now()}`;
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + (formData.deliveryType === 'express' ? 2 : 5));

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          order_number: orderNumber,
          subtotal,
          delivery_fee: deliveryFee,
          discount_applied: discount,
          discount_code: appliedDiscount?.code || null,
          referral_reward_id: appliedDiscount?.rewardId || null,
          total,
          delivery_type: formData.deliveryType,
          shipping_address: {
            email: formData.email,
            fullName: formData.fullName,
            phone: `+91${formData.phone}`,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
          },
          estimated_delivery: estimatedDelivery.toISOString().split('T')[0],
          status: 'confirmed',
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_name: item.product_name,
        product_image: item.product_image,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Mark discount as used
      if (appliedDiscount) {
        const updateData = user.id === (availableRewards.find(r => r.id === appliedDiscount.rewardId)?.referrer_id)
          ? { referrer_discount_used: true }
          : { referee_discount_used: true };

        await supabase
          .from('referral_rewards')
          .update(updateData)
          .eq('id', appliedDiscount.rewardId);
      }

      // Clear cart
      await clearCart();

      setOrderId(orderNumber);
      setStep(3);
      
      toast({
        title: "Order placed successfully!",
        description: `Your order ${orderNumber} has been confirmed`,
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            step >= num ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            {step > num ? <Check className="h-5 w-5" /> : num}
          </div>
          {num < 3 && (
            <div className={`w-16 h-1 mx-2 ${
              step > num ? 'bg-accent' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => step === 1 ? navigate('/shop/cart') : setStep(step - 1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="max-w-2xl mx-auto">
            {renderStepIndicator()}

            {/* Step 1: Shipping */}
            {step === 1 && (
              <Card className="p-8">
                <h1 className="font-serif text-3xl mb-6">Shipping Information</h1>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <div className="w-16">
                        <Input value="+91" disabled />
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        placeholder="1234567890"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mumbai">Mumbai</SelectItem>
                          <SelectItem value="Delhi">Delhi</SelectItem>
                          <SelectItem value="Bangalore">Bangalore</SelectItem>
                          <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                          <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                          <SelectItem value="Pune">Pune</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        type="tel"
                        required
                        maxLength={6}
                        placeholder="400001"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      />
                    </div>
                  </div>

                   <div>
                     <Label>Delivery Type</Label>
                     <RadioGroup value={formData.deliveryType} onValueChange={(value) => handleInputChange('deliveryType', value)}>
                       <div className="flex items-center space-x-2 border rounded-lg p-4">
                         <RadioGroupItem value="standard" id="standard" />
                         <Label htmlFor="standard" className="flex-1 cursor-pointer">
                           <div className="font-semibold">Standard Delivery (5-7 days)</div>
                           <div className="text-sm text-accent">FREE</div>
                         </Label>
                       </div>
                       <div className="flex items-center space-x-2 border rounded-lg p-4">
                         <RadioGroupItem value="express" id="express" />
                         <Label htmlFor="express" className="flex-1 cursor-pointer">
                           <div className="font-semibold">Express Delivery (2-3 days)</div>
                           <div className="text-sm text-muted-foreground">₹199</div>
                         </Label>
                       </div>
                     </RadioGroup>
                   </div>

                   {/* Available Rewards */}
                   {availableRewards.length > 0 && !appliedDiscount && (
                     <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                       <div className="flex items-center gap-2 mb-3">
                         <Gift className="h-5 w-5 text-accent" />
                         <span className="font-semibold">You have referral rewards!</span>
                       </div>
                       <div className="space-y-2">
                         {availableRewards.slice(0, 2).map((reward, idx) => {
                           const isReferrer = reward.referrer_id;
                           const amount = isReferrer ? reward.referrer_discount_amount : reward.referee_discount_amount;
                           return (
                             <Button
                               key={idx}
                               variant="outline"
                               size="sm"
                               className="w-full justify-between"
                               onClick={() => applyAvailableReward(reward)}
                             >
                               <span>₹{amount} Referral Discount</span>
                               <span className="text-accent text-xs">Apply</span>
                             </Button>
                           );
                         })}
                       </div>
                     </div>
                   )}

                   {/* Discount Code Input */}
                   <div>
                     <Label htmlFor="discountCode">Referral Code (Optional)</Label>
                     <div className="flex gap-2">
                       <div className="relative flex-1">
                         <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input
                           id="discountCode"
                           placeholder="Enter referral code"
                           value={discountCode}
                           onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                           disabled={!!appliedDiscount}
                           className="pl-10"
                         />
                       </div>
                       <Button
                         type="button"
                         variant="outline"
                         onClick={() => validateReferralCode(discountCode)}
                         disabled={!discountCode || validatingCode || !!appliedDiscount}
                       >
                         {validatingCode ? 'Checking...' : 'Apply'}
                       </Button>
                     </div>
                     {appliedDiscount && (
                       <div className="mt-2 flex items-center gap-2 text-sm text-accent">
                         <Check className="h-4 w-4" />
                         <span>₹{appliedDiscount.amount} discount applied!</span>
                         <Button
                           type="button"
                           variant="ghost"
                           size="sm"
                           className="ml-auto h-6 text-xs"
                           onClick={() => {
                             setAppliedDiscount(null);
                             setDiscountCode('');
                           }}
                         >
                           Remove
                         </Button>
                       </div>
                     )}
                   </div>

                   <Button type="submit" className="w-full" size="lg">
                     Continue to Payment
                   </Button>
                </form>
              </Card>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <Card className="p-8">
                <h1 className="font-serif text-3xl mb-6">Payment</h1>
                
                <div className="space-y-6">
                   <div className="bg-secondary/50 p-6 rounded-lg">
                     <h3 className="font-semibold mb-2">Order Summary</h3>
                     <div className="space-y-2 text-sm">
                       <div className="flex justify-between">
                         <span>Subtotal</span>
                         <span>₹{subtotal.toFixed(2)}</span>
                       </div>
                       {discount > 0 && (
                         <div className="flex justify-between text-accent">
                           <span>Referral Discount</span>
                           <span>-₹{discount.toFixed(2)}</span>
                         </div>
                       )}
                       <div className="flex justify-between">
                         <span>Delivery</span>
                         <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
                       </div>
                       <div className="flex justify-between font-semibold text-base pt-2 border-t">
                         <span>Total</span>
                         <span>₹{total.toFixed(2)}</span>
                       </div>
                     </div>
                   </div>

                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <p className="text-muted-foreground mb-2">Razorpay Payment Gateway</p>
                    <p className="text-sm text-muted-foreground mb-4">UPI • Cards • Wallets</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <div className="px-3 py-1 bg-secondary rounded text-xs">UPI</div>
                      <div className="px-3 py-1 bg-secondary rounded text-xs">Credit Card</div>
                      <div className="px-3 py-1 bg-secondary rounded text-xs">Debit Card</div>
                      <div className="px-3 py-1 bg-secondary rounded text-xs">Wallets</div>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePlaceOrder}
                  >
                    Place Order • ₹{total.toFixed(2)}
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-8 w-8 text-accent-foreground" />
                </div>
                
                <h1 className="font-serif text-3xl mb-4">Order Confirmed!</h1>
                <p className="text-muted-foreground mb-6">
                  Thank you for your order. We'll send you a confirmation email shortly.
                </p>

                <div className="bg-secondary/50 p-6 rounded-lg mb-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-semibold">{orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Delivery</span>
                      <span className="font-semibold">
                        {formData.deliveryType === 'express' ? '2-3 days' : '5-7 days'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-semibold">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate('/shop/account?tab=orders')}
                  >
                    View Orders
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate('/')}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
