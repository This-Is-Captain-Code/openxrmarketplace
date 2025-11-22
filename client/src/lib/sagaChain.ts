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
