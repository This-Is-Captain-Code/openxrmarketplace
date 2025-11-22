import { useEffect, useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { SAGA_CHAIN_CONFIG, GAME_LICENSING_CONFIG } from '@/lib/sagaChain';
import gameABI from '@/lib/gameABI.json';
import { mockLenses } from '@/pages/Marketplace';

// Helper function to convert lens ID to numeric gameId - MUST MATCH LicensePurchaseModal
// Each lens maps to a unique gameId (1-12) on the smart contract
// Throws error if lensId is invalid to prevent bypass to gameId 1
const getLensGameId = (lensId: string): number => {
  const index = mockLenses.findIndex(lens => lens.id === lensId);
  if (index === -1) {
    throw new Error(`Invalid lens ID: ${lensId}. Lens not found in catalog.`);
  }
  return index + 1;
};

export function useLicense(lensId: string) {
  const { user } = usePrivy();
  const [hasLicense, setHasLicense] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const checkLicense = useCallback(async () => {
    if (!user?.wallet?.address) {
      setHasLicense(false);
      return;
    }

    if (!lensId) {
      console.error('useLicense: lensId is required');
      setError('Lens ID is required');
      setHasLicense(false);
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider(SAGA_CHAIN_CONFIG.rpcUrl);
      const contract = new ethers.Contract(
        GAME_LICENSING_CONFIG.contractAddress,
        gameABI,
        provider
      );

      // Convert lensId to numeric gameId (required parameter)
      const numericGameId = getLensGameId(lensId);
      
      // hasLicense expects (gameId: uint256, user: address)
      const owns = await contract.hasLicense(numericGameId, user.wallet.address);
      setHasLicense(owns);
      setError(null);
    } catch (err) {
      console.error('Failed to check license:', err);
      setError(err instanceof Error ? err.message : 'Failed to check license');
      setHasLicense(false);
    } finally {
      setLoading(false);
    }
  }, [user?.wallet?.address, lensId]);

  useEffect(() => {
    checkLicense();
  }, [user?.wallet?.address, lensId, refreshTrigger, checkLicense]);

  const refetch = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return { hasLicense, loading, error, refetch };
}
