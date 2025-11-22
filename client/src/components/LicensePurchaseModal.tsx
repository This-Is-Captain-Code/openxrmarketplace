import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePrivy } from '@privy-io/react-auth';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';
import { SAGA_CHAIN_CONFIG, GAME_LICENSING_CONFIG } from '@/lib/sagaChain';
import gameABI from '@/lib/gameABI.json';
import { Loader2 } from 'lucide-react';

interface LicensePurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseSuccess?: () => void;
  gameId?: number;
}

export default function LicensePurchaseModal({
  open,
  onOpenChange,
  onPurchaseSuccess,
  gameId = GAME_LICENSING_CONFIG.arLensesGameId,
}: LicensePurchaseModalProps) {
  const { user, getEmbeddedWallet } = usePrivy();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user?.wallet?.address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const embeddedWallet = await getEmbeddedWallet();
      if (!embeddedWallet) {
        throw new Error('Embedded wallet not available');
      }

      const provider = new ethers.providers.JsonRpcProvider(SAGA_CHAIN_CONFIG.rpcUrl);
      const signer = provider.getSigner();
      
      const contract = new ethers.Contract(
        GAME_LICENSING_CONFIG.contractAddress,
        gameABI,
        signer
      );

      const priceInWei = ethers.utils.parseEther(GAME_LICENSING_CONFIG.arLensesPrice);
      
      const tx = await contract.purchaseLicense(gameId, {
        value: priceInWei,
      });

      toast({
        title: 'Processing payment...',
        description: 'Your transaction is being processed',
      });

      await tx.wait();

      toast({
        title: 'License purchased!',
        description: `You now have access to AR Lenses for ${GAME_LICENSING_CONFIG.arLensesPrice} XRT`,
      });

      onPurchaseSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Purchase failed:', err);
      toast({
        title: 'Purchase failed',
        description: err instanceof Error ? err.message : 'Failed to purchase license',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase AR Lenses License</DialogTitle>
          <DialogDescription>
            Get unlimited access to AR Lenses for a one-time payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">Price</span>
              <span className="text-2xl font-bold text-white">{GAME_LICENSING_CONFIG.arLensesPrice} XRT</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Pay once, access forever. No recurring charges.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">What you get:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Unlimited access to all AR lenses</li>
              <li>✓ Real-time AR effects on your camera</li>
              <li>✓ Photo capture with AR filters</li>
              <li>✓ Permanent license (one-time payment)</li>
            </ul>
          </div>

          <Button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Purchase for ${GAME_LICENSING_CONFIG.arLensesPrice} XRT`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
