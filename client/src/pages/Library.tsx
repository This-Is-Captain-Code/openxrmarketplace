import { useLocation } from 'wouter';
import AuthGuard from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { LogOut, ArrowLeft } from 'lucide-react';
import { useLicense } from '@/hooks/useLicense';
import { mockLenses } from '@/pages/Marketplace';

function LibraryContent() {
  const [, setLocation] = useLocation();
  const { logout } = usePrivy();

  // Filter lenses that user owns
  const ownedLenses = mockLenses.filter(lens => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { hasLicense } = useLicense(lens.id);
    return hasLicense;
  });

  return (
    <div className="min-h-screen bg-background dark">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-background/95 dark:supports-[backdrop-filter]:dark:bg-background/60">
        <div className="flex h-16 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setLocation('/')}
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-2xl font-bold" style={{ fontFamily: 'Lexlox, sans-serif', color: '#C1FF72' }}>
              Your Library
            </div>
          </div>
          <Button
            onClick={logout}
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">My AR Filters</h1>
          <p className="text-muted-foreground">
            {ownedLenses.length} filter{ownedLenses.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>

        {ownedLenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-gray-400 text-lg mb-6">No filters owned yet</p>
            <Button
              onClick={() => setLocation('/')}
              style={{ backgroundColor: '#C1FF72', color: '#000' }}
              className="font-semibold"
            >
              Browse Filters
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-start">
            {ownedLenses.map((lens) => (
              <div key={lens.id} className="flex flex-col items-center">
                {/* Gray background container with padding */}
                <div className="bg-gray-800/50 rounded-2xl p-3 mb-3 group cursor-pointer transition-all duration-200 hover:scale-105" onClick={() => setLocation(`/camera/${lens.id}`)}>
                  {/* Compact Image Card */}
                  <div
                    className="overflow-hidden rounded-xl relative"
                    style={{ width: '150px', height: '150px' }}
                    data-testid={`card-library-${lens.id}`}
                  >
                    <img
                      src={lens.coverImage}
                      alt={lens.displayName}
                      className="w-full h-full object-cover"
                    />
                    {/* Badge positioned on image - top right */}
                    <div className="absolute top-2 right-2 z-10">
                      <span className="inline-block font-bold text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#C1FF72', color: '#000' }}>
                        {lens.name.split(' ')[1] || lens.name}
                      </span>
                    </div>

                    {/* Hover Overlay with Button */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-2">
                      <Button
                        className="w-full text-xs h-7 font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/camera/${lens.id}`);
                        }}
                        style={{ backgroundColor: '#C1FF72', color: '#000' }}
                        data-testid={`button-library-use-${lens.id}`}
                      >
                        Use
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Title Below Card */}
                <h4 
                  className="text-xs font-semibold text-white truncate text-center" 
                  data-testid={`text-library-name-${lens.id}`}
                  style={{ width: '150px' }}
                >
                  {lens.displayName}
                </h4>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Library() {
  return (
    <AuthGuard>
      <LibraryContent />
    </AuthGuard>
  );
}
