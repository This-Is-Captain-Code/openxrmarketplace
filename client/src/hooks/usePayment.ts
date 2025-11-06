import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { 
  encodeFunctionData, 
  createWalletClient, 
  custom,
  serializeTransaction,
  parseTransaction,
  type TransactionSerializable
} from 'viem';
import { FLUENT_TESTNET } from '@/lib/paymentService';
import {
  verifyPayment,
  settlePayment,
  PAYMENT_CONFIG,
  type PaymentDetails,
  type VerifyResponse,
  type SettleResponse,
} from '@/lib/paymentService';

const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null);
  const [settleResult, setSettleResult] = useState<SettleResponse | null>(null);
  const { user, sendTransaction } = usePrivy();
  const { wallets } = useWallets();

  const ensureCorrectNetwork = async () => {
    if (wallets.length === 0) {
      throw new Error('No wallet connected. Please connect a wallet first.');
    }

    const activeWallet = wallets[0];

    try {
      await activeWallet.switchChain(PAYMENT_CONFIG.chainId);
      console.log(`Successfully switched to Fluent Testnet (${PAYMENT_CONFIG.chainId})`);
    } catch (err: any) {
      console.error('Network switch error:', err);
      
      if (activeWallet.walletClientType === 'privy') {
        throw new Error('Unable to switch to Fluent Testnet. Embedded wallets may have limited chain support.');
      }
      
      const provider = await activeWallet.getEthereumProvider().catch(() => null);
      if (!provider) {
        throw new Error('Please switch to Fluent Testnet manually in your wallet');
      }

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${PAYMENT_CONFIG.chainId.toString(16)}` }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${PAYMENT_CONFIG.chainId.toString(16)}`,
                chainName: 'Fluent Testnet',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [PAYMENT_CONFIG.rpcUrl],
                blockExplorerUrls: ['https://blockscout.dev.thefluent.xyz'],
              }],
            });
          } catch (addError: any) {
            throw new Error('Failed to add Fluent Testnet to your wallet. Please add it manually.');
          }
        } else {
          throw new Error('Failed to switch network. Please switch to Fluent Testnet manually in your wallet.');
        }
      }
    }
  };

  const processPayment = async () => {
    setLoading(true);
    setError(null);
    setVerifyResult(null);
    setSettleResult(null);

    try {
      await ensureCorrectNetwork();

      if (wallets.length === 0) {
        throw new Error('No wallet connected. Please connect a wallet first.');
      }

      const activeWallet = wallets[0];
      const walletAddress = activeWallet.address;

      console.log('Creating transaction for signing (no gas required from user)...');

      // Get the ethereum provider from the wallet
      const provider = await activeWallet.getEthereumProvider();

      // Create a wallet client using viem
      const walletClient = createWalletClient({
        account: walletAddress as `0x${string}`,
        chain: FLUENT_TESTNET,
        transport: custom(provider),
      });

      // Get the current nonce
      const nonceHex = await provider.request({
        method: 'eth_getTransactionCount',
        params: [walletAddress, 'latest'],
      }) as string;
      
      const nonce = parseInt(nonceHex, 16);

      // Encode the ERC20 transfer function call
      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [
          PAYMENT_CONFIG.recipientAddress as `0x${string}`,
          BigInt(PAYMENT_CONFIG.lensPaymentAmount),
        ],
      });

      // Create the transaction object WITHOUT gas parameters
      // The x402 facilitator will add gas when broadcasting
      const transaction: TransactionSerializable = {
        to: PAYMENT_CONFIG.fluidTokenAddress as `0x${string}`,
        data,
        value: BigInt(0),
        nonce,
        chainId: PAYMENT_CONFIG.chainId,
      };

      console.log('Requesting user signature (no gas fee - facilitator pays)...');
      
      // Sign the transaction using viem's signTransaction
      let signedTransaction: string;
      try {
        signedTransaction = await walletClient.signTransaction(transaction);
        console.log('Transaction signed successfully');
      } catch (signError: any) {
        console.error('Signing error:', signError);
        throw new Error(
          signError?.message || 
          'Failed to sign transaction. Please ensure your wallet supports transaction signing.'
        );
      }

      const paymentDetails: PaymentDetails = {
        networkId: PAYMENT_CONFIG.networkId,
        amount: PAYMENT_CONFIG.lensPaymentAmount,
        to: PAYMENT_CONFIG.recipientAddress,
        from: walletAddress,
        scheme: PAYMENT_CONFIG.scheme,
        tokenAddress: PAYMENT_CONFIG.fluidTokenAddress,
      };

      console.log('Verifying payment with x402 facilitator...');
      const verifyRes = await verifyPayment(signedTransaction, paymentDetails);
      setVerifyResult(verifyRes);
      console.log('Payment verified:', verifyRes);

      console.log('Settling payment (facilitator broadcasts and pays gas)...');
      const settleRes = await settlePayment(
        signedTransaction,
        paymentDetails,
        verifyRes.transactionId
      );
      setSettleResult(settleRes);
      console.log('Payment settled by facilitator:', settleRes);

      return {
        success: true,
        txHash: settleRes.txHash,
        blockNumber: settleRes.blockNumber,
      };
    } catch (err: any) {
      console.error('Payment error:', err);
      // Handle errors more gracefully
      let errorMessage = 'Payment failed';
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.reason) {
        errorMessage = err.reason;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    processPayment,
    loading,
    error,
    verifyResult,
    settleResult,
  };
}
