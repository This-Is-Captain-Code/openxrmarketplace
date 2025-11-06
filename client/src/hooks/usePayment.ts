import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
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
      console.log('Starting payment process...');
      await ensureCorrectNetwork();
      console.log('Network check complete');

      if (wallets.length === 0) {
        throw new Error('No wallet connected. Please connect a wallet first.');
      }

      const activeWallet = wallets[0];
      const walletAddress = activeWallet.address;

      console.log('Creating transaction for signing...');

      // Get the ethereum provider from the wallet
      const provider = await activeWallet.getEthereumProvider();
      console.log('Got ethereum provider');

      // Get transaction count (nonce) using provider.request directly
      // Use 'pending' to include unconfirmed transactions
      console.log('Fetching nonce...');
      const nonceHex = await provider.request({
        method: 'eth_getTransactionCount',
        params: [walletAddress, 'pending'],
      }) as string;
      const nonce = parseInt(nonceHex, 16);
      console.log('Got nonce:', nonce);

      // Create ERC20 contract interface for encoding the transfer
      const erc20Interface = new ethers.Interface([
        'function transfer(address to, uint256 amount) returns (bool)'
      ]);

      // Convert amount to BigInt for proper encoding
      const amountBigInt = BigInt(PAYMENT_CONFIG.lensPaymentAmount);
      console.log('Transfer amount (wei):', PAYMENT_CONFIG.lensPaymentAmount);
      console.log('Transfer amount (BigInt):', amountBigInt.toString());

      // Encode the transfer function call
      const data = erc20Interface.encodeFunctionData('transfer', [
        PAYMENT_CONFIG.recipientAddress,
        amountBigInt,
      ]);
      console.log('Encoded transfer data:', data);

      // Create the complete transaction object with all required parameters
      // Note: User sees gas estimate in wallet, but x402 facilitator pays the actual gas
      const transaction = {
        from: walletAddress,
        to: PAYMENT_CONFIG.fluidTokenAddress,
        data,
        value: '0x0',
        nonce: `0x${nonce.toString(16)}`,
        chainId: `0x${PAYMENT_CONFIG.chainId.toString(16)}`,
        gas: '0x186a0', // 100000 in hex
        gasPrice: '0x3b9aca00', // 1 gwei in hex
      };

      console.log('Requesting signature (facilitator will pay gas when broadcasting)...');
      console.log('Transaction:', transaction);
      
      // Sign the transaction using eth_signTransaction
      let signedTransaction: string;
      try {
        signedTransaction = await provider.request({
          method: 'eth_signTransaction',
          params: [transaction],
        }) as string;
        console.log('Transaction signed successfully:', signedTransaction);
      } catch (signError: any) {
        console.error('Signing error:', signError);
        throw new Error(
          signError?.message || signError?.toString() ||
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

      console.log('Payment details to send to x402:', JSON.stringify(paymentDetails, null, 2));
      
      // Skip verify step and go directly to settle to avoid x402 API decoding bug
      console.log('Settling payment directly (facilitator broadcasts and pays gas)...');
      const settleRes = await settlePayment(
        signedTransaction,
        paymentDetails
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
