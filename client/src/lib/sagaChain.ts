import { defineChain } from 'viem';

export const sagaChain = defineChain({
  id: 2763783314764000,
  name: 'Saga - openxr',
  nativeCurrency: { name: 'XRT', symbol: 'XRT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://openxr-2763783314764000-1.jsonrpc.sagarpc.io'],
      webSocket: ['https://openxr-2763783314764000-1.ws.sagarpc.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Saga Explorer',
      url: 'https://openxr-2763783314764000-1.sagaexplorer.io',
    },
  },
  testnet: false,
});

export const SAGA_CHAIN_CONFIG = {
  chainId: 'openxr_2763783314764000-1',
  rpcUrl: 'https://openxr-2763783314764000-1.jsonrpc.sagarpc.io',
  wsUrl: 'https://openxr-2763783314764000-1.ws.sagarpc.io',
  blockExplorer: 'https://openxr-2763783314764000-1.sagaexplorer.io/',
  gasReturnAccount: '0x31Ae3219702319430a6940AE201c5e8b4D5fe7F1',
  networkId: 2763783314764000,
};

export const GAME_LICENSING_CONFIG = {
  contractAddress: '0x91C7B6f8905060D6aE711878020DB15E90C697E0',
  arLensesGameId: 1,
  arLensesPrice: 2324, // XRT tokens
};

export const PRIVY_CHAINS = [
  {
    chainId: SAGA_CHAIN_CONFIG.networkId,
    name: 'Saga Chainlet (OpenXR)',
    rpcUrl: SAGA_CHAIN_CONFIG.rpcUrl,
    nativeCurrency: {
      name: 'XRT',
      symbol: 'XRT',
      decimals: 18,
    },
    blockExplorerUrl: SAGA_CHAIN_CONFIG.blockExplorer,
  },
];
