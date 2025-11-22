import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePrivy } from '@privy-io/react-auth';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';
import { SAGA_CHAIN_CONFIG, GAME_LICENSING_CONFIG } from '@/lib/sagaChain';
import gameABI from '@/lib/gameABI.json';
import { Loader2 } from 'lucide-react';
import { mockLenses } from '@/pages/Marketplace';

// Helper function to convert lens ID to numeric gameId
const getLensGameId = (lensId: string): number => {
  const index = mockLenses.findIndex(lens => lens.id === lensId);
  return index !== -1 ? index + 1 : parseInt(lensId) || 1;
};

interface LicensePurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseSuccess?: () => void;
  gameId?: number;
  lensId?: string;
  price?: number;
  title?: string;
}

export default function LicensePurchaseModal({
  open,
  onOpenChange,
  onPurchaseSuccess,
  gameId = GAME_LICENSING_CONFIG.arLensesGameId,
  lensId,
  price = GAME_LICENSING_CONFIG.arLensesPrice,
  title = 'AR Filter License',
}: LicensePurchaseModalProps) {
  const { user } = usePrivy();
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

      const w = window as any;
      
      if (!w.keplr) {
        throw new Error('Keplr wallet not found. Please install Keplr extension.');
      }

      // Get the EVM provider from Keplr
      let provider = w.keplr.providers?.eip155;
      if (!provider) {
        provider = w.keplr.ethereum;
      }
      
      if (!provider) {
        throw new Error('Keplr EVM provider not available. Please upgrade Keplr.');
      }

      toast({
        title: 'Requesting network switch...',
        description: 'Please approve switching to Saga network in your Keplr wallet',
      });

      // Request Keplr to switch to Saga network
      const chainIdHex = `0x${SAGA_CHAIN_CONFIG.networkId.toString(16)}`;
      
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: chainIdHex,
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
          } catch (addError) {
            throw new Error('Failed to add Saga network to Keplr');
          }
        } else {
          throw switchError;
        }
      }

      toast({
        title: 'Awaiting wallet confirmation...',
        description: 'Please approve the transaction in your Keplr wallet',
      });

      // Create ethers provider from Keplr
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      
      if (!signer) {
        throw new Error('Failed to get signer from Keplr');
      }

      const signerAddress = await signer.getAddress();
      if (!signerAddress) {
        throw new Error('Failed to get address from signer');
      }

      if (signerAddress.toLowerCase() !== user.wallet.address.toLowerCase()) {
        throw new Error(`Address mismatch`);
      }

      // Verify network - skip if chainId check fails to avoid BigInt conversion issues
      try {
        const network = await ethersProvider.getNetwork();
        const expectedChainId = SAGA_CHAIN_CONFIG.networkId;
        if (network.chainId !== expectedChainId) {
          console.warn(`Network mismatch: expected ${expectedChainId}, got ${network.chainId}`);
        }
      } catch (networkError) {
        console.warn('Could not verify network:', networkError);
      }

      const numericGameId = lensId ? getLensGameId(lensId) : gameId;
      
      // Parse value
      const priceStr = String(price);
      const valueInWei = ethers.parseEther(priceStr);

      console.log('Purchasing license with gameId:', numericGameId, 'price:', valueInWei.toString());

      // Encode the function call manually
      const iface = new ethers.Interface(gameABI);
      const data = iface.encodeFunctionData('purchaseLicense', [ethers.toBigInt(numericGameId)]);
      
      console.log('Encoded data:', data);
      console.log('Signer:', signerAddress);
      
      // Use provider's request method directly to avoid ethers.js parsing issues
      try {
        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: signerAddress,
            to: GAME_LICENSING_CONFIG.contractAddress,
            data: data,
            value: valueInWei.toString().startsWith('0x') ? valueInWei.toString() : '0x' + valueInWei.toString(16)
          }]
        });

        if (!txHash) {
          throw new Error('Transaction failed to send');
        }

        console.log('Transaction hash:', txHash);

        toast({
          title: 'License purchased!',
          description: `Transaction submitted`,
        });

        onPurchaseSuccess?.();
        onOpenChange(false);
      } catch (rpcError) {
        console.error('RPC error:', rpcError);
        throw rpcError;
      }
    } catch (err) {
      console.error('Purchase error:', err);

      let errorMessage = 'An unexpected error occurred';
      
      if (err instanceof Error) {
        if (err.message.includes('user rejected')) {
          errorMessage = 'You cancelled the transaction';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient XRT balance';
        } else {
          errorMessage = err.message;
        }
      }

      toast({
        title: 'Purchase failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Unlock this AR effect for a one-time payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-5">
            <div className="flex justify-between items-baseline gap-4">
              <span className="text-sm font-medium text-gray-400">Price</span>
              <div className="text-right">
                <span className="text-4xl font-bold" style={{ color: '#C1FF72' }}>
                  {price}
                </span>
                <span className="text-sm text-gray-400 ml-2">XRT</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Pay once • Access forever • No recurring charges
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">What you get:</h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2 text-gray-300">
                <span style={{ color: '#C1FF72' }}>✓</span> Unlimited use of this AR filter
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span style={{ color: '#C1FF72' }}>✓</span> Real-time AR effects on camera
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span style={{ color: '#C1FF72' }}>✓</span> Photo capture with this filter
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span style={{ color: '#C1FF72' }}>✓</span> Permanent license (one-time)
              </li>
            </ul>
          </div>

          <Button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full mt-6 text-black font-semibold"
            style={{ backgroundColor: '#C1FF72' }}
            size="lg"
            data-testid="button-purchase-license"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Purchase for ${price} XRT`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
