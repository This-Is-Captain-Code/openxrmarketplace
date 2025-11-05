import { Chain } from 'viem';

const API_BASE_URL = 'https://fluentx402.replit.app';

export const FLUENT_TESTNET: Chain = {
  id: 20994,
  name: 'Fluent Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Fluent',
    symbol: 'FLUID',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.fluent.xyz/'],
    },
    public: {
      http: ['https://rpc.testnet.fluent.xyz/'],
    },
  },
  blockExplorers: {
    default: { name: 'Fluent Explorer', url: 'https://testnet.fluentscan.xyz/' },
  },
  testnet: true,
};

export const PAYMENT_CONFIG = {
  networkId: '20994',
  chainId: 20994,
  recipientAddress: '0xb448e18d272291503fb8f3150247e2b4bc817729',
  fluidTokenAddress: '0xd8acBC0d60acCCeeF70D9b84ac47153b3895D3d0',
  rpcUrl: 'https://rpc.testnet.fluent.xyz/',
  lensPaymentAmount: '10000000000000000', // 0.01 FLUID token in wei
  scheme: 'evm-erc20' as const,
};

export interface PaymentDetails {
  networkId: string;
  amount: string;
  to: string;
  from?: string;
  scheme: 'evm-native' | 'evm-erc20';
  tokenAddress?: string;
}

export interface VerifyResponse {
  valid: boolean;
  transactionId?: string;
  message?: string;
}

export interface SettleResponse {
  success: boolean;
  txHash?: string;
  transactionId: string;
  blockNumber?: number;
  message?: string;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  symbol: string;
  explorer: string;
  facilitatorAddress: string;
  walletConfigured: boolean;
  settlementAvailable: boolean;
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error('Payment API health check failed');
  }
  return response.json();
}

export async function getNetworkConfig(): Promise<NetworkConfig> {
  const response = await fetch(`${API_BASE_URL}/api/network`);
  if (!response.ok) {
    throw new Error('Failed to get network configuration');
  }
  return response.json();
}

export async function verifyPayment(
  paymentPayload: string,
  paymentDetails: PaymentDetails
): Promise<VerifyResponse> {
  const response = await fetch(`${API_BASE_URL}/api/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentPayload,
      paymentDetails,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Payment verification failed: ${error}`);
  }

  const result: VerifyResponse = await response.json();
  
  if (!result.valid) {
    throw new Error(result.message || 'Payment verification failed');
  }
  
  return result;
}

export async function settlePayment(
  paymentPayload: string,
  paymentDetails: PaymentDetails,
  transactionId?: string
): Promise<SettleResponse> {
  const response = await fetch(`${API_BASE_URL}/api/settle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentPayload,
      paymentDetails,
      transactionId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Payment settlement failed: ${error}`);
  }

  const result: SettleResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Payment settlement failed');
  }
  
  return result;
}
