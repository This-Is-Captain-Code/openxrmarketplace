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
// Each lens maps to a unique gameId (1-12) on the smart contract
// Throws error if lensId is invalid to prevent bypass to gameId 1
const getLensGameId = (lensId: string): number => {
  const index = mockLenses.findIndex(lens => lens.id === lensId);
  if (index === -1) {
    throw new Error(`Invalid lens ID: ${lensId}. Lens not found in catalog.`);
  }
  return index + 1;
};

interface LicensePurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseSuccess?: () => void;
  lensId: string; // REQUIRED - each lens has unique gameId
  price?: number;
  title?: string;
}

export default function LicensePurchaseModal({
  open,
  onOpenChange,
  onPurchaseSuccess,
  lensId,
  price = GAME_LICENSING_CONFIG.arLensesPrice,
  title = 'AR Filter License',
}: LicensePurchaseModalProps) {
  const { user } = usePrivy();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    console.log('🚀 Starting purchase flow...');
    
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
      console.log('✓ User wallet address:', user.wallet.address);

      const w = window as any;
      
      if (!w.keplr) {
        throw new Error('Keplr wallet not found. Please install Keplr extension.');
      }
      console.log('✓ Keplr detected');

      // Get the EVM provider from Keplr
      let provider = w.keplr.providers?.eip155;
      if (!provider) {
        provider = w.keplr.ethereum;
      }
      
      if (!provider) {
        throw new Error('Keplr EVM provider not available. Please upgrade Keplr.');
      }
      console.log('✓ Keplr EVM provider found');

      toast({
        title: 'Requesting network switch...',
        description: 'Please approve switching to Saga network in your Keplr wallet',
      });

      // Request Keplr to switch to Saga network
      const chainIdHex = `0x${SAGA_CHAIN_CONFIG.networkId.toString(16)}`;
      console.log('📡 Requesting chain switch to:', chainIdHex, '(', SAGA_CHAIN_CONFIG.networkId, ')');
      
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
        console.log('✓ Network switched successfully');
      } catch (switchError: any) {
        console.log('Network switch error:', switchError);
        if (switchError.code === 4902) {
          console.log('Chain not found, adding it...');
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
            console.log('✓ Chain added successfully');
          } catch (addError) {
            console.error('Failed to add chain:', addError);
            throw new Error('Failed to add Saga network to Keplr');
          }
        } else {
          throw switchError;
        }
      }

      toast({
        title: 'Preparing transaction...',
        description: 'Checking your balance and preparing the purchase',
      });

      // Create ethers provider from Keplr
      console.log('Creating ethers provider...');
      const ethersProvider = new ethers.BrowserProvider(provider);
      console.log('Getting signer...');
      const signer = await ethersProvider.getSigner();
      
      if (!signer) {
        throw new Error('Failed to get signer from Keplr');
      }
      console.log('✓ Signer obtained');

      const signerAddress = await signer.getAddress();
      if (!signerAddress) {
        throw new Error('Failed to get address from signer');
      }
      console.log('✓ Signer address:', signerAddress);

      if (signerAddress.toLowerCase() !== user.wallet.address.toLowerCase()) {
        throw new Error(`Address mismatch: Keplr=${signerAddress}, Privy=${user.wallet.address}`);
      }

      // Verify network
      console.log('Verifying network...');
      const network = await ethersProvider.getNetwork();
      console.log('Current network chainId:', network.chainId.toString());
      console.log('Expected chainId:', SAGA_CHAIN_CONFIG.networkId);
      
      if (String(network.chainId) !== String(SAGA_CHAIN_CONFIG.networkId)) {
        throw new Error(`Wrong network: Connected to ${network.chainId}, need ${SAGA_CHAIN_CONFIG.networkId}`);
      }
      console.log('✓ Network verified');

      // Check wallet balance
      console.log('Checking balance...');
      const balance = await ethersProvider.getBalance(signerAddress);
      const balanceInXRT = ethers.formatEther(balance);
      console.log('💰 Wallet address:', signerAddress);
      console.log('💰 Balance in Wei:', balance.toString());
      console.log('💰 Balance in XRT:', balanceInXRT);

      // Convert lensId to numeric gameId (required parameter)
      if (!lensId) {
        throw new Error('Lens ID is required for purchase');
      }
      const numericGameId = getLensGameId(lensId);
      
      console.log('Purchasing license for lensId:', lensId, 'gameId:', numericGameId);

      // Parse price in Wei - user provides price in XRT tokens
      const priceStr = String(price);
      const valueInWei = ethers.parseEther(priceStr);
      
      // Calculate total cost (value + gas)
      const gasLimit = 300000;
      const gasPrice = ethers.toBigInt('1000000000'); // 1 gwei
      const gasCost = ethers.toBigInt(gasLimit) * gasPrice;
      const totalCost = valueInWei + gasCost;
      const totalCostInXRT = ethers.formatEther(totalCost);
      
      console.log('Price in XRT:', priceStr);
      console.log('Value in Wei:', valueInWei.toString());
      console.log('Gas cost in Wei:', gasCost.toString());
      console.log('Gas cost in XRT:', ethers.formatEther(gasCost));
      console.log('Total cost in XRT:', totalCostInXRT);

      // Check if balance is sufficient
      if (balance < totalCost) {
        const shortfall = ethers.formatEther(totalCost - balance);
        throw new Error(
          `Insufficient balance. You have ${balanceInXRT} XRT but need ${totalCostInXRT} XRT (${priceStr} for purchase + ${ethers.formatEther(gasCost)} for gas). You need ${shortfall} more XRT.`
        );
      }

      // Create contract instance with signer
      const contract = new ethers.Contract(
        GAME_LICENSING_CONFIG.contractAddress,
        gameABI,
        signer
      );

      console.log('Calling purchaseLicense on contract...');
      console.log('GameId:', numericGameId);
      console.log('Value:', valueInWei.toString(), 'XRT');

      // Call purchaseLicense directly on the contract
      const txResponse = await contract.purchaseLicense(numericGameId, {
        value: valueInWei,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
      });

      if (!txResponse || !txResponse.hash) {
        throw new Error('Transaction failed to send');
      }

      toast({
        title: 'Processing payment...',
        description: 'Waiting for confirmation...',
      });

      // Wait for receipt
      const receipt = await txResponse.wait(1);

      if (!receipt) {
        throw new Error('Transaction failed to confirm');
      }

      if (receipt.status === 0) {
        throw new Error('Transaction reverted');
      }

      toast({
        title: 'License purchased!',
        description: 'You now have access to AR Lenses!',
      });

      onPurchaseSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error('❌ Purchase error:', err);
      console.error('Error type:', typeof err);
      console.error('Error keys:', err ? Object.keys(err) : 'null');
      console.error('Error JSON:', JSON.stringify(err, null, 2));

      let errorMessage = 'An unexpected error occurred';
      let errorTitle = 'Purchase failed';
      
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        
        if (err.message.includes('user rejected') || err.message.includes('User Rejected')) {
          errorTitle = 'Transaction cancelled';
          errorMessage = 'You cancelled the transaction in your wallet';
        } else if (err.message.includes('Insufficient balance')) {
          errorTitle = 'Insufficient balance';
          errorMessage = err.message;
        } else if (err.message.includes('insufficient funds')) {
          errorTitle = 'Insufficient balance';
          errorMessage = 'Not enough XRT to cover the transaction cost and gas fees';
        } else {
          errorMessage = err.message;
        }
      } else if (err && typeof err === 'object') {
        // Handle non-Error objects
        const errObj = err as any;
        if (errObj.message) {
          errorMessage = errObj.message;
        } else if (errObj.error && errObj.error.message) {
          errorMessage = errObj.error.message;
        } else {
          errorMessage = 'Unknown error: ' + JSON.stringify(err);
        }
      }

      toast({
        title: errorTitle,
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
