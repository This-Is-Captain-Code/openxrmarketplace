import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { SAGA_CHAIN_CONFIG, GAME_LICENSING_CONFIG } from '@/lib/sagaChain';
import gameABI from '@/lib/gameABI.json';

export function useLicense(gameId: number = GAME_LICENSING_CONFIG.arLensesGameId) {
  const { user } = usePrivy();
  const [hasLicense, setHasLicense] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkLicense = async () => {
      if (!user?.wallet?.address) {
        setHasLicense(false);
        return;
      }

      try {
        setLoading(true);
        const provider = new ethers.providers.JsonRpcProvider(SAGA_CHAIN_CONFIG.rpcUrl);
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
    };

    checkLicense();
  }, [user?.wallet?.address, gameId]);

  return { hasLicense, loading, error };
}
