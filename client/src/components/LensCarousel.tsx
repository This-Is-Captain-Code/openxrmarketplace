import { Lens } from '@/types/lens';

interface LensCarouselProps {
  lenses: Lens[];
  onLensSelect: (lens: Lens) => void;
  currentLensId?: string;
}

export default function LensCarousel({ lenses, onLensSelect, currentLensId }: LensCarouselProps) {
  return (
    <div className="absolute bottom-32 left-0 right-0 z-20 px-4" data-testid="carousel-lenses">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 min-w-max pb-2">
          {lenses.map((lens) => {
            const isSelected = currentLensId === lens.id;
            
            return (
              <button
                key={lens.id}
                data-testid={`button-lens-${lens.id}`}
                onClick={() => onLensSelect(lens)}
                className="flex-shrink-0 flex flex-col items-center gap-2 group"
                aria-label={`Apply ${lens.displayName} lens`}
              >
                <div className={`relative w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-primary scale-110 shadow-lg' 
                    : 'opacity-70 group-hover:opacity-100'
                }`}>
                  <img 
                    src={lens.coverImage} 
                    alt={lens.displayName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <p className="text-white text-xs font-medium text-center w-20 truncate">{lens.displayName}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
