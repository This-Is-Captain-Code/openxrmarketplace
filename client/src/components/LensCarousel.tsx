export interface Lens {
  id: string;
  name: string;
  iconUrl?: string;
  groupId?: string;
}

interface LensCarouselProps {
  lenses: Lens[];
  onLensSelect: (lens: Lens) => void;
  selectedLensId?: string;
}

export default function LensCarousel({ lenses, onLensSelect, selectedLensId }: LensCarouselProps) {
  const displayLenses = lenses.slice(0, 5);

  return (
    <div className="w-full flex items-center justify-center gap-3 px-4 pb-4" data-testid="carousel-lenses">
      {displayLenses.map((lens, index) => {
        const isSelected = selectedLensId === lens.id;
        const isCenter = index === 2;
        
        return (
          <button
            key={lens.id}
            data-testid={`button-lens-${lens.id}`}
            onClick={() => onLensSelect(lens)}
            className={`
              flex-shrink-0 rounded-full border-2
              transition-all duration-200
              ${isCenter 
                ? 'w-14 h-14' 
                : 'w-11 h-11'
              }
              ${isSelected 
                ? 'bg-white border-white scale-105' 
                : 'bg-white/20 border-white/40 backdrop-blur-sm hover:bg-white/30'
              }
            `}
            aria-label={`Apply ${lens.name} lens`}
          >
            {lens.iconUrl ? (
              <img 
                src={lens.iconUrl} 
                alt={lens.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center">
                <span className={`text-xs font-bold ${isSelected ? 'text-foreground' : 'text-white'}`}>
                  {index + 1}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
