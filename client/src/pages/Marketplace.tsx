import { useLocation } from 'wouter';
import { Sparkles, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import AuthGuard from '@/components/AuthGuard';
import { Lens } from '@/types/lens';

import lens1Cover from '@assets/stock_images/neon_holographic_dig_cf917332.jpg';
import lens2Cover from '@assets/stock_images/neon_holographic_dig_ac0b06f5.jpg';
import lens3Cover from '@assets/stock_images/neon_holographic_dig_044898d4.jpg';
import lens4Cover from '@assets/stock_images/neon_holographic_dig_7a39874b.jpg';
import lens5Cover from '@assets/stock_images/abstract_colorful_ne_295e1b8b.jpg';
import lens6Cover from '@assets/stock_images/abstract_colorful_ne_e89d8789.jpg';
import lens7Cover from '@assets/stock_images/abstract_colorful_ne_24f0d0e6.jpg';
import lens8Cover from '@assets/stock_images/abstract_colorful_ne_1d0370e8.jpg';
import lens9Cover from '@assets/stock_images/abstract_colorful_ne_964f7ab1.jpg';
import lens10Cover from '@assets/stock_images/abstract_colorful_ne_b03a8a6a.jpg';
import lens11Cover from '@assets/stock_images/abstract_colorful_ne_fb8d66af.jpg';
import lens12Cover from '@assets/stock_images/abstract_colorful_ne_e3db35e9.jpg';

export const mockLenses: Lens[] = [
  { id: '887d80da-f4ba-4a40-a0d6-4e4d0cfb31b1', name: 'Lens 01', displayName: 'Cosmic Vibes', coverImage: lens1Cover, groupId: 'b5551368-7881-4a23-a034-a0e757ec85a7' },
  { id: '43276710876', name: 'Lens 02', displayName: 'Rainbow Blast', coverImage: lens2Cover, groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43276930875', name: 'Lens 03', displayName: 'Pixel Paradise', coverImage: lens3Cover, groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43281170875', name: 'Lens 04', displayName: 'Electric Dreams', coverImage: lens4Cover, groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43288720877', name: 'Lens 05', displayName: 'Prism Party', coverImage: lens5Cover, groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43288930875', name: 'Lens 06', displayName: 'Neon Nights', coverImage: lens6Cover, groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43290810875', name: 'Lens 07', displayName: 'Retro Wave', coverImage: lens7Cover, groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43290830875', name: 'Lens 08', displayName: 'Glitch Mode', coverImage: lens8Cover, groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43293650876', name: 'Lens 09', displayName: 'Crystal Burst', coverImage: lens9Cover, groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43294710875', name: 'Lens 10', displayName: 'Vapor Dreams', coverImage: lens10Cover, groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43296870875', name: 'Lens 11', displayName: 'Cyber Glow', coverImage: lens11Cover, groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43296900875', name: 'Lens 12', displayName: 'Laser Lights', coverImage: lens12Cover, groupId: '2a385df2-4591-47df-9594-b273b456c862' },
];

function MarketplaceContent() {
  const [, setLocation] = useLocation();
  const { logout } = usePrivy();

  const handleLensClick = (lens: Lens) => {
    setLocation(`/camera/${lens.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">AR Lens Collection</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setLocation('/')}
              variant="ghost" className="text-white hover:bg-white/20"
              size="sm"
              data-testid="button-back-home"
            >
              Back
            </Button>
            <Button
              onClick={logout}
              size="icon"
              variant="ghost" className="text-white hover:bg-white/20"
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Browse and select from our collection of AR lenses
          </p>
          <Badge variant="secondary" className="mt-2">
            {mockLenses.length} lenses available
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockLenses.map((lens) => (
            <Card
              key={lens.id}
              className="hover-elevate active-elevate-2 cursor-pointer overflow-hidden border-0"
              onClick={() => handleLensClick(lens)}
              data-testid={`card-lens-${lens.id}`}
            >
              <CardContent className="p-0 relative">
                <div className="aspect-video relative">
                  <img
                    src={lens.coverImage}
                    alt={lens.displayName}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <div className="mb-2">
                      <span className="text-sm font-bold tracking-wider bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-md inline-block">
                        {lens.name}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 drop-shadow-2xl" data-testid={`text-lens-name-${lens.id}`}>
                      {lens.displayName}
                    </h3>
                    <p className="text-sm opacity-80 font-medium">
                      Tap to try
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function Marketplace() {
  return (
    <AuthGuard>
      <MarketplaceContent />
    </AuthGuard>
  );
}
