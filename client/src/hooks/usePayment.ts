import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
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
  const { user, sendTransaction, getEthereumProvider } = usePrivy();

  const ensureCorrectNetwork = async () => {
    const provider = await getEthereumProvider();
    if (!provider) {
      throw new Error('No Ethereum provider available');
    }

    try {
      const chainIdHex = await provider.request({ method: 'eth_chainId' }) as string;
      const currentChainId = parseInt(chainIdHex, 16);

      if (currentChainId !== PAYMENT_CONFIG.chainId) {
        console.log(`Switching from chain ${currentChainId} to Fluent Testnet (${PAYMENT_CONFIG.chainId})`);
        
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${PAYMENT_CONFIG.chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
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
          } else {
            throw switchError;
          }
        }
      }
    } catch (err: any) {
      console.error('Network switch error:', err);
      throw new Error('Please switch to Fluent Testnet in your wallet');
    }
  };

  const processPayment = async () => {
    setLoading(true);
    setError(null);
    setVerifyResult(null);
    setSettleResult(null);

    try {
      if (!user?.wallet) {
        throw new Error('No wallet connected');
      }

      await ensureCorrectNetwork();

      const walletAddress = user.wallet.address;

      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [
          PAYMENT_CONFIG.recipientAddress as `0x${string}`,
          BigInt(PAYMENT_CONFIG.lensPaymentAmount),
        ],
      });

      const txRequest = {
        to: PAYMENT_CONFIG.fluidTokenAddress as `0x${string}`,
        data,
        chainId: PAYMENT_CONFIG.chainId,
      };

      console.log('Sending transaction...', txRequest);

      const txResponse = await sendTransaction(txRequest);
      const txHash = typeof txResponse === 'string' ? txResponse : txResponse.hash;

      console.log('Transaction hash:', txHash);

      const paymentDetails: PaymentDetails = {
        networkId: PAYMENT_CONFIG.networkId,
        amount: PAYMENT_CONFIG.lensPaymentAmount,
        to: PAYMENT_CONFIG.recipientAddress,
        from: walletAddress,
        scheme: PAYMENT_CONFIG.scheme,
        tokenAddress: PAYMENT_CONFIG.fluidTokenAddress,
      };

      console.log('Verifying payment...');
      const verifyRes = await verifyPayment(txHash, paymentDetails);
      setVerifyResult(verifyRes);
      console.log('Payment verified:', verifyRes);

      console.log('Settling payment...');
      const settleRes = await settlePayment(
        txHash,
        paymentDetails,
        verifyRes.transactionId
      );
      setSettleResult(settleRes);
      console.log('Payment settled:', settleRes);

      return {
        success: true,
        txHash: settleRes.txHash,
        blockNumber: settleRes.blockNumber,
      };
    } catch (err: any) {
      console.error('Payment error:', err);
      const errorMessage = err.message || 'Payment failed';
      setError(errorMessage);
      throw err;
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
