import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Facebook, MessageCircle, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateReferralCode } from '@/lib/referralCodeGenerator';

interface ShareFragranceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fragranceId: string;
  fragranceName: string;
  shareToken?: string | null;
  shareCount?: number;
  onShareCreated: (shareToken: string, referralCode: string) => void;
}

export function ShareFragranceDialog({
  open,
  onOpenChange,
  fragranceId,
  fragranceName,
  shareToken: initialShareToken,
  shareCount = 0,
  onShareCreated,
}: ShareFragranceDialogProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  const generateShareLink = async () => {
    if (shareToken && referralCode) return;

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      const userName = profile?.full_name || profile?.email?.split('@')[0] || 'USER';

      // Generate share token
      const newShareToken = crypto.randomUUID();

      // Generate referral code
      const newReferralCode = await generateReferralCode(userName);

      // Update saved_scents with share token
      const { error: updateError } = await supabase
        .from('saved_scents')
        .update({
          share_token: newShareToken,
          is_public: true,
          share_count: shareCount + 1,
          last_shared_at: new Date().toISOString(),
        })
        .eq('id', fragranceId);

      if (updateError) throw updateError;

      // Create referral entry
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: user.id,
          referral_code: newReferralCode,
          fragrance_id: fragranceId,
        });

      if (referralError) throw referralError;

      setShareToken(newShareToken);
      setReferralCode(newReferralCode);
      onShareCreated(newShareToken, newReferralCode);

      toast({
        title: 'Share link created!',
        description: 'Your fragrance is now ready to share.',
      });
    } catch (error: any) {
      console.error('Error generating share link:', error);
      toast({
        title: 'Failed to create share link',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const shareUrl = shareToken && referralCode
    ? `${window.location.origin}/shared/fragrance/${shareToken}?ref=${referralCode}`
    : '';

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link copied!',
      description: 'Share link copied to clipboard.',
    });
  };

  const shareToWhatsApp = () => {
    const message = `Check out my custom fragrance "${fragranceName}" on BAZUKI! Get ₹100 off when you order: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share "{fragranceName}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!shareToken || !referralCode ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">
                Create a shareable link and get rewards when friends order!
              </p>
              <Button onClick={generateShareLink} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Share Link'}
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <p className="font-semibold text-lg mb-1">₹100 off for you & your friend!</p>
                <p className="text-sm text-muted-foreground">
                  When your friend orders, you both get ₹100 discount
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Share Link</label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="text-sm" />
                  <Button size="icon" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Referral Code</label>
                <Input value={referralCode} readOnly className="font-mono text-center" />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Share via</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={shareToWhatsApp}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={shareToFacebook}>
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                </div>
              </div>

              {shareCount > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  Shared {shareCount} {shareCount === 1 ? 'time' : 'times'}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
