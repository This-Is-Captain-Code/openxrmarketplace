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

  const getKeplrProvider = async () => {
    const w = window as any;
    
    // Check if Keplr is available
    if (!w.keplr) {
      throw new Error('Keplr wallet not found');
    }

    // Enable Keplr
    await w.keplr.enable(SAGA_CHAIN_CONFIG.chainId);

    // Get the EVM provider from Keplr
    const provider = w.keplr.providers?.eip155;
    if (!provider) {
      throw new Error('Keplr EVM provider not available');
    }

    return provider;
  };

  const switchToSagaChain = async (provider: any) => {
    try {
      const chainId = await provider.request({ method: 'eth_chainId' });
      const expectedChainId = `0x${SAGA_CHAIN_CONFIG.networkId.toString(16)}`;
      
      if (chainId === expectedChainId) {
        return; // Already on correct chain
      }

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: expectedChainId }],
        });
      } catch (switchErr: any) {
        if (switchErr.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: expectedChainId,
                chainName: 'Saga - openxr',
                rpcUrls: [SAGA_CHAIN_CONFIG.rpcUrl],
                nativeCurrency: {
                  name: 'XRT',
                  symbol: 'XRT',
                  decimals: 18,
                },
                blockExplorerUrls: [SAGA_CHAIN_CONFIG.blockExplorer],
              },
            ],
          });
        } else {
          throw switchErr;
        }
      }
    } catch (err) {
      console.error('Chain switch error:', err);
      throw new Error(`Failed to switch to Saga chain: ${err instanceof Error ? err.message : String(err)}`);
    }
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

    try {
      setLoading(true);

      // Get Keplr provider specifically
      const provider = await getKeplrProvider();

      // Switch to Saga chain
      await switchToSagaChain(provider);

      // Create provider and signer
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      // Verify the signer address matches the connected wallet
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== user.wallet.address.toLowerCase()) {
        throw new Error('Wallet address mismatch. Please switch to your connected wallet.');
      }

      toast({
        title: 'Awaiting wallet confirmation...',
        description: 'Please approve the transaction in your Keplr wallet',
      });

      // Create contract instance with signer
      const contract = new ethers.Contract(
        GAME_LICENSING_CONFIG.contractAddress,
        gameABI,
        signer
      );

      // Parse price
      const priceInWei = ethers.parseEther(GAME_LICENSING_CONFIG.arLensesPrice);

      // Call contract method
      const tx = await contract.purchaseLicense(gameId, {
        value: priceInWei,
      });

      if (!tx) {
        throw new Error('Transaction failed to initialize');
      }

      toast({
        title: 'Processing payment...',
        description: 'Your transaction is being processed',
      });

      // Wait for receipt
      const receipt = await tx.wait(1);

      if (!receipt) {
        throw new Error('Transaction receipt not received');
      }

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
            description: err.message,
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
