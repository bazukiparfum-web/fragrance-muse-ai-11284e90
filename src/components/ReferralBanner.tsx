import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReferralBannerProps {
  referralCode?: string;
  discountAmount?: number;
  onDismiss?: () => void;
  variant?: 'signup' | 'checkout' | 'quiz';
}

export function ReferralBanner({
  referralCode,
  discountAmount = 100,
  onDismiss,
  variant = 'signup',
}: ReferralBannerProps) {
  const getMessage = () => {
    switch (variant) {
      case 'signup':
        return `Sign up with code ${referralCode} and get ₹${discountAmount} off your first order!`;
      case 'checkout':
        return `You have ₹${discountAmount} referral discount available!`;
      case 'quiz':
        return `Share your fragrance and earn ₹${discountAmount} when friends order!`;
      default:
        return `Get ₹${discountAmount} off with referral code ${referralCode}`;
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 rounded-lg p-4 relative animate-in fade-in slide-in-from-top-2 duration-500">
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="font-semibold text-sm sm:text-base">{getMessage()}</p>
          {referralCode && variant === 'signup' && (
            <p className="text-xs text-muted-foreground mt-1">
              Your friend shared their fragrance with you
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
