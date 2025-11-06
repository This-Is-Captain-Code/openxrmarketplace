import { useState, useCallback } from 'react';
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
import {
  PaymentCacheManager,
  type CachedAuthorization,
} from '@/lib/paymentCache';

const BATCH_SIZE = 10;

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null);
  const [settleResult, setSettleResult] = useState<SettleResponse | null>(null);
  const [remainingAuthorizations, setRemainingAuthorizations] = useState(0);
  const { user, sendTransaction } = usePrivy();
  const { wallets } = useWallets();

  const updateRemainingCount = useCallback((walletAddress: string) => {
    const count = PaymentCacheManager.getRemainingCount(walletAddress);
    setRemainingAuthorizations(count);
  }, []);

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

  const generateBatchAuthorizations = async () => {
    // Note: Loading state is managed by processPayment - don't reset it here
    try {
      console.log(`Generating batch of ${BATCH_SIZE} payment authorizations...`);
      await ensureCorrectNetwork();

      if (wallets.length === 0) {
        throw new Error('No wallet connected. Please connect a wallet first.');
      }

      const activeWallet = wallets[0];
      const walletAddress = activeWallet.address;
      const provider = await activeWallet.getEthereumProvider();

      const domain = PAYMENT_CONFIG.eip712Domain;
      const types = {
        TransferWithAuthorization: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'validAfter', type: 'uint256' },
          { name: 'validBefore', type: 'uint256' },
          { name: 'nonce', type: 'bytes32' },
        ],
      };

      const validAfter = 0;
      const validBefore = Math.floor(Date.now() / 1000) + 3600; // 1 hour validity

      const authorizations: CachedAuthorization[] = [];

      // Generate and sign each authorization
      for (let i = 0; i < BATCH_SIZE; i++) {
        const randomNonce = ethers.hexlify(ethers.randomBytes(32));
        
        const message = {
          from: walletAddress,
          to: PAYMENT_CONFIG.recipientAddress,
          value: PAYMENT_CONFIG.lensPaymentAmount,
          validAfter,
          validBefore,
          nonce: randomNonce,
        };

        const typedData = {
          types: {
            EIP712Domain: [
              { name: 'name', type: 'string' },
              { name: 'version', type: 'string' },
              { name: 'chainId', type: 'uint256' },
              { name: 'verifyingContract', type: 'address' },
            ],
            TransferWithAuthorization: types.TransferWithAuthorization,
          },
          primaryType: 'TransferWithAuthorization',
          domain,
          message,
        };

        console.log(`Requesting signature ${i + 1}/${BATCH_SIZE}...`);

        const signature = await provider.request({
          method: 'eth_signTypedData_v4',
          params: [walletAddress, JSON.stringify(typedData)],
        }) as string;

        const sig = ethers.Signature.from(signature);

        authorizations.push({
          from: walletAddress,
          to: PAYMENT_CONFIG.recipientAddress,
          value: PAYMENT_CONFIG.lensPaymentAmount,
          validAfter: validAfter.toString(),
          validBefore: validBefore.toString(),
          nonce: randomNonce,
          v: sig.v,
          r: sig.r,
          s: sig.s,
          used: false,
        });

        console.log(`Authorization ${i + 1}/${BATCH_SIZE} signed`);
      }

      // Save to cache
      PaymentCacheManager.addAuthorizations(walletAddress, authorizations);
      updateRemainingCount(walletAddress);

      console.log(`Successfully generated and cached ${BATCH_SIZE} authorizations`);

      return authorizations;
    } catch (err: any) {
      console.error('Batch generation error:', err);
      let errorMessage = 'Failed to generate payment authorizations';
      if (err?.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      throw new Error(errorMessage);
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

      if (wallets.length === 0) {
        throw new Error('No wallet connected. Please connect a wallet first.');
      }

      const activeWallet = wallets[0];
      const walletAddress = activeWallet.address;

      // Check cache for unused authorization
      let authorization = PaymentCacheManager.getNextUnusedAuthorization(walletAddress);

      if (!authorization) {
        console.log('No cached authorizations available, generating new batch...');
        const newAuthorizations = await generateBatchAuthorizations();
        authorization = newAuthorizations[0];
      }

      console.log('Using cached authorization with nonce:', authorization.nonce);

      const paymentDetails: PaymentDetails = {
        networkId: PAYMENT_CONFIG.networkId,
        amount: PAYMENT_CONFIG.lensPaymentAmount,
        to: PAYMENT_CONFIG.recipientAddress,
        from: walletAddress,
        scheme: PAYMENT_CONFIG.scheme,
        tokenAddress: PAYMENT_CONFIG.fluidTokenAddress,
      };

      console.log('Payment details to send to x402:', JSON.stringify(paymentDetails, null, 2));
      
      // Send EIP-3009 authorization to x402 facilitator for settlement
      console.log('Settling gasless payment (facilitator broadcasts and pays all gas)...');
      const settleRes = await settlePayment(
        JSON.stringify(authorization),
        paymentDetails
      );
      setSettleResult(settleRes);
      console.log('Payment settled by facilitator:', settleRes);

      // Mark authorization as used
      PaymentCacheManager.markAuthorizationAsUsed(walletAddress, authorization.nonce);
      updateRemainingCount(walletAddress);

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
    generateBatchAuthorizations,
    loading,
    error,
    verifyResult,
    settleResult,
    remainingAuthorizations,
    updateRemainingCount,
  };
}
