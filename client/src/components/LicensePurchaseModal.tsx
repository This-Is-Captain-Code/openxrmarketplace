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
        // Try alternate path for newer Keplr versions
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
        // If the chain doesn't exist, try to add it
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
      
      // Get signer and validate
      const signer = await ethersProvider.getSigner();
      if (!signer) {
        throw new Error('Failed to get signer from Keplr');
      }

      // Get user address from signer
      const signerAddress = await signer.getAddress();
      if (!signerAddress) {
        throw new Error('Failed to get address from signer');
      }

      if (signerAddress.toLowerCase() !== user.wallet.address.toLowerCase()) {
        throw new Error(`Address mismatch: Keplr has ${signerAddress}, but app expects ${user.wallet.address}`);
      }

      // Verify we're on the right network (compare as strings to avoid BigInt precision issues)
      const network = await ethersProvider.getNetwork();
      if (String(network.chainId) !== String(SAGA_CHAIN_CONFIG.networkId)) {
        throw new Error(
          `Wrong network detected: You're on chain ${network.chainId}, but should be on ${SAGA_CHAIN_CONFIG.networkId}.`
        );
      }

      // Encode the function call
      const iface = new ethers.Interface(gameABI);
      const data = iface.encodeFunctionData('purchaseLicense', [gameId]);
      if (!data) {
        throw new Error('Failed to encode purchaseLicense function');
      }

      // Parse the value properly - ensure it's a valid BigNumberish value
      const priceStr = String(GAME_LICENSING_CONFIG.arLensesPrice);
      let value: bigint;
      
      try {
        value = ethers.parseEther(priceStr);
      } catch (e) {
        console.error('Failed to parse value:', priceStr, e);
        throw new Error(`Invalid price value: ${priceStr}. Expected a number.`);
      }

      // Send transaction
      const txResponse = await signer.sendTransaction({
        to: GAME_LICENSING_CONFIG.contractAddress,
        data: data,
        value: value,
      });

      if (!txResponse || !txResponse.hash) {
        throw new Error('Transaction was not sent properly');
      }

      toast({
        title: 'Processing payment...',
        description: `Transaction hash: ${txResponse.hash.slice(0, 10)}...`,
      });

      // Wait for receipt
      const receipt = await txResponse.wait(1);

      if (!receipt) {
        throw new Error('Transaction failed to confirm');
      }

      if (receipt.status === 0) {
        throw new Error('Transaction was reverted by the smart contract');
      }

      toast({
        title: 'License purchased!',
        description: `You now have access to AR Lenses. Transaction: ${receipt.hash.slice(0, 10)}...`,
      });

      onPurchaseSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Purchase error:', err);

      let errorMessage = 'An unexpected error occurred';
      
      if (err instanceof Error) {
        if (err.message.includes('user rejected') || err.message.includes('User denied')) {
          errorMessage = 'You cancelled the transaction';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient XRT balance in your wallet';
        } else if (err.message.includes('network') || err.message.includes('chain')) {
          errorMessage = err.message;
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
          <DialogTitle className="text-white text-2xl font-bold">AR Lenses License</DialogTitle>
          <DialogDescription className="text-gray-400">
            Unlock stunning AR effects for a one-time payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-5">
            <div className="flex justify-between items-baseline gap-4">
              <span className="text-sm font-medium text-gray-400">Price</span>
              <div className="text-right">
                <span className="text-4xl font-bold" style={{ color: '#C1FF72' }}>
                  {GAME_LICENSING_CONFIG.arLensesPrice}
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
                <span style={{ color: '#C1FF72' }}>✓</span> Unlimited access to all AR lenses
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span style={{ color: '#C1FF72' }}>✓</span> Real-time AR effects on camera
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span style={{ color: '#C1FF72' }}>✓</span> Photo capture with AR filters
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span style={{ color: '#C1FF72' }}>✓</span> Permanent license (one-time)
              </li>
            </ul>
          </div>

          <Button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full mt-6 bg-black text-black font-semibold hover:bg-opacity-90"
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
              `Purchase for ${GAME_LICENSING_CONFIG.arLensesPrice} XRT`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
