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

      console.log('Creating EIP-3009 gasless authorization...');

      // Get the ethereum provider from the wallet
      const provider = await activeWallet.getEthereumProvider();
      console.log('Got ethereum provider');

      // Generate random 32-byte nonce for EIP-3009 (not sequential like transaction nonce)
      const randomNonce = ethers.hexlify(ethers.randomBytes(32));
      console.log('Generated random nonce:', randomNonce);

      // Set time window for authorization validity
      const validAfter = 0; // Valid immediately
      const validBefore = Math.floor(Date.now() / 1000) + 3600; // Valid for 1 hour
      console.log('Valid after:', validAfter, 'Valid before:', validBefore);

      // Create EIP-712 typed data for TransferWithAuthorization
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

      const message = {
        from: walletAddress,
        to: PAYMENT_CONFIG.recipientAddress,
        value: PAYMENT_CONFIG.lensPaymentAmount,
        validAfter: validAfter,
        validBefore: validBefore,
        nonce: randomNonce,
      };

      console.log('EIP-712 domain:', JSON.stringify(domain, null, 2));
      console.log('EIP-712 message:', JSON.stringify(message, null, 2));

      // Request EIP-712 signature using eth_signTypedData_v4
      // This is truly gasless - wallet doesn't check for ETH balance
      let signature: string;
      try {
        console.log('Requesting EIP-712 signature (gasless - no ETH needed)...');
        
        // Prepare typed data payload for eth_signTypedData_v4
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
          domain: domain,
          message: message,
        };

        signature = await provider.request({
          method: 'eth_signTypedData_v4',
          params: [walletAddress, JSON.stringify(typedData)],
        }) as string;
        
        console.log('EIP-712 signature obtained:', signature);
      } catch (signError: any) {
        console.error('Signing error:', signError);
        throw new Error(
          signError?.message || signError?.toString() ||
          'Failed to sign authorization. Please ensure your wallet supports EIP-712 signatures.'
        );
      }

      // Parse signature into v, r, s components
      const sig = ethers.Signature.from(signature);
      const authorization = {
        from: walletAddress,
        to: PAYMENT_CONFIG.recipientAddress,
        value: PAYMENT_CONFIG.lensPaymentAmount,
        validAfter: validAfter,
        validBefore: validBefore,
        nonce: randomNonce,
        v: sig.v,
        r: sig.r,
        s: sig.s,
      };

      console.log('Authorization object:', JSON.stringify(authorization, null, 2));

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
        authorization,
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
