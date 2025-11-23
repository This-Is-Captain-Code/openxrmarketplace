import { Game } from '@/types/game';
import gameCover from '@assets/stock_images/futuristic_gaming_ne_ddadd80d.jpg';

export const mockGames: Game[] = [
  {
    id: '13',
    name: 'UEEAAUUEEAA',
    displayName: 'UEEAAUUEEAA',
    description: 'Immersive AR gaming experience',
    price: 4540,
    coverImage: gameCover,
    url: 'https://alivestudios.8thwall.app/neworldeffects/',
    isMobileOnly: true,
  },
];

export const getGameId = (gameId: string): number => {
  const game = mockGames.find(g => g.id === gameId);
  if (!game) {
    throw new Error(`Invalid game ID: ${gameId}`);
  }
  return parseInt(game.id, 10);
};
