import { useState, useEffect } from 'react';
import { User, Copy, Check, Wallet, RefreshCw } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface CameraControlsProps {
  onCapture: () => void;
  disabled?: boolean;
}

export default function CameraControls({
  onCapture,
  disabled = false
}: CameraControlsProps) {
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const { user, createWallet } = usePrivy();
  const { toast } = useToast();

  const handleCapture = () => {
    if (!disabled) {
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      onCapture();
    }
  };

  const handleCopyAddress = async () => {
    const address = user?.wallet?.address;
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: 'Address copied!',
        description: 'Wallet address copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateWallet = async () => {
    try {
      setCreating(true);
      await createWallet();
      toast({
        title: 'Wallet created!',
        description: 'Your embedded wallet has been created successfully',
      });
    } catch (error) {
      console.error('Failed to create wallet:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create wallet. Please try again.',
      });
    } finally {
      setCreating(false);
    }
  };

  const fetchBalance = async () => {
    const walletAddress = user?.wallet?.address;
    if (!walletAddress) return;

    setLoadingBalance(true);
    try {
      const tokenAddress = '0xd8acBC0d60acCCeeF70D9b84ac47153b3895D3d0';
      const rpcUrl = 'https://rpc.testnet.fluent.xyz/';
      
      const callData = `0x70a08231${walletAddress.slice(2).padStart(64, '0')}`;
      
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: tokenAddress,
              data: callData,
            },
            'latest'
          ],
          id: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`RPC request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'RPC error');
      }

      const balanceHex = data.result;
      const balanceWei = BigInt(balanceHex);
      const balanceEther = Number(balanceWei) / 1e18;

      setBalance(balanceEther.toString());
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance('0');
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (showWalletDialog && user?.wallet?.address) {
      fetchBalance();
    }
  }, [showWalletDialog, user?.wallet?.address]);

  return (
    <>
      <div className="fixed bottom-8 left-0 right-0 z-40 px-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button
            data-testid="button-user-profile"
            size="icon"
            variant="ghost"
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 flex-shrink-0"
            aria-label="User profile"
            onClick={() => setShowWalletDialog(true)}
          >
            <User className="w-5 h-5" />
          </Button>

          <button
            data-testid="button-capture"
            onClick={handleCapture}
            disabled={disabled}
            className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
            aria-label="Capture photo"
          >
            <div className="w-16 h-16 rounded-full bg-white" />
          </button>

          <Button
            data-testid="button-help"
            size="icon"
            variant="ghost"
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 flex-shrink-0"
            aria-label="Help"
          >
            <span className="text-xl">?</span>
          </Button>
        </div>
      </div>

      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Your Wallet
            </DialogTitle>
            <DialogDescription>
              Fund this wallet with FLUID tokens to use AR lenses
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!user?.wallet ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">
                  You don't have an embedded wallet yet. Create one to use AR lenses with micropayments.
                </p>
                <Button
                  data-testid="button-create-wallet"
                  onClick={handleCreateWallet}
                  disabled={creating}
                  className="w-full"
                >
                  {creating ? 'Creating wallet...' : 'Create Wallet'}
                </Button>
              </div>
            ) : (
              <>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      FLUID Balance
                    </label>
                    <Button
                      data-testid="button-refresh-balance"
                      size="icon"
                      variant="ghost"
                      onClick={fetchBalance}
                      disabled={loadingBalance}
                      className="h-6 w-6"
                    >
                      <RefreshCw className={`w-3 h-3 ${loadingBalance ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <div className="text-2xl font-bold" data-testid="text-fluid-balance">
                    {loadingBalance ? (
                      <span className="text-muted-foreground">Loading...</span>
                    ) : balance !== null && !isNaN(parseFloat(balance)) ? (
                      <span>{parseFloat(balance).toFixed(2)} FLUID</span>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Each lens costs 1 FLUID token
                    {balance === '0' && !loadingBalance && (
                      <span className="block mt-1 text-amber-500">⚠️ Unable to verify balance. Visit block explorer to check.</span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Wallet Address
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <code 
                      data-testid="text-wallet-address"
                      className="flex-1 p-3 bg-muted rounded-md text-sm font-mono break-all"
                    >
                      {user.wallet.address}
                    </code>
                    <Button
                      data-testid="button-copy-address"
                      size="icon"
                      variant="outline"
                      onClick={handleCopyAddress}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2 text-sm">
              <h4 className="font-medium">How to fund your wallet:</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Copy your wallet address above</li>
                <li>Get FLUID tokens from the Fluent Testnet faucet</li>
                <li>Send FLUID tokens to this address</li>
                <li>Each lens costs 1 FLUID token to open</li>
              </ol>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>Network:</strong> Fluent Testnet (Chain ID: 20994)
                <br />
                <strong>Token:</strong> FLUID (0xd8ac...3d0)
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
