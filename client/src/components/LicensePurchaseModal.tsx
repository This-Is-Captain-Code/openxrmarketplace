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
  const { user } = usePrivy();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getWalletProvider = () => {
    if (typeof window === 'undefined') return null;

    const w = window as any;
    
    // Check for Keplr first (since user connected with Keplr)
    // Keplr has an EVM provider for EVM chains
    if (w.keplr) {
      // Try to get the Keplr EVM provider
      if (w.keplr.providers?.eip155) {
        return w.keplr.providers.eip155;
      }
      // Keplr might also inject as window.ethereum
      if (w.keplr.ethereum) {
        return w.keplr.ethereum;
      }
    }
    
    // If not Keplr, check for other EVM wallets (but avoid MetaMask if Keplr exists)
    if (w.ethereum) {
      return w.ethereum;
    }
    
    return null;
  };

  const handlePurchase = async () => {
    if (!user?.wallet?.address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    const provider = getWalletProvider();
    if (!provider) {
      toast({
        title: 'Wallet provider not found',
        description: 'Please ensure your Keplr wallet is properly connected',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create ethers provider and signer from the connected wallet
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      
      const contract = new ethers.Contract(
        GAME_LICENSING_CONFIG.contractAddress,
        gameABI,
        signer
      );

      const priceInWei = ethers.parseEther(GAME_LICENSING_CONFIG.arLensesPrice);
      
      toast({
        title: 'Awaiting wallet confirmation...',
        description: 'Check your Keplr wallet to approve the transaction',
      });

      const tx = await contract.purchaseLicense(gameId, {
        value: priceInWei,
      });

      toast({
        title: 'Processing payment...',
        description: 'Your transaction is being processed on Saga',
      });

      const receipt = await tx.wait();

      toast({
        title: 'License purchased!',
        description: `You now have access to AR Lenses for ${GAME_LICENSING_CONFIG.arLensesPrice} XRT`,
      });

      onPurchaseSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Purchase failed:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('user rejected') || err.message.includes('User denied')) {
          toast({
            title: 'Transaction cancelled',
            description: 'You cancelled the transaction in your wallet',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Purchase failed',
            description: err.message.substring(0, 100),
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Purchase failed',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
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
