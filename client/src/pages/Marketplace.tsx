import { useLocation } from 'wouter';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AuthGuard from '@/components/AuthGuard';
import { Lens } from '@/components/LensCarousel';

const mockLenses: Lens[] = [
  { id: '887d80da-f4ba-4a40-a0d6-4e4d0cfb31b1', name: 'Lens 1', groupId: 'b5551368-7881-4a23-a034-a0e757ec85a7' },
  { id: '43276710876', name: 'Lens 2', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43276930875', name: 'Lens 3', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43281170875', name: 'Lens 4', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43288720877', name: 'Lens 5', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43288930875', name: 'Lens 6', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43290810875', name: 'Lens 7', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43290830875', name: 'Lens 8', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43293650876', name: 'Lens 9', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43294710875', name: 'Lens 10', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43296870875', name: 'Lens 11', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43296900875', name: 'Lens 12', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
];

function MarketplaceContent() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button
            data-testid="button-back"
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            aria-label="Back to camera"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">Lens Marketplace</h1>
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockLenses.map((lens) => (
            <Card
              key={lens.id}
              className="hover-elevate active-elevate-2 cursor-pointer overflow-visible"
              onClick={() => setLocation('/')}
              data-testid={`card-lens-${lens.id}`}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-md mb-3 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1" data-testid={`text-lens-name-${lens.id}`}>
                  {lens.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  ID: {lens.id.substring(0, 8)}...
                </p>
                <Badge variant="outline" className="text-xs">
                  0.01 FLUID
                </Badge>
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
