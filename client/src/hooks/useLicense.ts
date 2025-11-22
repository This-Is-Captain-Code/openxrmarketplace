import { useEffect, useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { SAGA_CHAIN_CONFIG, GAME_LICENSING_CONFIG } from '@/lib/sagaChain';
import gameABI from '@/lib/gameABI.json';

export function useLicense(gameId: number = GAME_LICENSING_CONFIG.arLensesGameId) {
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

    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider(SAGA_CHAIN_CONFIG.rpcUrl);
      const contract = new ethers.Contract(
        GAME_LICENSING_CONFIG.contractAddress,
        gameABI,
        provider
      );

      const owns = await contract.hasLicense(gameId, user.wallet.address);
      setHasLicense(owns);
      setError(null);
    } catch (err) {
      console.error('Failed to check license:', err);
      setError(err instanceof Error ? err.message : 'Failed to check license');
      setHasLicense(false);
    } finally {
      setLoading(false);
    }
  }, [user?.wallet?.address, gameId]);

  useEffect(() => {
    checkLicense();
  }, [user?.wallet?.address, gameId, refreshTrigger, checkLicense]);

  const refetch = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return { hasLicense, loading, error, refetch };
}
